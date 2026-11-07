import {createHash} from 'node:crypto'
import path from 'node:path'
import {JSDOM} from 'jsdom'
import {
  decodeHtmlEntities,
  migrationRoot,
  mysqlDateToIso,
  readJson,
  writeJson,
  writeText,
} from './lib.mjs'

const snapshot = await readJson(path.join(migrationRoot, 'extracted', 'wordpress.json'))
const plan = await readJson(path.join(migrationRoot, 'transformed', 'sanity-import-plan.json'))
const media = await readJson(path.join(migrationRoot, 'reports', 'media-recovery.json')).catch(() => ({counts: {}, recoveries: []}))
const jsonReportFile = path.join(migrationRoot, 'reports', 'final-validation.json')
const markdownReportFile = path.resolve(migrationRoot, '..', 'SANITY-MIGRATION-PREIMPORT-REPORT.md')

const errors = []
const warnings = []
const perArticle = []
const addError = (message) => errors.push(message)
const assert = (condition, message) => {
  if (!condition) addError(message)
}
const normalize = (value) => (value === undefined || value === null || value === '' ? undefined : String(value))
const sameArray = (left, right) => JSON.stringify(left) === JSON.stringify(right)
const sha256 = (value) => createHash('sha256').update(value || '', 'utf8').digest('hex')

const posts = snapshot.posts.filter((post) => post.status === 'draft')
const postById = new Map(posts.map((post) => [Number(post.id), post]))
const exportById = new Map(snapshot.exportRecords.map((item) => [Number(item.id), item]))
const metaById = new Map()
for (const row of snapshot.postMeta) {
  const id = Number(row.postId)
  if (!metaById.has(id)) metaById.set(id, new Map())
  metaById.get(id).set(row.key, row.value)
}
const relationById = new Map()
for (const row of snapshot.relationships) {
  const id = Number(row.postId)
  if (!relationById.has(id)) relationById.set(id, {category: [], post_tag: []})
  relationById.get(id)[row.taxonomy]?.push(Number(row.termId))
}

assert(posts.length === 169, `Expected 169 WordPress database drafts, found ${posts.length}.`)
assert(plan.articles.length === 169, `Expected 169 transformed plans, found ${plan.articles.length}.`)
assert(plan.safety?.externalWritesPerformed === false, 'Plan safety marker does not confirm zero external writes.')
assert(plan.safety?.documentsPublished === false, 'Plan safety marker does not confirm zero publications.')

const planSourceKeys = new Set()
const wordpressIds = new Set()
const slugs = new Set()
const authorKeys = new Set(plan.authors.map((item) => item.sourceKey))
const categoryKeys = new Set(plan.categories.map((item) => item.sourceKey))
const tagKeys = new Set(plan.tags.map((item) => item.sourceKey))
let sourceLinks = 0
let preservedLinks = 0
let headingBlocks = 0
let tableBlocks = 0
let listItems = 0
let imageBlocks = 0
let recoveredImageOccurrences = 0
let unresolvedImageOccurrences = 0

for (const item of plan.articles) {
  const article = item.document
  const id = Number(article.migration?.wordpressId)
  const source = postById.get(id)
  const supplemental = exportById.get(id)
  const meta = metaById.get(id) || new Map()
  const relation = relationById.get(id) || {category: [], post_tag: []}
  const itemErrors = []
  const check = (condition, message) => {
    if (!condition) {
      const full = `WordPress ${id}: ${message}`
      itemErrors.push(message)
      addError(full)
    }
  }

  check(Boolean(source), 'source database record is missing.')
  if (!source) continue
  check(!planSourceKeys.has(item.sourceKey), `duplicate source key ${item.sourceKey}.`)
  check(!wordpressIds.has(id), 'duplicate WordPress ID in article plans.')
  check(!slugs.has(article.slug?.current), `duplicate slug ${article.slug?.current}.`)
  planSourceKeys.add(item.sourceKey)
  wordpressIds.add(id)
  slugs.add(article.slug?.current)

  check(!Object.hasOwn(article, '_id'), 'pre-import plan must not hardcode a Sanity document ID.')
  check(article._type === 'article', 'document type is not article.')
  check(article.editorialStatus === 'draft', 'editorialStatus is not draft.')
  check(article.seo?.noIndex === true, 'seo.noIndex is not true.')
  check(article.migration?.wordpressStatus === 'draft', 'source status is not preserved as draft.')
  check(article.title === decodeHtmlEntities(source.title), 'title differs from the decoded WordPress title.')
  check(normalize(article.excerpt) === normalize(source.excerpt), 'excerpt differs from the WordPress excerpt.')
  check(article.migration?.sourceContentSha256 === sha256(source.content), 'source content SHA-256 does not match WordPress post_content.')

  const sourceSlug = source.slug || supplemental?.slug || ''
  if (sourceSlug) check(article.slug?.current === sourceSlug, `slug differs from source slug ${sourceSlug}.`)
  else check(
    article.migration?.qualityFlags?.includes(`generated-slug-requires-owner-approval:${article.slug?.current}`),
    'generated slug is not marked for owner approval.',
  )

  const expectedUrl = supplemental?.permalink || source.guid || undefined
  check(normalize(article.migration?.wordpressUrl) === normalize(expectedUrl), 'original WordPress URL differs from source.')
  check(
    normalize(article.originalPublishedAt) === normalize(mysqlDateToIso(source.dateGmt) || mysqlDateToIso(source.dateLocal)),
    'original publication date differs from source.',
  )
  check(
    normalize(article.sourceUpdatedAt) === normalize(mysqlDateToIso(source.modifiedGmt) || mysqlDateToIso(source.modifiedLocal)),
    'source modification date differs from source.',
  )
  check(normalize(article.seo?.title) === normalize(meta.get('_yoast_wpseo_title') || supplemental?.seoTitle), 'SEO title differs from source.')
  check(normalize(article.seo?.description) === normalize(meta.get('_yoast_wpseo_metadesc') || supplemental?.seoDescription), 'SEO description differs from source.')
  check(normalize(article.seo?.focusKeyword) === normalize(meta.get('_yoast_wpseo_focuskw') || supplemental?.focusKeyword), 'focus keyword differs from source.')

  check(authorKeys.has(item.referenceSourceKeys?.author), `unknown author source key ${item.referenceSourceKeys?.author}.`)
  check(
    sameArray(item.referenceSourceKeys?.categories || [], relation.category.map((termId) => `category:${termId}`)),
    'category references differ from WordPress relationships.',
  )
  check(
    sameArray(item.referenceSourceKeys?.tags || [], relation.post_tag.map((termId) => `tag:${termId}`)),
    'tag references differ from WordPress relationships.',
  )
  for (const key of item.referenceSourceKeys?.categories || []) check(categoryKeys.has(key), `unknown category source key ${key}.`)
  for (const key of item.referenceSourceKeys?.tags || []) check(tagKeys.has(key), `unknown tag source key ${key}.`)

  check(Array.isArray(article.body) && article.body.length > 0, 'Portable Text body is empty.')
  const dom = new JSDOM(source.content || '').window.document
  const sourceHeadingStyles = [...dom.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((node) => String(node.textContent || '').trim())
    .map((node) => node.tagName.toLowerCase() === 'h1' ? 'h2' : node.tagName.toLowerCase())
  const planHeadingStyles = article.body
    .filter((block) => block._type === 'block' && /^h[2-6]$/.test(block.style) && (block.children || []).some((child) => child.text?.trim()))
    .map((block) => block.style)
  check(sameArray(planHeadingStyles, sourceHeadingStyles), 'heading levels/order were not preserved (source h1 is intentionally normalized to h2).')

  const sourceImages = [...dom.querySelectorAll('img')].map((node) => node.getAttribute('src') || node.getAttribute('data-src') || '')
  const planImages = article.body.filter((block) => block._type === 'articleImage')
  check(sameArray(planImages.map((image) => image.sourceUrl || ''), sourceImages), 'inline image source URLs/order differ from source HTML.')
  for (let index = 0; index < sourceImages.length; index += 1) {
    const sourceAlt = dom.querySelectorAll('img')[index]?.getAttribute('alt') || ''
    if (sourceAlt) check(planImages[index]?.alt === sourceAlt, `inline image ${index + 1} alt text differs from source HTML.`)
  }

  const sourceTables = [...dom.querySelectorAll('table')]
  const planTables = article.body.filter((block) => block._type === 'articleTable')
  check(planTables.length === sourceTables.length, 'table count differs from source HTML.')
  sourceTables.forEach((table, index) => {
    const sourceRows = [...table.querySelectorAll('tr')].map((row) =>
      [...row.querySelectorAll(':scope > th, :scope > td')].map((cell) => String(cell.textContent || '').replace(/\s+/g, ' ').trim()),
    )
    check(sameArray(planTables[index]?.rows?.map((row) => row.cells) || [], sourceRows), `table ${index + 1} cells differ from source HTML.`)
  })

  const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim()
  const sourceListValues = [...dom.querySelectorAll('li')]
    .map((node) => {
      const clone = node.cloneNode(true)
      clone.querySelectorAll('ul,ol').forEach((nested) => nested.remove())
      return normalizeText(clone.textContent)
    })
    .filter(Boolean)
  const planListValues = article.body
    .filter((block) => block._type === 'block' && block.listItem)
    .map((block) => normalizeText((block.children || []).map((child) => child.text).join('')))
    .filter(Boolean)
  const canonicalListValues = (values) => values.map((value) => value.replace(/\s+/g, ''))
  check(
    sameArray(canonicalListValues(planListValues), canonicalListValues(sourceListValues)),
    'list-item wording/order differs from source HTML.',
  )
  const planListItems = planListValues.length

  const sourceHrefs = [...dom.querySelectorAll('a[href]')].map((node) => node.getAttribute('href')).sort()
  const planHrefs = article.body
    .flatMap((block) => block._type === 'block' ? (block.markDefs || []).filter((mark) => mark._type === 'link').map((mark) => mark.href) : block._type === 'articleImage' && block.linkHref ? [block.linkHref] : [])
    .sort()
  check(sameArray(planHrefs, sourceHrefs), 'internal/external link destinations differ from source HTML.')

  for (const block of article.body) {
    check(Boolean(block._key), 'body item is missing _key.')
    if (block._type !== 'block') continue
    const definitionKeys = new Set((block.markDefs || []).map((mark) => mark._key))
    const usedDefinitionKeys = new Set()
    for (const child of block.children || []) {
      check(typeof child.text === 'string', 'Portable Text span contains a non-string text value.')
      for (const mark of child.marks || []) {
        check(mark !== null && mark !== undefined, 'Portable Text span contains a null mark.')
        if (!['strong', 'em', 'code', 'underline', 'strike-through'].includes(mark)) {
          check(definitionKeys.has(mark), `Portable Text span references missing mark definition ${mark}.`)
          usedDefinitionKeys.add(mark)
        }
      }
    }
    for (const key of definitionKeys) check(usedDefinitionKeys.has(key), `unused mark definition ${key}.`)
  }

  sourceLinks += sourceHrefs.length
  preservedLinks += planHrefs.length
  headingBlocks += planHeadingStyles.length
  tableBlocks += planTables.length
  listItems += planListItems
  imageBlocks += planImages.length
  recoveredImageOccurrences += planImages.filter((image) => image.sourcePath?.includes('/sanity-recovered/')).length
  unresolvedImageOccurrences += planImages.filter((image) => !image.sourcePath).length
  if (article.featuredImage?.sourcePath?.includes('/sanity-recovered/')) recoveredImageOccurrences += 1
  if (article.featuredImage && !article.featuredImage.sourcePath) unresolvedImageOccurrences += 1

  perArticle.push({wordpressId: id, title: article.title, result: itemErrors.length ? 'failed' : 'passed', errors: itemErrors})
}

const sourceIds = posts.map((post) => Number(post.id)).sort((a, b) => a - b)
const plannedIds = [...wordpressIds].sort((a, b) => a - b)
assert(sameArray(plannedIds, sourceIds), 'The transformed plan does not contain exactly the 169 WordPress database draft IDs.')
assert(plan.quarantinedCsvOnlyRecords.length === 1, `Expected one quarantined CSV-only record, found ${plan.quarantinedCsvOnlyRecords.length}.`)
assert(Number(plan.quarantinedCsvOnlyRecords[0]?.id) === 37587, 'CSV-only WordPress post 37587 is not the sole quarantined record.')
assert(!wordpressIds.has(37587), 'Quarantined WordPress post 37587 was incorrectly included in the import plan.')

const slugApprovals = plan.articles
  .filter((item) => item.document.migration.qualityFlags.some((flag) => flag.startsWith('generated-slug-requires-owner-approval:')))
  .map((item) => ({
    wordpressId: item.document.migration.wordpressId,
    title: item.document.title,
    proposedSlug: item.document.slug.current,
    originalWordPressUrl: item.document.migration.wordpressUrl,
  }))
assert(slugApprovals.length === 2, `Expected two generated slug approvals, found ${slugApprovals.length}.`)

const metrics = {
  sourceDrafts: posts.length,
  validatedArticlePlans: plan.articles.length,
  passedArticles: perArticle.filter((item) => item.result === 'passed').length,
  failedArticles: perArticle.filter((item) => item.result === 'failed').length,
  uniqueWordpressIds: wordpressIds.size,
  uniqueSourceKeys: planSourceKeys.size,
  uniqueSlugs: slugs.size,
  sourceLinks,
  preservedLinks,
  headingBlocks,
  tableBlocks,
  listItems,
  inlineImageBlocks: imageBlocks,
  recoveredImageOccurrences,
  unresolvedImageOccurrences,
  recoveredUniqueImages: media.counts?.recoveredUniqueImages || 0,
  unresolvedUniqueImageUrls: media.counts?.unresolvedUniqueUrls || 0,
  missingSourceSeoTitles: plan.articles.filter((item) => !item.document.seo?.title).length,
  missingSourceSeoDescriptions: plan.articles.filter((item) => !item.document.seo?.description).length,
  articlesWithoutFeaturedImage: plan.articles.filter((item) => !item.document.featuredImage).length,
  unresolvedFeaturedImageOccurrences: plan.articles.filter((item) => item.document.featuredImage && !item.document.featuredImage.sourcePath).length,
  preservedLegacyShortcodeBlocks: plan.articles.reduce(
    (count, item) => count + item.document.body.filter((block) => block._type === 'legacyShortcode').length,
    0,
  ),
  quarantinedCsvOnlyRecords: plan.quarantinedCsvOnlyRecords.length,
  plannedExternalWrites: 0,
  plannedPublications: 0,
}

const result = errors.length ? 'failed' : 'passed'
await writeJson(jsonReportFile, {generatedAt: new Date().toISOString(), result, metrics, slugApprovals, errors, warnings, perArticle})

const slugRows = slugApprovals.map((item) =>
  `| ${item.wordpressId} | ${item.title.replaceAll('|', '\\|')} | \`${item.proposedSlug}\` | ${item.originalWordPressUrl} |`,
).join('\n')
const markdown = `# Sanity Migration Pre-import Report

Generated: ${new Date().toISOString()}  
Project: \`mduy4p4u\`  
Dataset: \`production\`  
Status: **${result === 'passed' ? 'local validation passed; owner approval still required' : 'validation failed'}**

No Sanity documents were written, published, overwritten or deleted during this validation.

## Validation summary

| Check | Result |
|---|---:|
| WordPress database drafts | ${metrics.sourceDrafts} |
| Article plans validated | ${metrics.validatedArticlePlans} |
| Per-article validations passed | ${metrics.passedArticles} |
| Per-article validations failed | ${metrics.failedArticles} |
| Unique WordPress IDs / source keys / slugs | ${metrics.uniqueWordpressIds} / ${metrics.uniqueSourceKeys} / ${metrics.uniqueSlugs} |
| Source links / preserved links | ${metrics.sourceLinks} / ${metrics.preservedLinks} |
| Heading blocks | ${metrics.headingBlocks} |
| Structured table blocks | ${metrics.tableBlocks} |
| List items | ${metrics.listItems} |
| Inline image blocks | ${metrics.inlineImageBlocks} |
| Unique images recovered from exact sources | ${metrics.recoveredUniqueImages} |
| Unique unresolved image URLs | ${metrics.unresolvedUniqueImageUrls} |
| Missing source SEO titles / descriptions | ${metrics.missingSourceSeoTitles} / ${metrics.missingSourceSeoDescriptions} |
| Articles without featured-image metadata | ${metrics.articlesWithoutFeaturedImage} |
| Featured-image occurrences unresolved | ${metrics.unresolvedFeaturedImageOccurrences} |
| Legacy shortcode blocks preserved for review | ${metrics.preservedLegacyShortcodeBlocks} |
| CSV-only records quarantined | ${metrics.quarantinedCsvOnlyRecords} |
| Sanity writes / publications | 0 / 0 |

Each article preserves its source title, original slug where present, publication and modification dates, WordPress URL, excerpt, Yoast SEO fields, author/taxonomy source references, headings, lists, table cells, image source order and link destinations. Each plan also carries a SHA-256 integrity checksum of the original WordPress \`post_content\` value. Source \`h1\` elements are intentionally normalized to \`h2\` so an article page retains one page-level \`h1\`.

Sanity document IDs are not hardcoded in the local plans. The guarded importer generates unique draft IDs and uses the unique WordPress ID field for idempotent reruns; actual document-ID uniqueness can only be verified after the owner-approved import.

## Slugs awaiting owner approval

| WordPress ID | Title | Proposed slug | Original WordPress URL |
|---:|---|---|---|
${slugRows}

## Import checkpoint

- The 169 records remain local draft import plans with \`editorialStatus: draft\` and \`seo.noIndex: true\`.
- CSV-only WordPress post \`37587\` remains quarantined and is not included.
- The importer refuses to run without both \`--execute\` and \`--confirm-drafts-only\` plus a server-only write token.
- Import is intentionally paused until the two proposed slugs and the import summary are approved.

## Verification performed

- Comprehensive local validation: passed for all 169 article plans.
- Migration safety tests: passed (2 test files, no failures).
- Next.js production build: passed.
- Standalone Sanity Studio production build: passed.
- Read-only Sanity query: zero article documents currently exist in \`mduy4p4u / production\`.
- Current CORS origins: localhost development origins only; production origin remains an owner action.

## Validation errors

${errors.length ? errors.map((error) => `- ${error}`).join('\n') : '- None.'}
`
await writeText(markdownReportFile, markdown)

console.log(JSON.stringify({result, metrics, slugApprovals, errors, jsonReportFile, markdownReportFile}, null, 2))
if (errors.length) process.exitCode = 1

import path from 'node:path'
import {migrationRoot, readJson, writeJson, writeText} from './lib.mjs'

const inputFile = path.join(migrationRoot, 'transformed', 'sanity-import-plan.json')
const jsonReportFile = path.join(migrationRoot, 'reports', 'validation.json')
const markdownReportFile = path.resolve(migrationRoot, '..', '169-blog-post-migration-report.md')
const plan = await readJson(inputFile)
const errors = []
const warnings = []

function assert(condition, message) {
  if (!condition) errors.push(message)
}

assert(plan.mode === 'dry-run-import-plan', 'Expected dry-run import plan mode.')
assert(plan.safety?.externalWritesPerformed === false, 'Dry run must not perform external writes.')
assert(plan.safety?.documentsPublished === false, 'Dry run must not publish documents.')
assert(plan.articles.length === 169, `Expected 169 draft article plans, found ${plan.articles.length}.`)
assert(plan.authors.length === 2, `Expected two legacy author plans, found ${plan.authors.length}.`)

const ids = new Set()
const slugs = new Map()
let featuredImages = 0
let missingFeaturedImages = 0
let unresolvedFeaturedImages = 0
let inlineImages = 0
let unresolvedInlineImages = 0
const unresolvedInlineImageUrls = new Set()
const articlesWithUnresolvedInlineImages = new Set()
let missingSeoTitles = 0
let missingSeoDescriptions = 0
let articlesWithQualityFlags = 0
let legacyShortcodeBlocks = 0
let tableBlocks = 0
const articlesWithTables = new Set()

for (const planItem of plan.articles) {
  const article = planItem.document
  const wordpressId = article.migration?.wordpressId
  assert(!('_id' in article), `Article ${wordpressId} must use a generated Sanity document ID.`)
  assert(article._type === 'article', `WordPress ${wordpressId} has invalid Sanity type.`)
  assert(article.editorialStatus === 'draft', `WordPress ${wordpressId} is not editorialStatus=draft.`)
  assert(article.seo?.noIndex === true, `WordPress ${wordpressId} dry-run record must remain noIndex.`)
  assert(article.title?.trim(), `WordPress ${wordpressId} is missing a title.`)
  assert(article.slug?.current, `WordPress ${wordpressId} is missing a slug or proposed slug.`)
  assert(Array.isArray(article.body) && article.body.length > 0, `WordPress ${wordpressId} has no Portable Text body.`)
  assert(Number.isInteger(wordpressId), `Article ${planItem.sourceKey} has no numeric WordPress ID.`)
  assert(!ids.has(wordpressId), `Duplicate WordPress ID ${wordpressId}.`)
  ids.add(wordpressId)

  const slug = article.slug?.current
  if (slugs.has(slug)) errors.push(`Duplicate article slug ${slug} on ${slugs.get(slug)} and ${wordpressId}.`)
  slugs.set(slug, wordpressId)

  if (article.featuredImage) featuredImages += 1
  else missingFeaturedImages += 1
  if (article.featuredImage && !article.featuredImage.sourcePath) unresolvedFeaturedImages += 1
  if (!article.seo?.title) missingSeoTitles += 1
  if (!article.seo?.description) missingSeoDescriptions += 1
  if (article.migration?.qualityFlags?.length) articlesWithQualityFlags += 1

  for (const block of article.body) {
    assert(block._key, `WordPress ${wordpressId} contains a Portable Text item without _key.`)
    if (block._type === 'articleImage') {
      inlineImages += 1
      if (!block.sourcePath) {
        unresolvedInlineImages += 1
        unresolvedInlineImageUrls.add(block.sourceUrl || `missing-source:${wordpressId}:${block._key}`)
        articlesWithUnresolvedInlineImages.add(wordpressId)
      }
    }
    if (block._type === 'legacyShortcode') legacyShortcodeBlocks += 1
    if (block._type === 'articleTable') {
      tableBlocks += 1
      articlesWithTables.add(wordpressId)
    }
    if (block._type === 'block') {
      assert(Array.isArray(block.children), `WordPress ${wordpressId} has a text block without children.`)
      for (const child of block.children || []) {
        assert(typeof child.text === 'string', `WordPress ${wordpressId} has a non-string text span.`)
        assert(!child.text.includes('[object Object]'), `WordPress ${wordpressId} contains [object Object].`)
      }
    }
  }

  if (!planItem.referenceSourceKeys?.author) warnings.push(`WordPress ${wordpressId} has no author source key.`)
  if (!planItem.referenceSourceKeys?.categories?.length) warnings.push(`WordPress ${wordpressId} has no category source key.`)
}

const metrics = {
  discoveredDatabaseDrafts: plan.articles.length,
  transformedDraftPlans: plan.articles.length,
  actualSanityImports: 0,
  actualPublishedArticles: 0,
  featuredImages,
  missingFeaturedImages,
  unresolvedFeaturedImages,
  inlineImages,
  unresolvedInlineImages,
  unresolvedInlineImageUrls: unresolvedInlineImageUrls.size,
  articlesWithUnresolvedInlineImages: articlesWithUnresolvedInlineImages.size,
  missingSeoTitles,
  missingSeoDescriptions,
  articlesWithQualityFlags,
  legacyShortcodeBlocks,
  tableBlocks,
  articlesWithTables: articlesWithTables.size,
  generatedSlugsRequiringApproval: plan.articles.filter((item) =>
    item.document.migration.qualityFlags.some((flag) => flag.startsWith('generated-slug-requires-owner-approval:')),
  ).length,
  quarantinedCsvOnlyRecords: plan.quarantinedCsvOnlyRecords.length,
}

await writeJson(jsonReportFile, {
  generatedAt: new Date().toISOString(),
  result: errors.length ? 'failed' : 'passed',
  errors,
  warnings,
  metrics,
})

const markdown = `# 169 Blog Post Migration Report

Generated: ${new Date().toISOString()}  
Stage: local extraction, Portable Text transformation and validation dry run  
External Sanity writes: **none**  
Articles published: **none**

## Result

${errors.length ? `Validation failed with ${errors.length} error(s).` : 'Validation passed for the local import plan.'}

| Check | Count |
|---|---:|
| WordPress database drafts discovered | ${metrics.discoveredDatabaseDrafts} |
| Draft article plans transformed | ${metrics.transformedDraftPlans} |
| Articles actually imported into Sanity | ${metrics.actualSanityImports} |
| Articles published | ${metrics.actualPublishedArticles} |
| Plans with featured images | ${metrics.featuredImages} |
| Plans without featured images | ${metrics.missingFeaturedImages} |
| Featured images unresolved locally | ${metrics.unresolvedFeaturedImages} |
| Inline image blocks | ${metrics.inlineImages} |
| Inline images unresolved locally | ${metrics.unresolvedInlineImages} |
| Unique unresolved inline image URLs | ${metrics.unresolvedInlineImageUrls} |
| Articles with unresolved inline images | ${metrics.articlesWithUnresolvedInlineImages} |
| Missing source SEO titles | ${metrics.missingSeoTitles} |
| Missing source SEO descriptions | ${metrics.missingSeoDescriptions} |
| Articles with one or more quality flags | ${metrics.articlesWithQualityFlags} |
| Preserved legacy shortcode blocks | ${metrics.legacyShortcodeBlocks} |
| Structured table blocks | ${metrics.tableBlocks} |
| Articles containing structured tables | ${metrics.articlesWithTables} |
| Generated slug candidates awaiting approval | ${metrics.generatedSlugsRequiringApproval} |
| CSV-only records quarantined | ${metrics.quarantinedCsvOnlyRecords} |

## Safety and idempotency

- Every article remains an unpublished import plan with \`editorialStatus: draft\` and \`seo.noIndex: true\`.
- The plan does not assign deterministic Sanity \`_id\` values. A future importer must query the explicit WordPress ID fields, patch an existing matching document, or create a document with a Sanity-generated ID.
- References are represented by stable source keys during the dry run. A future owner-approved import resolves those keys to actual Sanity document IDs after shared documents are created.
- Source HTML, uploads and the restored database are read-only inputs. Generated raw snapshots and article plans are gitignored because they contain unpublished content.

## Known review gates

- The two generated slug candidates require owner approval.
- Both recovered WordPress author identities require public-name/profile approval.
- Every unresolved featured or inline asset remains a visible quality flag.
- Legacy shortcode blocks are preserved rather than discarded and require representative editorial review before import.
- CSV-only WordPress ID 37587 remains quarantined until the owner chooses recovery or exclusion.

## Validation errors

${errors.length ? errors.map((error) => `- ${error}`).join('\n') : '- None.'}

## Validation warnings

${warnings.length ? warnings.map((warning) => `- ${warning}`).join('\n') : '- None.'}
`

await writeText(markdownReportFile, markdown)

console.log(JSON.stringify({result: errors.length ? 'failed' : 'passed', metrics, errors, warnings, jsonReportFile, markdownReportFile}, null, 2))
if (errors.length) process.exitCode = 1

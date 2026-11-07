import {isDeepStrictEqual} from 'node:util'
import path from 'node:path'
import {createClient} from '@sanity/client'
import {migrationRoot, pathExists, readJson, writeJson} from './lib.mjs'

const envFile = path.join(migrationRoot, '.env.local')
if (await pathExists(envFile)) process.loadEnvFile(envFile)

const appEnvFile = path.resolve(migrationRoot, '..', '.env.local')
if (await pathExists(appEnvFile)) process.loadEnvFile(appEnvFile)

const projectId = (process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)?.trim()
const dataset = (process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET)?.trim()
const token = (process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN)?.trim()
if (!projectId || !dataset || !token) {
  throw new Error(
    'Remote verification requires a Sanity project ID, dataset, and read-capable API token.',
  )
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-11-06',
  useCdn: false,
  perspective: 'raw',
})

const plan = await readJson(path.join(migrationRoot, 'transformed', 'sanity-import-plan.json'))
const importReport = await readJson(path.join(migrationRoot, 'reports', 'sanity-import.json'))
const reportFile = path.join(migrationRoot, 'reports', 'sanity-verification.json')

const [articles, sharedDocuments, publishedArticleCount, assetCount] = await Promise.all([
  client.fetch(
    `*[_type == "article"]{
      _id,
      title,
      slug,
      body,
      featuredImage,
      author,
      categories,
      tags,
      editorialStatus,
      originalPublishedAt,
      sourceUpdatedAt,
      readingTimeMinutes,
      seo,
      migration
    }`,
    {},
    {perspective: 'raw'},
  ),
  client.fetch(
    `*[_type in ["author", "category", "tag"]]{_id, _type, wordpressId, name, slug}`,
    {},
    {perspective: 'raw'},
  ),
  client.fetch(
    'count(*[_type == "article" && !(_id in path("drafts.**"))])',
    {},
    {perspective: 'raw'},
  ),
  client.fetch('count(*[_type == "sanity.imageAsset"])', {}, {perspective: 'raw'}),
])

const failures = []
const check = (condition, message) => {
  if (!condition) failures.push(message)
}

const plannedArticlesById = new Map(
  plan.articles.map((item) => [String(item.document.migration.wordpressId), item]),
)
const remoteArticlesById = new Map()
const remoteSlugs = new Set()

for (const article of articles) {
  const wordpressId = String(article.migration?.wordpressId ?? '')
  check(wordpressId.length > 0, `Remote article ${article._id} has no migration.wordpressId.`)
  check(!remoteArticlesById.has(wordpressId), `Duplicate remote article WordPress ID ${wordpressId}.`)
  remoteArticlesById.set(wordpressId, article)
  const slug = article.slug?.current
  check(Boolean(slug), `Remote article WordPress ID ${wordpressId} has no slug.`)
  check(!remoteSlugs.has(slug), `Duplicate remote article slug ${slug}.`)
  remoteSlugs.add(slug)
}

const sharedBySourceKey = new Map()
const sharedCounts = {author: 0, category: 0, tag: 0}
for (const document of sharedDocuments) {
  const sourceKey = `${document._type}:${document.wordpressId}`
  check(!sharedBySourceKey.has(sourceKey), `Duplicate remote shared document ${sourceKey}.`)
  sharedBySourceKey.set(sourceKey, document)
  sharedCounts[document._type] += 1
  check(document._id.startsWith('drafts.'), `${sourceKey} is not a draft.`)
}

function expectedReference(sourceKey) {
  const target = sharedBySourceKey.get(sourceKey)
  return target?._id.replace(/^drafts\./, '')
}

function verifyReferences(remoteArticle, planItem) {
  const expectedAuthor = expectedReference(planItem.referenceSourceKeys.author)
  check(remoteArticle.author?._ref === expectedAuthor, `Article ${planItem.sourceKey} author reference differs.`)

  for (const [field, sourceKeys] of [
    ['categories', planItem.referenceSourceKeys.categories],
    ['tags', planItem.referenceSourceKeys.tags],
  ]) {
    const expected = sourceKeys.map(expectedReference).sort()
    const actual = (remoteArticle[field] || []).map((reference) => reference._ref).sort()
    check(isDeepStrictEqual(actual, expected), `Article ${planItem.sourceKey} ${field} references differ.`)
  }
}

async function verifyBody(remoteArticle, planItem) {
  const sourceBody = planItem.document.body || []
  const remoteBody = remoteArticle.body || []
  check(remoteBody.length === sourceBody.length, `Article ${planItem.sourceKey} body block count differs.`)

  for (let index = 0; index < sourceBody.length; index += 1) {
    const sourceBlock = sourceBody[index]
    const remoteBlock = remoteBody[index]
    if (!remoteBlock) continue

    if (sourceBlock._type !== 'articleImage') {
      check(
        isDeepStrictEqual(remoteBlock, sourceBlock),
        `Article ${planItem.sourceKey} body block ${index} differs from the prepared content.`,
      )
      continue
    }

    const resolved = Boolean(sourceBlock.sourcePath && (await pathExists(sourceBlock.sourcePath)))
    if (!resolved) {
      check(remoteBlock._type === 'migrationNote', `Article ${planItem.sourceKey} unresolved image ${index} is not preserved as a migration note.`)
      check(remoteBlock._key === sourceBlock._key, `Article ${planItem.sourceKey} unresolved image ${index} key differs.`)
      check(remoteBlock.sourceHtml === (sourceBlock.sourceUrl || ''), `Article ${planItem.sourceKey} unresolved image ${index} source URL differs.`)
      continue
    }

    check(remoteBlock._type === 'articleImage', `Article ${planItem.sourceKey} resolved image ${index} has the wrong type.`)
    check(Boolean(remoteBlock.asset?._ref), `Article ${planItem.sourceKey} resolved image ${index} has no Sanity asset.`)
    for (const field of ['_key', 'alt', 'caption', 'credit', 'linkHref', 'sourceUrl', 'wordpressAttachmentId']) {
      const expectedValue = field === 'alt' ? sourceBlock.alt || '' : sourceBlock[field] || undefined
      check(
        (remoteBlock[field] ?? undefined) === expectedValue,
        `Article ${planItem.sourceKey} resolved image ${index} field ${field} differs.`,
      )
    }
  }
}

for (const planItem of plan.articles) {
  const planned = planItem.document
  const wordpressId = String(planned.migration.wordpressId)
  const remote = remoteArticlesById.get(wordpressId)
  check(Boolean(remote), `Planned article ${planItem.sourceKey} is missing remotely.`)
  if (!remote) continue

  check(remote._id.startsWith('drafts.'), `Article ${planItem.sourceKey} is not a draft.`)
  check(remote.title === planned.title, `Article ${planItem.sourceKey} title differs.`)
  check(remote.slug?.current === planned.slug.current, `Article ${planItem.sourceKey} slug differs.`)
  check(remote.editorialStatus === 'draft', `Article ${planItem.sourceKey} editorialStatus is not draft.`)
  check(remote.seo?.noIndex === true, `Article ${planItem.sourceKey} noIndex is not enabled.`)
  check(remote.seo?.title === planned.seo?.title, `Article ${planItem.sourceKey} SEO title differs.`)
  check(remote.seo?.description === planned.seo?.description, `Article ${planItem.sourceKey} SEO description differs.`)
  check(remote.migration?.wordpressUrl === planned.migration.wordpressUrl, `Article ${planItem.sourceKey} original URL differs.`)
  check(remote.migration?.sourcePath === planned.migration.sourcePath, `Article ${planItem.sourceKey} source path differs.`)
  check(remote.migration?.sourceContentSha256 === planned.migration.sourceContentSha256, `Article ${planItem.sourceKey} source content hash differs.`)
  check(remote.originalPublishedAt === planned.originalPublishedAt, `Article ${planItem.sourceKey} publication date differs.`)
  check(remote.sourceUpdatedAt === planned.sourceUpdatedAt, `Article ${planItem.sourceKey} updated date differs.`)
  check((remote.readingTimeMinutes ?? undefined) === (planned.readingTimeMinutes ?? undefined), `Article ${planItem.sourceKey} reading time differs.`)

  verifyReferences(remote, planItem)
  await verifyBody(remote, planItem)

  const sourceFeatured = planned.featuredImage
  const resolvedFeatured = Boolean(sourceFeatured?.sourcePath && (await pathExists(sourceFeatured.sourcePath)))
  if (resolvedFeatured) {
    check(Boolean(remote.featuredImage?.asset?._ref), `Article ${planItem.sourceKey} featured image asset is missing.`)
    check(remote.featuredImage?.alt === (sourceFeatured.alt || ''), `Article ${planItem.sourceKey} featured image alt differs.`)
  } else {
    check(!remote.featuredImage, `Article ${planItem.sourceKey} unexpectedly has a featured image.`)
  }
}

for (const [wordpressId, remote] of remoteArticlesById) {
  check(plannedArticlesById.has(wordpressId), `Unexpected remote article ${remote._id} with WordPress ID ${wordpressId}.`)
}

check(articles.length === 169, `Expected 169 remote articles, found ${articles.length}.`)
check(publishedArticleCount === 0, `Expected 0 published articles, found ${publishedArticleCount}.`)
check(!remoteArticlesById.has('37587'), 'Quarantined WordPress post 37587 was imported.')
check(sharedCounts.author === plan.authors.length, `Expected ${plan.authors.length} authors, found ${sharedCounts.author}.`)
check(sharedCounts.category === plan.categories.length, `Expected ${plan.categories.length} categories, found ${sharedCounts.category}.`)
check(sharedCounts.tag === plan.tags.length, `Expected ${plan.tags.length} tags, found ${sharedCounts.tag}.`)

const actionCounts = importReport.actions.reduce((counts, action) => {
  counts[action.action] = (counts[action.action] || 0) + 1
  return counts
}, {})

const report = {
  generatedAt: new Date().toISOString(),
  projectId,
  dataset,
  passed: failures.length === 0,
  counts: {
    draftArticles: articles.filter((article) => article._id.startsWith('drafts.')).length,
    publishedArticles: publishedArticleCount,
    authors: sharedCounts.author,
    categories: sharedCounts.category,
    tags: sharedCounts.tag,
    imageAssetsInDataset: assetCount,
    createdDraftDocuments: actionCounts['create-draft'] || 0,
    uploadedAssets: actionCounts['upload-asset'] || 0,
    reusedAssets: actionCounts['reuse-asset'] || 0,
  },
  invariants: {
    uniqueWordpressIds: remoteArticlesById.size,
    uniqueSlugs: remoteSlugs.size,
    allArticlesDrafts: articles.every((article) => article._id.startsWith('drafts.')),
    allArticlesNoIndex: articles.every((article) => article.seo?.noIndex === true),
    quarantinedPost37587Absent: !remoteArticlesById.has('37587'),
    sourceContentHashesMatch: !failures.some((failure) => failure.includes('source content hash')),
    preparedBodiesMatch: !failures.some((failure) => failure.includes('body block')),
  },
  failures,
}

await writeJson(reportFile, report)
console.log(JSON.stringify({...report, failures: failures.slice(0, 20), reportFile}, null, 2))

if (failures.length > 0) process.exitCode = 1

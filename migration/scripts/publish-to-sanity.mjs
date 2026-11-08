import path from 'node:path'
import {createClient} from '@sanity/client'
import {migrationRoot, pathExists, writeJson} from './lib.mjs'

const execute = process.argv.includes('--execute')
const confirmed = process.argv.includes('--confirm-publish-all')
const expectedArgument = process.argv.find((argument) => argument.startsWith('--expected-articles='))
const expectedArticles = Number(expectedArgument?.split('=')[1])
const reportFile = path.join(migrationRoot, 'reports', 'sanity-publication.json')

const localEnvFile = path.join(migrationRoot, '.env.local')
if (await pathExists(localEnvFile)) process.loadEnvFile(localEnvFile)

const appEnvFile = path.resolve(migrationRoot, '..', '.env.local')
if (await pathExists(appEnvFile)) process.loadEnvFile(appEnvFile)

const projectId = (process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)?.trim()
const dataset = (process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET)?.trim()
const token = process.env.SANITY_API_WRITE_TOKEN?.trim()

if (!projectId || !dataset || !token) {
  throw new Error('Publishing requires the Sanity project ID, dataset, and a server-only write token.')
}

if (projectId !== 'mduy4p4u' || dataset !== 'production') {
  throw new Error(`Safety stop: expected mduy4p4u/production, received ${projectId}/${dataset}.`)
}

if (execute && (!confirmed || expectedArticles !== 169)) {
  throw new Error(
    'Safety stop: execution requires --confirm-publish-all and --expected-articles=169.',
  )
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-11-08',
  useCdn: false,
  perspective: 'raw',
})

const sourceProjection = `{
  _id,
  _rev,
  _type,
  title,
  name,
  "slug": slug.current,
  wordpressId,
  "migrationWordpressId": migration.wordpressId,
  "noIndex": seo.noIndex,
  editorialStatus,
  "authorRef": author._ref,
  "categoryRefs": categories[]._ref,
  "tagRefs": tags[]._ref
}`

async function fetchState() {
  const [documents, imageAssets] = await Promise.all([
    client.fetch(
      `*[
        (_type == "article" && defined(migration.wordpressId)) ||
        (_type in ["author", "category", "tag"] && defined(wordpressId))
      ]${sourceProjection}`,
      {},
      {perspective: 'raw'},
    ),
    client.fetch('count(*[_type == "sanity.imageAsset"])', {}, {perspective: 'raw'}),
  ])

  return {documents, imageAssets}
}

function splitState(documents) {
  const drafts = documents.filter((document) => document._id.startsWith('drafts.'))
  const published = documents.filter((document) => !document._id.startsWith('drafts.'))
  return {drafts, published}
}

function sourceKey(document) {
  const wordpressId = document._type === 'article'
    ? document.migrationWordpressId
    : document.wordpressId
  return `${document._type}:${wordpressId}`
}

function countsByType(documents) {
  return documents.reduce((counts, document) => {
    counts[document._type] = (counts[document._type] || 0) + 1
    return counts
  }, {})
}

function duplicateKeys(documents) {
  const seen = new Set()
  const duplicates = new Set()
  for (const document of documents) {
    const key = sourceKey(document)
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  }
  return [...duplicates]
}

function ensurePreflight(documents) {
  const {drafts, published} = splitState(documents)
  const allArticles = documents.filter((document) => document._type === 'article')
  const draftArticles = drafts.filter((document) => document._type === 'article')
  const publishedArticles = published.filter((document) => document._type === 'article')
  const uniqueArticleKeys = new Set(allArticles.map(sourceKey))
  const uniqueArticleSlugs = new Set(allArticles.map((document) => document.slug))
  const duplicates = duplicateKeys(drafts)
  const quarantinedPresent = allArticles.some(
    (document) => String(document.migrationWordpressId) === '37587',
  )

  if (uniqueArticleKeys.size !== 169 || uniqueArticleSlugs.size !== 169) {
    throw new Error(
      `Safety stop: expected 169 unique article source IDs/slugs; found ${uniqueArticleKeys.size}/${uniqueArticleSlugs.size}.`,
    )
  }
  if (draftArticles.length + publishedArticles.length < 169) {
    throw new Error('Safety stop: one or more imported articles are missing.')
  }
  if (duplicates.length) {
    throw new Error(`Safety stop: duplicate draft source records: ${duplicates.join(', ')}`)
  }
  if (quarantinedPresent) {
    throw new Error('Safety stop: quarantined WordPress post 37587 is present.')
  }

  const expectedShared = {author: 2, category: 22, tag: 213}
  const uniqueShared = new Map()
  for (const document of documents.filter((item) => item._type !== 'article')) {
    uniqueShared.set(sourceKey(document), document)
  }
  const sharedCounts = countsByType([...uniqueShared.values()])
  for (const [type, count] of Object.entries(expectedShared)) {
    if ((sharedCounts[type] || 0) !== count) {
      throw new Error(
        `Safety stop: expected ${count} unique ${type} records; found ${sharedCounts[type] || 0}.`,
      )
    }
  }

  const normalizedSharedIds = new Set(
    documents
      .filter((document) => document._type !== 'article')
      .map((document) => document._id.replace(/^drafts\./, '')),
  )
  const brokenReferences = []
  for (const article of allArticles) {
    for (const reference of [
      article.authorRef,
      ...(article.categoryRefs || []),
      ...(article.tagRefs || []),
    ].filter(Boolean)) {
      if (!normalizedSharedIds.has(reference)) {
        brokenReferences.push(`${article._id} -> ${reference}`)
      }
    }
  }
  if (brokenReferences.length) {
    throw new Error(`Safety stop: ${brokenReferences.length} broken taxonomy/author references found.`)
  }

  return {
    draftCounts: countsByType(drafts),
    publishedCounts: countsByType(published),
    articleCategories: allArticles.reduce(
      (counts, article) => {
        const amount = article.categoryRefs?.length || 0
        if (amount === 0) counts.withoutCategory += 1
        else counts.withCategory += 1
        return counts
      },
      {withCategory: 0, withoutCategory: 0},
    ),
  }
}

function chunks(items, size = 25) {
  const groups = []
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size))
  }
  return groups
}

async function prepareArticleDrafts(articleDrafts) {
  for (const [index, group] of chunks(articleDrafts).entries()) {
    let transaction = client.transaction()
    for (const article of group) {
      transaction = transaction.patch(article._id, (patch) =>
        patch
          .ifRevisionId(article._rev)
          .set({'seo.noIndex': false, editorialStatus: 'approved'}),
      )
    }
    await transaction.commit({visibility: 'sync'})
    console.log(`Prepared article metadata: ${Math.min((index + 1) * 25, articleDrafts.length)}/${articleDrafts.length}.`)
  }
}

async function publishDrafts(documents, label) {
  let completed = 0
  for (const group of chunks(documents).values()) {
    await client.action(
      group.map((document) => ({
        actionType: 'sanity.action.document.publish',
        draftId: document._id,
        publishedId: document._id.replace(/^drafts\./, ''),
        ifDraftRevisionId: document._rev,
      })),
    )
    completed += group.length
    console.log(`Published ${label}: ${completed}/${documents.length}.`)
  }
}

const before = await fetchState()
const preflight = ensurePreflight(before.documents)
const {drafts: draftsBefore} = splitState(before.documents)

const preview = {
  projectId,
  dataset,
  mode: execute ? 'execute' : 'dry-run',
  preflight,
  plannedPublications: countsByType(draftsBefore),
}

if (!execute) {
  console.log(JSON.stringify(preview, null, 2))
  process.exit(0)
}

const sharedDrafts = draftsBefore.filter((document) => document._type !== 'article')
const articleDrafts = draftsBefore.filter((document) => document._type === 'article')

if (sharedDrafts.length) await publishDrafts(sharedDrafts, 'authors/categories/tags')
if (articleDrafts.length) {
  await prepareArticleDrafts(articleDrafts)
  const refreshedArticles = await client.fetch(
    `*[_type == "article" && _id in path("drafts.**") && defined(migration.wordpressId)]${sourceProjection}`,
    {},
    {perspective: 'raw'},
  )
  await publishDrafts(refreshedArticles, 'articles')
}

const after = await fetchState()
const {drafts: draftsAfter, published: publishedAfter} = splitState(after.documents)
const publishedCounts = countsByType(publishedAfter)
const publishedArticles = publishedAfter.filter((document) => document._type === 'article')
const publishedIds = new Set(publishedAfter.map((document) => document._id))
const brokenPublishedReferences = []

for (const article of publishedArticles) {
  for (const reference of [
    article.authorRef,
    ...(article.categoryRefs || []),
    ...(article.tagRefs || []),
  ].filter(Boolean)) {
    if (!publishedIds.has(reference)) {
      brokenPublishedReferences.push(`${article._id} -> ${reference}`)
    }
  }
}

const failures = []
if (draftsAfter.length !== 0) failures.push(`Expected 0 imported drafts, found ${draftsAfter.length}.`)
if (publishedCounts.article !== 169) failures.push(`Expected 169 published articles, found ${publishedCounts.article || 0}.`)
if (publishedCounts.author !== 2) failures.push(`Expected 2 published authors, found ${publishedCounts.author || 0}.`)
if (publishedCounts.category !== 22) failures.push(`Expected 22 published categories, found ${publishedCounts.category || 0}.`)
if (publishedCounts.tag !== 213) failures.push(`Expected 213 published tags, found ${publishedCounts.tag || 0}.`)
if (publishedArticles.some((article) => article.noIndex === true)) failures.push('One or more published articles still have noIndex enabled.')
if (publishedArticles.some((article) => article.editorialStatus !== 'approved')) failures.push('One or more published articles are not marked approved.')
if (brokenPublishedReferences.length) failures.push(`${brokenPublishedReferences.length} published references are broken.`)

const report = {
  generatedAt: new Date().toISOString(),
  projectId,
  dataset,
  passed: failures.length === 0,
  before: {
    importedDocuments: before.documents.length,
    imageAssets: before.imageAssets,
    ...preflight,
  },
  after: {
    drafts: draftsAfter.length,
    publishedCounts,
    publishedArticlesIndexable: publishedArticles.filter((article) => article.noIndex !== true).length,
    brokenPublishedReferences: brokenPublishedReferences.length,
    imageAssets: after.imageAssets,
  },
  failures,
}

await writeJson(reportFile, report)
console.log(JSON.stringify({...report, reportFile}, null, 2))

if (failures.length) process.exitCode = 1

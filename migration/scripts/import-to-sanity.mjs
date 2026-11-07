import {createHash, randomUUID} from 'node:crypto'
import {createReadStream} from 'node:fs'
import path from 'node:path'
import {createClient} from '@sanity/client'
import {migrationRoot, pathExists, readJson, stableKey, writeJson} from './lib.mjs'

const planFile = path.join(migrationRoot, 'transformed', 'sanity-import-plan.json')
const reportFile = path.join(migrationRoot, 'reports', 'sanity-import.json')
const plan = await readJson(planFile)
const execute = process.argv.includes('--execute')
const draftsOnlyConfirmed = process.argv.includes('--confirm-drafts-only')

if (!execute) {
  console.log(
    JSON.stringify(
      {
        mode: 'local-plan-only',
        externalReads: 0,
        externalWrites: 0,
        publications: 0,
        message:
          'No Sanity connection was attempted. To import after owner approval, configure server-only environment values and pass both --execute and --confirm-drafts-only.',
        planned: plan.counts,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

if (!draftsOnlyConfirmed) {
  throw new Error('Refusing external writes without --confirm-drafts-only.')
}

const localEnvFile = path.join(migrationRoot, '.env.local')
if (await pathExists(localEnvFile)) process.loadEnvFile(localEnvFile)

const projectId = process.env.SANITY_PROJECT_ID?.trim()
const dataset = process.env.SANITY_DATASET?.trim()
const token = process.env.SANITY_API_WRITE_TOKEN?.trim()
if (!projectId || !dataset || !token) {
  throw new Error(
    'Missing SANITY_PROJECT_ID, SANITY_DATASET, or SANITY_API_WRITE_TOKEN. Configure secrets outside source control.',
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

const actions = []
const sourceKeyToId = new Map()
const existingBySourceKey = new Map()
const assetByPath = new Map()
let assetActionCount = 0

function draftId() {
  return `drafts.${randomUUID()}`
}

async function preflightDraftSafety() {
  const checks = [
    ...plan.authors,
    ...plan.categories,
    ...plan.tags,
    ...plan.articles,
  ]

  const existingDocuments = await client.fetch(
    `*[
      _type in $types &&
      (defined(wordpressId) || defined(migration.wordpressId))
    ]{
      _id,
      _type,
      wordpressId,
      "migrationWordpressId": migration.wordpressId
    }`,
    {types: ['article', 'author', 'category', 'tag']},
    {perspective: 'raw'},
  )

  for (const existing of existingDocuments) {
    const wordpressId =
      existing._type === 'article' ? existing.migrationWordpressId : existing.wordpressId
    if (wordpressId === undefined || wordpressId === null) continue
    const sourceKey = `${existing._type}:${wordpressId}`
    const previousId = existingBySourceKey.get(sourceKey)
    if (previousId) {
      throw new Error(
        `Safety stop before writes: duplicate remote documents ${previousId} and ${existing._id} match ${sourceKey}.`,
      )
    }
    existingBySourceKey.set(sourceKey, existing._id)
  }

  for (const item of checks) {
    const existingId = existingBySourceKey.get(item.sourceKey)
    if (existingId && !String(existingId).startsWith('drafts.')) {
      throw new Error(
        `Safety stop before writes: ${item.sourceKey} already exists as published document ${existingId}.`,
      )
    }
  }

  console.log(`Preflight passed: ${checks.length} planned source records, ${existingBySourceKey.size} existing remote records.`)
}

async function upsertDraft(planItem, {migrationField = false} = {}) {
  const document = planItem.document
  const wordpressId = migrationField ? document.migration.wordpressId : document.wordpressId
  const existingId = existingBySourceKey.get(planItem.sourceKey)

  if (existingId && !String(existingId).startsWith('drafts.')) {
    throw new Error(
      `Safety stop: ${document._type} WordPress ID ${wordpressId} already exists as published document ${existingId}.`,
    )
  }

  if (existingId) {
    const {_type, ...fields} = document
    await client.patch(existingId).set(fields).commit()
    actions.push({action: 'patch-draft', sourceKey: planItem.sourceKey, documentId: existingId})
    sourceKeyToId.set(planItem.sourceKey, {
      draftId: existingId,
      publishedId: String(existingId).replace(/^drafts\./, ''),
      type: document._type,
    })
    existingBySourceKey.set(planItem.sourceKey, existingId)
    return existingId
  }

  const created = await client.create({...document, _id: draftId()})
  actions.push({action: 'create-draft', sourceKey: planItem.sourceKey, documentId: created._id})
  sourceKeyToId.set(planItem.sourceKey, {
    draftId: created._id,
    publishedId: String(created._id).replace(/^drafts\./, ''),
    type: document._type,
  })
  existingBySourceKey.set(planItem.sourceKey, created._id)
  return created._id
}

async function sha1File(file) {
  const hash = createHash('sha1')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

async function resolveAsset(assetPlan) {
  const sourcePath = assetPlan?.sourcePath
  if (!sourcePath || !(await pathExists(sourcePath))) return undefined
  if (assetByPath.has(sourcePath)) return assetByPath.get(sourcePath)

  const sha1hash = await sha1File(sourcePath)
  let assetId = await client.fetch(
    '*[_type == "sanity.imageAsset" && sha1hash == $sha1hash][0]._id',
    {sha1hash},
    {perspective: 'raw'},
  )

  if (!assetId) {
    const uploaded = await client.assets.upload('image', createReadStream(sourcePath), {
      filename: path.basename(sourcePath),
      source: {id: assetPlan.sourceUrl || assetPlan.relativePath || sourcePath, name: 'WordPress migration'},
    })
    assetId = uploaded._id
    actions.push({action: 'upload-asset', sha1hash, documentId: assetId})
  } else {
    actions.push({action: 'reuse-asset', sha1hash, documentId: assetId})
  }

  assetActionCount += 1
  if (assetActionCount % 25 === 0) {
    console.log(`Asset progress: ${assetActionCount} unique local images processed.`)
  }

  assetByPath.set(sourcePath, assetId)
  return assetId
}

function reference(sourceKey, index = 0) {
  const target = sourceKeyToId.get(sourceKey)
  if (!target) throw new Error(`Reference source key was not imported: ${sourceKey}`)
  return {
    _type: 'reference',
    _key: stableKey(`${sourceKey}:${index}`, 'r'),
    _ref: target.publishedId,
    _weak: true,
    _strengthenOnPublish: {type: target.type},
  }
}

async function importSharedDocuments() {
  for (const item of plan.authors) await upsertDraft(item)
  console.log(`Draft authors processed: ${plan.authors.length}.`)
  for (const item of plan.categories) await upsertDraft(item)
  console.log(`Draft categories processed: ${plan.categories.length}.`)
  for (const item of plan.tags) await upsertDraft(item)
  console.log(`Draft tags processed: ${plan.tags.length}.`)
}

async function prepareBody(articlePlan) {
  const body = []
  for (const block of articlePlan.document.body) {
    if (block._type !== 'articleImage') {
      body.push(block)
      continue
    }

    const assetId = await resolveAsset(block)
    if (!assetId) {
      body.push({
        _type: 'migrationNote',
        _key: block._key,
        reason: 'Inline image source was unresolved during import.',
        sourceHtml: block.sourceUrl || '',
      })
      continue
    }

    body.push({
      _type: 'articleImage',
      _key: block._key,
      asset: {_type: 'reference', _ref: assetId},
      alt: block.alt || '',
      caption: block.caption || undefined,
      credit: block.credit || undefined,
      linkHref: block.linkHref || undefined,
      sourceUrl: block.sourceUrl || undefined,
      wordpressAttachmentId: block.wordpressAttachmentId || undefined,
    })
  }
  return body
}

async function prepareFeaturedImage(featuredImage) {
  if (!featuredImage) return undefined
  const assetId = await resolveAsset(featuredImage)
  if (!assetId) return undefined
  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: assetId},
    alt: featuredImage.alt || '',
    caption: featuredImage.caption || undefined,
    credit: featuredImage.credit || undefined,
    wordpressAttachmentId: featuredImage.wordpressAttachmentId || undefined,
  }
}

async function importArticles() {
  for (const [index, item] of plan.articles.entries()) {
    const document = {
      ...item.document,
      body: await prepareBody(item),
      featuredImage: await prepareFeaturedImage(item.document.featuredImage),
      author: reference(item.referenceSourceKeys.author),
      categories: item.referenceSourceKeys.categories.map(reference),
      tags: item.referenceSourceKeys.tags.map(reference),
      editorialStatus: 'draft',
      seo: {...item.document.seo, noIndex: true},
    }
    await upsertDraft({...item, document}, {migrationField: true})
    const completed = index + 1
    if (completed % 20 === 0 || completed === plan.articles.length) {
      console.log(`Draft article progress: ${completed}/${plan.articles.length}.`)
    }
  }
}

await preflightDraftSafety()
await importSharedDocuments()
await importArticles()

const report = {
  generatedAt: new Date().toISOString(),
  projectId,
  dataset,
  safety: {draftsOnly: true, publications: 0},
  counts: {
    articles: plan.articles.length,
    authors: plan.authors.length,
    categories: plan.categories.length,
    tags: plan.tags.length,
    actions: actions.length,
  },
  actions,
}
await writeJson(reportFile, report)
console.log(JSON.stringify({...report, actions: undefined, reportFile}, null, 2))

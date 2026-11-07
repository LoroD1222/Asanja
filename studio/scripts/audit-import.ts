import {readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

type ArticleAuditRow = {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  bodyBlockCount: number
  featuredImageRef?: string
  bodyImageRefs?: string[]
  authorRef?: string
  categoryRefs?: string[]
  tagRefs?: string[]
  relatedArticleRefs?: string[]
  noIndex?: boolean
  wordpressId?: number
  wordpressUrl?: string
}

const here = path.dirname(fileURLToPath(import.meta.url))
const planPath = path.resolve(here, '../../migration/transformed/sanity-import-plan.json')
const reportPath = path.resolve(here, '../../migration/reports/sanity-studio-audit.json')
const plan = JSON.parse(await readFile(planPath, 'utf8')) as {
  articles: Array<{
    document: {
      migration: {wordpressId: number}
      title: string
      slug: {current: string}
      excerpt?: string
    }
  }>
}

const client = getCliClient({apiVersion: '2026-11-07'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})

const [articles, sharedDocuments, publishedArticles, imageAssets] = await Promise.all([
  client.fetch<ArticleAuditRow[]>(
    `*[_type == "article"]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      "bodyBlockCount": count(body),
      "featuredImageRef": featuredImage.asset._ref,
      "bodyImageRefs": body[_type == "articleImage"].asset._ref,
      "authorRef": author._ref,
      "categoryRefs": categories[]._ref,
      "tagRefs": tags[]._ref,
      "relatedArticleRefs": relatedArticles[]._ref,
      "noIndex": seo.noIndex,
      "wordpressId": migration.wordpressId,
      "wordpressUrl": migration.wordpressUrl
    }`,
    {},
    {perspective: 'raw'},
  ),
  client.fetch<Array<{_id: string; _type: string}>>(
    `*[_type in ["author", "category", "tag"]]{_id, _type}`,
    {},
    {perspective: 'raw'},
  ),
  client.fetch<number>(
    `count(*[_type == "article" && !(_id in path("drafts.**"))])`,
    {},
    {perspective: 'raw'},
  ),
  client.fetch<Array<{_id: string}>>(`*[_type == "sanity.imageAsset"]{_id}`, {}, {perspective: 'raw'}),
])

const normalizedSharedIds = new Set(
  sharedDocuments.map((document) => document._id.replace(/^drafts\./, '')),
)
const normalizedArticleIds = new Set(articles.map((article) => article._id.replace(/^drafts\./, '')))
const imageAssetIds = new Set(imageAssets.map((asset) => asset._id))
const plannedByWordpressId = new Map(
  plan.articles.map((item) => [String(item.document.migration.wordpressId), item]),
)
const remoteByWordpressId = new Map(
  articles.map((article) => [String(article.wordpressId ?? ''), article]),
)

const failures: string[] = []
const check = (condition: boolean, message: string) => {
  if (!condition) failures.push(message)
}

check(articles.length === 169, `Expected 169 articles, found ${articles.length}.`)
check(publishedArticles === 0, `Expected 0 published articles, found ${publishedArticles}.`)
check(remoteByWordpressId.size === 169, 'WordPress IDs are missing or duplicated.')
check(new Set(articles.map((article) => article.slug)).size === 169, 'Article slugs are missing or duplicated.')
check(!remoteByWordpressId.has('37587'), 'Quarantined WordPress post 37587 is present.')

for (const article of articles) {
  const sourceKey = `WordPress ${article.wordpressId ?? 'unknown'} / ${article._id}`
  check(article._id.startsWith('drafts.'), `${sourceKey} is not a draft.`)
  check(Boolean(article.title), `${sourceKey} has no title.`)
  check(Boolean(article.slug), `${sourceKey} has no slug.`)
  check(article.bodyBlockCount > 0, `${sourceKey} has no body blocks.`)
  check(article.noIndex === true, `${sourceKey} does not have noIndex enabled.`)
  check(Boolean(article.wordpressUrl), `${sourceKey} has no original WordPress URL.`)
  check(plannedByWordpressId.has(String(article.wordpressId)), `${sourceKey} is not in the import plan.`)
  const planned = plannedByWordpressId.get(String(article.wordpressId))?.document
  check(article.title === planned?.title, `${sourceKey} title differs from the prepared import.`)
  check(article.slug === planned?.slug.current, `${sourceKey} slug differs from the prepared import.`)
  check(
    (article.excerpt || undefined) === (planned?.excerpt || undefined),
    `${sourceKey} excerpt differs from the prepared import.`,
  )
  check(
    !article.authorRef || normalizedSharedIds.has(article.authorRef),
    `${sourceKey} has a broken author reference.`,
  )
  check(
    !article.featuredImageRef || imageAssetIds.has(article.featuredImageRef),
    `${sourceKey} has a broken featured image reference.`,
  )
  for (const ref of article.bodyImageRefs || []) {
    check(imageAssetIds.has(ref), `${sourceKey} has a broken inline image reference ${ref}.`)
  }
  for (const ref of [...(article.categoryRefs || []), ...(article.tagRefs || [])]) {
    check(normalizedSharedIds.has(ref), `${sourceKey} has a broken taxonomy reference ${ref}.`)
  }
  for (const ref of article.relatedArticleRefs || []) {
    check(normalizedArticleIds.has(ref), `${sourceKey} has a broken related article reference ${ref}.`)
  }
}

for (const wordpressId of plannedByWordpressId.keys()) {
  check(remoteByWordpressId.has(wordpressId), `Planned WordPress article ${wordpressId} is missing.`)
}

const sharedCounts = sharedDocuments.reduce<Record<string, number>>((counts, document) => {
  counts[document._type] = (counts[document._type] || 0) + 1
  return counts
}, {})

const relatedSource = articles.find(
  (article) => (article.categoryRefs?.length || 0) + (article.tagRefs?.length || 0) > 0,
)
const relatedSample = relatedSource
  ? await client.fetch<Array<{_id: string; title: string; slug: string}>>(
      `*[_type == "article" && _id in path("drafts.**") && _id != $articleId && (
        count(categories[_ref in $categoryIds]) > 0 ||
        count(tags[_ref in $tagIds]) > 0
      )] | order(coalesce(originalPublishedAt, _createdAt) desc)[0...3]{
        _id, title, "slug": slug.current
      }`,
      {
        articleId: relatedSource._id,
        categoryIds: relatedSource.categoryRefs || [],
        tagIds: relatedSource.tagRefs || [],
      },
      {perspective: 'raw'},
    )
  : []

const report = {
  generatedAt: new Date().toISOString(),
  projectId: client.config().projectId,
  dataset: client.config().dataset,
  passed: failures.length === 0,
  counts: {
    articles: articles.length,
    drafts: articles.filter((article) => article._id.startsWith('drafts.')).length,
    published: publishedArticles,
    withFeaturedImage: articles.filter((article) => article.featuredImageRef).length,
    missingFeaturedImage: articles.filter((article) => !article.featuredImageRef).length,
    withExcerpt: articles.filter((article) => article.excerpt).length,
    withoutExcerpt: articles.filter((article) => !article.excerpt).length,
    noIndexEnabled: articles.filter((article) => article.noIndex === true).length,
    authors: sharedCounts.author || 0,
    categories: sharedCounts.category || 0,
    tags: sharedCounts.tag || 0,
    imageAssets: imageAssets.length,
  },
  invariants: {
    uniqueWordpressIds: remoteByWordpressId.size,
    uniqueSlugs: new Set(articles.map((article) => article.slug)).size,
    allPlannedArticlesPresent: [...plannedByWordpressId.keys()].every((id) =>
      remoteByWordpressId.has(id),
    ),
    quarantinedPost37587Absent: !remoteByWordpressId.has('37587'),
    brokenReferences: failures.filter((failure) => failure.includes('broken')).length,
    relatedFallbackSample: {
      source: relatedSource
        ? {title: relatedSource.title, slug: relatedSource.slug}
        : null,
      candidates: relatedSample,
    },
  },
  failures,
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({...report, reportPath}, null, 2))

if (failures.length > 0) process.exitCode = 1

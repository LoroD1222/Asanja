import {defineQuery} from 'next-sanity'

export const articleCardFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  originalPublishedAt,
  readingTimeMinutes,
  featuredImage{
    ...,
    asset->{url, metadata{lqip, dimensions}}
  },
  author->{_id, name, "slug": slug.current},
  categories[]->{_id, title, "slug": slug.current, description},
  tags[]->{_id, title, "slug": slug.current, description}
`

const visibleArticleFilter = `_type == "article" && defined(slug.current) && ($includeDrafts == true || !(_id in path("drafts.**")))`

export function articlesQuery(start: number, end: number) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start) {
    throw new Error('Article pagination bounds must be positive integers.')
  }

  return defineQuery(`{
    "articles": *[${visibleArticleFilter}] | order(coalesce(originalPublishedAt, _createdAt) desc)[${start}...${end}]{
      ${articleCardFields}
    },
    "total": count(*[${visibleArticleFilter}])
  }`)
}

export const articleBySlugQuery = defineQuery(`
  *[${visibleArticleFilter} && slug.current == $slug][0]{
    ${articleCardFields},
    "categoryReferenceIds": categories[]._ref,
    "tagReferenceIds": tags[]._ref,
    body[]{
      ...,
      asset->{url, metadata{lqip, dimensions}}
    },
    author->{
      _id, name, "slug": slug.current, bio,
      image{..., asset->{url, metadata{lqip, dimensions}}}
    },
    relatedArticles[]->{${articleCardFields}},
    migration{wordpressUrl, sourcePath},
    seo{
      ...,
      openGraphImage{..., asset->{url, metadata{lqip, dimensions}}}
    }
  }
`)

export const relatedArticlesQuery = defineQuery(`
  *[${visibleArticleFilter} && _id != $articleId && (
    count(categories[_ref in $categoryIds]) > 0 ||
    count(tags[_ref in $tagIds]) > 0
  )]
    | order(coalesce(originalPublishedAt, _createdAt) desc)[0...3]{${articleCardFields}}
`)

export const taxonomyArticlesQuery = defineQuery(`{
  "taxonomy": *[_type == $type && slug.current == $slug && ($includeDrafts == true || !(_id in path("drafts.**")))][0]{
    _id, title, "slug": slug.current, description
  },
  "articles": *[${visibleArticleFilter} && references(*[_type == $type && slug.current == $slug]._id)]
    | order(coalesce(originalPublishedAt, _createdAt) desc){${articleCardFields}}
}`)

export const authorArticlesQuery = defineQuery(`{
  "author": *[_type == "author" && slug.current == $slug && ($includeDrafts == true || !(_id in path("drafts.**")))][0]{
    _id, name, "slug": slug.current, bio,
    image{..., asset->{url, metadata{lqip, dimensions}}}
  },
  "articles": *[${visibleArticleFilter} && author->slug.current == $slug]
    | order(coalesce(originalPublishedAt, _createdAt) desc){${articleCardFields}}
}`)

export const legacyArticleRedirectQuery = defineQuery(`
  *[${visibleArticleFilter} && (
    migration.wordpressId == $wordpressId ||
    migration.sourcePath == $sourcePath ||
    migration.wordpressUrl in $sourceUrls
  )][0]{"slug": slug.current}
`)

export const sitemapArticlesQuery = defineQuery(`
  *[_type == "article" && defined(slug.current) && !(_id in path("drafts.**")) && seo.noIndex != true]
    | order(coalesce(sourceUpdatedAt, _updatedAt) desc){
      "slug": slug.current,
      "lastModified": coalesce(sourceUpdatedAt, _updatedAt)
    }
`)

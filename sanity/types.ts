import type {PortableTextBlock} from 'next-sanity'

export type SanityImage = {
  _type: 'image' | 'articleImage'
  asset?: {url?: string; metadata?: {lqip?: string; dimensions?: {width?: number; height?: number}}}
  alt?: string
  caption?: string
  credit?: string
  linkHref?: string
  hotspot?: unknown
  crop?: unknown
}

export type Taxonomy = {_id: string; title: string; slug: string; description?: string}

export type Author = {
  _id: string
  name: string
  slug: string
  bio?: PortableTextBlock[]
  image?: SanityImage
}

export type ArticleCardData = {
  _id: string
  title: string
  slug: string
  excerpt?: string
  originalPublishedAt?: string
  readingTimeMinutes?: number
  featuredImage?: SanityImage
  author?: Pick<Author, '_id' | 'name' | 'slug'>
  categories?: Taxonomy[]
  tags?: Taxonomy[]
}

export type Article = ArticleCardData & {
  body?: Array<PortableTextBlock | Record<string, unknown>>
  author?: Author
  relatedArticles?: ArticleCardData[]
  categoryReferenceIds?: string[]
  tagReferenceIds?: string[]
  migration?: {wordpressUrl?: string; sourcePath?: string}
  seo?: {
    title?: string
    description?: string
    canonicalUrl?: string
    openGraphTitle?: string
    openGraphDescription?: string
    openGraphImage?: SanityImage
    noIndex?: boolean
  }
}

export type ArticleCollection = {
  articles: ArticleCardData[]
  total: number
  categories?: Array<Taxonomy & {articleCount: number}>
}

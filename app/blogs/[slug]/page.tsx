import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArticleList} from '../../../components/blog/article-list'
import {BlogShell} from '../../../components/blog/blog-shell'
import {PortableArticle} from '../../../components/blog/portable-article'
import {sanityFetch} from '../../../sanity/client'
import {articleBySlugQuery, relatedArticlesQuery} from '../../../sanity/queries'
import type {Article, ArticleCardData} from '../../../sanity/types'

type ArticlePageProps = {params: Promise<{slug: string}>}

function formatDate(date?: string) {
  if (!date) return null
  return new Intl.DateTimeFormat('en', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(date))
}

async function getArticle(slug: string) {
  const article = await sanityFetch<Article | null>({
    query: articleBySlugQuery,
    params: {slug},
    tags: ['sanity', 'articles', `article:${slug}`],
  })

  if (!article || article.relatedArticles?.length) return article

  const categoryIds = article.categoryReferenceIds?.filter(Boolean) || []
  const tagIds = article.tagReferenceIds?.filter(Boolean) || []
  if (!categoryIds.length && !tagIds.length) return article

  article.relatedArticles = await sanityFetch<ArticleCardData[]>({
    query: relatedArticlesQuery,
    params: {articleId: article._id, categoryIds, tagIds},
    tags: ['sanity', 'articles', `article:${slug}`, 'related-articles'],
  })
  return article
}

export async function generateMetadata({params}: ArticlePageProps): Promise<Metadata> {
  const {slug} = await params
  const article = await getArticle(slug)
  if (!article) return {title: 'Article not found', robots: {index: false, follow: false}}
  const title = article.seo?.title || article.title
  const description = article.seo?.description || article.excerpt
  const image = article.seo?.openGraphImage?.asset?.url || article.featuredImage?.asset?.url

  return {
    title,
    description,
    alternates: {canonical: article.seo?.canonicalUrl || `/blogs/${article.slug}/`},
    robots: article.seo?.noIndex ? {index: false, follow: false} : undefined,
    openGraph: {
      type: 'article',
      title: article.seo?.openGraphTitle || title,
      description: article.seo?.openGraphDescription || description,
      publishedTime: article.originalPublishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: image ? [{url: image, alt: article.seo?.openGraphImage?.alt || article.featuredImage?.alt || ''}] : undefined,
    },
  }
}

export default async function ArticlePage({params}: ArticlePageProps) {
  const {slug} = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const image = article.featuredImage?.asset
  const date = formatDate(article.originalPublishedAt)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.seo?.description || article.excerpt,
    datePublished: article.originalPublishedAt,
    author: article.author?.name ? {'@type': 'Person', name: article.author.name} : {'@type': 'Organization', name: 'Asanja Africa'},
    image: image?.url ? [image.url] : undefined,
    mainEntityOfPage: `https://asanjaafrica.com/blogs/${article.slug}/`,
  }

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}} />
      <header className="article-hero">
        {article.categories?.length ? <div className="eyebrow">{article.categories.map((item) => <Link key={item._id} href={`/blogs/category/${item.slug}/`}>{item.title}</Link>)}</div> : null}
        <h1>{article.title}</h1>
        <div className="article-byline">
          {article.author ? <Link href={`/blogs/author/${article.author.slug}/`}>By {article.author.name}</Link> : null}
          {date ? <time dateTime={article.originalPublishedAt}>{date}</time> : null}
          {article.readingTimeMinutes ? <span>{article.readingTimeMinutes} min read</span> : null}
        </div>
      </header>
      {image?.url ? (
        <figure className="article-featured">
          <Image
            src={image.url}
            alt={article.featuredImage?.alt || ''}
            width={image.metadata?.dimensions?.width || 1600}
            height={image.metadata?.dimensions?.height || 1000}
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
          {article.featuredImage?.caption || article.featuredImage?.credit ? <figcaption>{article.featuredImage.caption}{article.featuredImage.credit ? ` — ${article.featuredImage.credit}` : ''}</figcaption> : null}
        </figure>
      ) : null}
      <article className="article-layout">
        <PortableArticle body={article.body} />
        {article.tags?.length ? <div className="article-taxonomy" aria-label="Article tags">{article.tags.map((tag) => <Link key={tag._id} href={`/blogs/tag/${tag.slug}/`}>{tag.title}</Link>)}</div> : null}
      </article>
      {article.relatedArticles?.length ? (
        <section className="related">
          <div className="related-inner">
            <h2 className="related-title">Continue exploring</h2>
            <ArticleList articles={article.relatedArticles} />
          </div>
        </section>
      ) : null}
    </BlogShell>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import type {ArticleCardData} from '../../sanity/types'

function formatDate(date?: string) {
  if (!date) return null
  return new Intl.DateTimeFormat('en', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(date))
}

export function ArticleCard({article}: {article: ArticleCardData}) {
  const image = article.featuredImage?.asset
  const date = formatDate(article.originalPublishedAt)

  return (
    <article className="article-card">
      <Link className="article-card-image" href={`/blogs/${article.slug}/`} tabIndex={-1} aria-hidden="true">
        {image?.url ? (
          <Image
            src={image.url}
            alt={article.featuredImage?.alt || ''}
            width={image.metadata?.dimensions?.width || 1200}
            height={image.metadata?.dimensions?.height || 800}
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : <span className="article-card-placeholder" />}
      </Link>
      <div className="article-card-content">
        {article.categories?.length ? (
          <div className="eyebrow">
            {article.categories.slice(0, 2).map((category) => (
              <Link key={category._id} href={`/blogs/category/${category.slug}/`}>{category.title}</Link>
            ))}
          </div>
        ) : null}
        <h2><Link href={`/blogs/${article.slug}/`}>{article.title}</Link></h2>
        {article.excerpt ? <p>{article.excerpt}</p> : null}
        <div className="article-meta">
          {date ? <time dateTime={article.originalPublishedAt}>{date}</time> : null}
          {article.readingTimeMinutes ? <span>{article.readingTimeMinutes} min read</span> : null}
        </div>
      </div>
    </article>
  )
}

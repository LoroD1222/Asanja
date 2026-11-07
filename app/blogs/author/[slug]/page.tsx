import type {Metadata} from 'next'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import {PortableText} from 'next-sanity'
import {ArticleList} from '../../../../components/blog/article-list'
import {BlogShell} from '../../../../components/blog/blog-shell'
import {sanityFetch} from '../../../../sanity/client'
import {authorArticlesQuery} from '../../../../sanity/queries'
import type {ArticleCardData, Author} from '../../../../sanity/types'

export const metadata: Metadata = {title: 'Author'}

export default async function AuthorPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const result = await sanityFetch<{author: Author | null; articles: ArticleCardData[]}>({
    query: authorArticlesQuery,
    params: {slug},
    tags: ['sanity', 'articles', `author:${slug}`],
  })
  if (!result.author) notFound()

  return (
    <BlogShell>
      <header className="taxonomy-hero">
        <div className="eyebrow">Author</div>
        {result.author.image?.asset?.url ? <Image src={result.author.image.asset.url} alt={result.author.image.alt || result.author.name} width={120} height={120} style={{borderRadius: '50%', objectFit: 'cover'}} /> : null}
        <h1>{result.author.name}</h1>
        {result.author.bio?.length ? <div><PortableText value={result.author.bio} /></div> : null}
      </header>
      <section className="journal-content"><ArticleList articles={result.articles} /></section>
    </BlogShell>
  )
}

import {notFound} from 'next/navigation'
import {ArticleList} from './article-list'
import {BlogShell} from './blog-shell'
import {sanityFetch} from '../../sanity/client'
import {taxonomyArticlesQuery} from '../../sanity/queries'
import type {ArticleCardData, Taxonomy} from '../../sanity/types'

export async function TaxonomyPage({type, slug, label}: {type: 'category' | 'tag'; slug: string; label: string}) {
  const result = await sanityFetch<{taxonomy: Taxonomy | null; articles: ArticleCardData[]}>({
    query: taxonomyArticlesQuery,
    params: {type, slug},
    tags: ['sanity', 'articles', `${type}:${slug}`],
  })
  if (!result.taxonomy) notFound()

  return (
    <BlogShell>
      <header className="taxonomy-hero">
        <div className="eyebrow">{label}</div>
        <h1>{result.taxonomy.title}</h1>
        {result.taxonomy.description ? <p>{result.taxonomy.description}</p> : null}
      </header>
      <section className="journal-content"><ArticleList articles={result.articles} /></section>
    </BlogShell>
  )
}

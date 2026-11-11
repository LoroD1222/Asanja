import type {MetadataRoute} from 'next'
import {publishedClient} from '../sanity/client'
import {sitemapArticlesQuery} from '../sanity/queries'
import {pageSitemapQuery} from '../sanity/page-queries'
import {pageHref} from '../sanity/page-routes'
import type {PageTarget} from '../sanity/page-types'

export const dynamic = 'force-dynamic'

const siteUrl = 'https://asanjaafrica.com'
const staticPaths = [
  '/',
  '/about/',
  '/camps-and-lodges/',
  '/safaris/',
  '/experiences/',
  '/blogs/',
  '/asanja-moru/',
  '/asanja-sri-bustani/',
  '/asanja-nyasirori/',
  '/asanja-ruaha/',
  '/asanja-under-the-stars/',
  '/asanja-reviews/',
  '/faqs/',
  '/contact/',
  '/plan-my-stay/',
  '/make-a-booking/',
  '/privacy-policy/',
  '/terms/',
  '/asanja_safaris/tanzania-a-journey-through-natures-masterpieces/',
  '/asanja_safaris/from-i-do-to-dreams-come-true-the-perfect-honeymoon/',
  '/asanja_safaris/migration-madness/',
  '/asanja_safaris/wild-treasures-of-tanzania/',
  '/asanja_safaris/an-exclusive-safari-escape-a-family-or-friends-adventure-in-the-serengeti-with-just-3-tents-its-yours-alone/',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fetchOptions = process.env.NODE_ENV === 'development'
    ? {cache: 'no-store' as const}
    : {next: {revalidate: 300, tags: ['sanity', 'articles', 'sitemap']}}
  const [articles, pages] = await Promise.all([
    publishedClient.fetch<Array<{slug: string; lastModified?: string}>>(sitemapArticlesQuery, {}, fetchOptions),
    publishedClient.fetch<Array<PageTarget & {_updatedAt?: string}>>(pageSitemapQuery, {}, fetchOptions),
  ])

  return [
    ...staticPaths.map((pathname) => ({
      url: new URL(pathname, siteUrl).toString(),
      changeFrequency: pathname === '/' ? 'weekly' as const : 'monthly' as const,
      priority: pathname === '/' ? 1 : pathname === '/blogs/' ? 0.8 : 0.7,
    })),
    ...articles.map((article) => ({
      url: new URL(`/blogs/${article.slug}/`, siteUrl).toString(),
      lastModified: article.lastModified ? new Date(article.lastModified) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...pages.flatMap((page) => {
      const href = pageHref(page)
      return href ? [{url: new URL(href, siteUrl).toString(), lastModified: page._updatedAt ? new Date(page._updatedAt) : undefined, changeFrequency: 'monthly' as const, priority: page._type === 'safariTrip' || page._type === 'seoLandingPage' ? 0.8 : 0.7}] : []
    }),
  ]
}

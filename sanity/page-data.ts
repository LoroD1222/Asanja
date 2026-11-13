import 'server-only'
import {sanityFetch} from './client'
import {automaticPageBlogsQuery, automaticTripsQuery, contentPageBySlugQuery, pageSeoBySlugQuery, recentPageBlogsQuery, safariTripBySlugQuery, seoLandingPageBySlugQuery, siteSettingsQuery} from './page-queries'
import type {ContentPage, PageCard, PageKind, SafariTrip, SeoLandingPage} from './page-types'
import type {ArticleCardData} from './types'
import {pageHref} from './page-routes'

export const getSafariTrip = (slug: string, stega = true) => sanityFetch<SafariTrip | null>({query: safariTripBySlugQuery, params: {slug}, tags: ['sanity', 'safariTrip', `safariTrip:${slug}`], stega})
export const getSeoLandingPage = (slug: string, stega = true) => sanityFetch<SeoLandingPage | null>({query: seoLandingPageBySlugQuery, params: {slug}, tags: ['sanity', 'seoLandingPage', `seoLandingPage:${slug}`], stega})
export const getContentPage = (type: 'destination' | 'camp', slug: string, stega = true) => sanityFetch<ContentPage | null>({query: contentPageBySlugQuery, params: {type, slug}, tags: ['sanity', type, `${type}:${slug}`], stega})
export const getPageSeo = (type: PageKind, slug: string) => sanityFetch<Pick<PageCard, '_id' | '_type' | 'title' | 'slug' | 'summary' | 'heroImage'> & {isSample?: boolean; seo?: ContentPage['seo']} | null>({query: pageSeoBySlugQuery, params: {type, slug}, tags: ['sanity', type, `${type}:${slug}`], stega: false})

export async function getAutomaticBlogs({categoryIds, tagIds, destinationIds, excludedIds, limit, enabled = true}: {categoryIds?: string[] | null; tagIds?: string[] | null; destinationIds?: string[] | null; excludedIds?: string[] | null; limit?: number | null; enabled?: boolean}) {
  if (!enabled) return []
  const categories = Array.isArray(categoryIds) ? categoryIds : []
  const tags = Array.isArray(tagIds) ? tagIds : []
  const destinations = Array.isArray(destinationIds) ? destinationIds : []
  const excluded = Array.isArray(excludedIds) ? excludedIds : []
  const hasSelectors = Boolean(categories.length || tags.length || destinations.length)
  const articles = hasSelectors ? await sanityFetch<ArticleCardData[]>({query: automaticPageBlogsQuery, params: {categoryIds: categories, tagIds: tags, destinationIds: destinations, excludedIds: excluded}, tags: ['sanity', 'articles', 'automatic-related-blogs'], stega: false}) : []
  const fallback = (articles || []).length ? [] : await sanityFetch<ArticleCardData[]>({query: recentPageBlogsQuery, params: {excludedIds: excluded}, tags: ['sanity', 'articles', 'automatic-related-blogs'], stega: false})
  const unique = new Set<string>()
  return [...(articles || []), ...(fallback || [])].filter((article) => {
    if (!article?._id || !article.slug || unique.has(article._id) || excluded.includes(article._id)) return false
    unique.add(article._id)
    return true
  }).slice(0, Math.max(1, Math.min(9, typeof limit === 'number' && Number.isFinite(limit) ? limit : 3)))
}

export async function getAutomaticTrips(currentId: string, destinationIds: string[]) {
  if (!destinationIds.length) return []
  const trips = await sanityFetch<PageCard[]>({query: automaticTripsQuery, params: {currentId, destinationIds}, tags: ['sanity', 'safariTrip'], stega: false})
  return (trips || []).filter((trip) => trip?._id && pageHref(trip))
}

export const getSiteSettings = () => sanityFetch<{whatsappNumber?: string; contactEmail?: string} | null>({query: siteSettingsQuery, tags: ['sanity', 'siteSettings'], stega: false})

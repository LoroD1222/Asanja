import 'server-only'
import {sanityFetch} from './client'
import {automaticPageBlogsQuery, automaticTripsQuery, contentPageBySlugQuery, pageSeoBySlugQuery, safariTripBySlugQuery, seoLandingPageBySlugQuery, siteSettingsQuery} from './page-queries'
import type {ContentPage, PageCard, PageKind, SafariTrip, SeoLandingPage} from './page-types'
import type {ArticleCardData} from './types'
import {pageHref} from './page-routes'

export const getSafariTrip = (slug: string, stega = true) => sanityFetch<SafariTrip | null>({query: safariTripBySlugQuery, params: {slug}, tags: ['sanity', 'safariTrip', `safariTrip:${slug}`], stega})
export const getSeoLandingPage = (slug: string, stega = true) => sanityFetch<SeoLandingPage | null>({query: seoLandingPageBySlugQuery, params: {slug}, tags: ['sanity', 'seoLandingPage', `seoLandingPage:${slug}`], stega})
export const getContentPage = (type: 'destination' | 'camp', slug: string, stega = true) => sanityFetch<ContentPage | null>({query: contentPageBySlugQuery, params: {type, slug}, tags: ['sanity', type, `${type}:${slug}`], stega})
export const getPageSeo = (type: PageKind, slug: string) => sanityFetch<Pick<PageCard, '_id' | '_type' | 'title' | 'slug' | 'summary'> & {seo?: ContentPage['seo']} | null>({query: pageSeoBySlugQuery, params: {type, slug}, tags: ['sanity', type, `${type}:${slug}`], stega: false})

export async function getAutomaticBlogs({categoryIds = [], tagIds = [], destinationIds = [], excludedIds = [], limit = 3, enabled = true}: {categoryIds?: string[]; tagIds?: string[]; destinationIds?: string[]; excludedIds?: string[]; limit?: number; enabled?: boolean}) {
  if (!enabled || (!categoryIds.length && !tagIds.length && !destinationIds.length)) return []
  const articles = await sanityFetch<ArticleCardData[]>({query: automaticPageBlogsQuery, params: {categoryIds, tagIds, destinationIds, excludedIds}, tags: ['sanity', 'articles', 'automatic-related-blogs'], stega: false})
  const unique = new Set<string>()
  return (articles || []).filter((article) => {
    if (!article?._id || !article.slug || unique.has(article._id) || excludedIds.includes(article._id)) return false
    unique.add(article._id)
    return true
  }).slice(0, Math.max(1, Math.min(9, limit)))
}

export async function getAutomaticTrips(currentId: string, destinationIds: string[]) {
  if (!destinationIds.length) return []
  const trips = await sanityFetch<PageCard[]>({query: automaticTripsQuery, params: {currentId, destinationIds}, tags: ['sanity', 'safariTrip'], stega: false})
  return (trips || []).filter((trip) => trip?._id && pageHref(trip))
}

export const getSiteSettings = () => sanityFetch<{whatsappNumber?: string; contactEmail?: string} | null>({query: siteSettingsQuery, tags: ['sanity', 'siteSettings'], stega: false})

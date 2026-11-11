import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {SafariTripPage} from '../../../components/pages/safari-trip-page'
import {getAutomaticBlogs, getAutomaticTrips, getPageSeo, getSafariTrip, getSiteSettings} from '../../../sanity/page-data'
import {breadcrumbData, jsonLd, organizationData, pageMetadata, siteOrigin} from '../../../sanity/page-seo'

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const page = await getPageSeo('safariTrip', slug)
  return page ? pageMetadata(page, `/safaris/${page.slug}/`) : {title: 'Safari not found', robots: {index: false, follow: false}}
}

export default async function SafariTripRoute({params}: Props) {
  const {slug} = await params
  const trip = await getSafariTrip(slug)
  if (!trip) notFound()
  const destinationIds = (trip.relatedDestinations || []).filter(Boolean).map((item) => item._id)
  const [automaticBlogs, automaticTrips, settings] = await Promise.all([
    getAutomaticBlogs({categoryIds: trip.automaticBlogCategoryIds, tagIds: trip.automaticBlogTagIds, destinationIds, excludedIds: trip.relatedBlogs?.filter(Boolean).map((item) => item._id), enabled: trip.automaticBlogsEnabled !== false, limit: trip.automaticBlogsLimit}),
    trip.relatedSafariTrips?.length ? Promise.resolve([]) : getAutomaticTrips(trip._id, destinationIds),
    getSiteSettings(),
  ])
  const url = new URL(`/safaris/${trip.slug}/`, siteOrigin).toString()
  const structured = [
    {'@context': 'https://schema.org', '@type': 'TouristTrip', name: trip.title, description: trip.summary, url, image: trip.heroImage?.asset?.url, provider: {'@id': `${siteOrigin}/#organization`}},
    organizationData,
    breadcrumbData([{name: 'Home', path: '/'}, {name: 'Safaris', path: '/safaris/'}, {name: trip.title, path: `/safaris/${trip.slug}/`}]),
  ]
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd(structured)}} /><SafariTripPage trip={trip} automaticBlogs={automaticBlogs} automaticTrips={automaticTrips} whatsappNumber={settings?.whatsappNumber} /></>
}

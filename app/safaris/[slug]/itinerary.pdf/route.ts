import {publishedClient} from '../../../../sanity/client'
import {siteSettingsQuery, safariTripBySlugQuery} from '../../../../sanity/page-queries'
import type {SafariTrip} from '../../../../sanity/page-types'
import {buildTripPdf} from '../../../../sanity/trip-pdf'

type Context = {params: Promise<{slug: string}>}

export async function GET(_request: Request, {params}: Context) {
  const {slug} = await params
  const [trip, settings] = await Promise.all([
    publishedClient.fetch<SafariTrip | null>(safariTripBySlugQuery, {slug, includeDrafts: false}),
    publishedClient.fetch<{contactEmail?: string; whatsappNumber?: string} | null>(siteSettingsQuery),
  ])
  if (!trip || !trip.slug) return new Response('Itinerary not found.', {status: 404})
  const bytes = await buildTripPdf(trip, settings || undefined)
  return new Response(new Uint8Array(bytes).buffer, {headers: {'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${trip.slug}-itinerary.pdf"`, 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'}})
}

import {getSafariTrip, getSiteSettings} from '../../../../sanity/page-data'
import {hasItineraryAccess} from '../../../../sanity/itinerary-access'
import {buildTripPdf} from '../../../../sanity/trip-pdf'

type Context = {params: Promise<{slug: string}>}

export async function GET(_request: Request, {params}: Context) {
  if (!await hasItineraryAccess()) return new Response('Complete the itinerary download form on the safari page first.', {status: 403, headers: {'Cache-Control': 'private, no-store'}})
  const {slug} = await params
  const [trip, settings] = await Promise.all([
    getSafariTrip(slug, false),
    getSiteSettings(),
  ])
  if (!trip || !trip.slug) return new Response('Itinerary not found.', {status: 404})
  const bytes = await buildTripPdf(trip, {...(settings || {}), isPreview: trip.isSample})
  return new Response(new Uint8Array(bytes).buffer, {headers: {'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${trip.slug}-itinerary.pdf"`, 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow'}})
}

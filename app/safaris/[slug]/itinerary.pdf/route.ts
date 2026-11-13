import {draftMode} from 'next/headers'
import {getSafariTrip, getSiteSettings} from '../../../../sanity/page-data'
import {buildTripPdf} from '../../../../sanity/trip-pdf'

type Context = {params: Promise<{slug: string}>}

export async function GET(_request: Request, {params}: Context) {
  const {slug} = await params
  const isDraft = (await draftMode()).isEnabled
  const [trip, settings] = await Promise.all([
    getSafariTrip(slug, false),
    getSiteSettings(),
  ])
  if (!trip || !trip.slug) return new Response('Itinerary not found.', {status: 404})
  const bytes = await buildTripPdf(trip, {...(settings || {}), isPreview: trip.isSample})
  return new Response(new Uint8Array(bytes).buffer, {headers: {'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${trip.slug}-itinerary.pdf"`, 'Cache-Control': isDraft ? 'private, no-store' : 'public, s-maxage=300, stale-while-revalidate=3600'}})
}

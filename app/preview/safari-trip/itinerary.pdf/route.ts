import {buildPreviewTrip} from '../../../../sanity/preview-trip'
import {buildTripPdf} from '../../../../sanity/trip-pdf'
import {hasItineraryAccess} from '../../../../sanity/itinerary-access'

export async function GET() {
  if (!await hasItineraryAccess()) return new Response('Complete the itinerary download form on the safari page first.', {status: 403, headers: {'Cache-Control': 'private, no-store'}})
  const bytes = await buildTripPdf(buildPreviewTrip(), {pageUrl: 'https://asanja.vercel.app/preview/safari-trip/', isPreview: true})
  return new Response(new Uint8Array(bytes).buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="asanja-safari-template-itinerary.pdf"',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

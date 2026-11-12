import {buildPreviewTrip} from '../../../../sanity/preview-trip'
import {buildTripPdf} from '../../../../sanity/trip-pdf'

export async function GET() {
  const bytes = await buildTripPdf(buildPreviewTrip(), {pageUrl: 'https://asanja.vercel.app/preview/safari-trip/', isPreview: true})
  return new Response(new Uint8Array(bytes).buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="asanja-safari-template-itinerary.pdf"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

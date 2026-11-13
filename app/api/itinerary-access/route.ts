import {hasItineraryAccess} from '../../../sanity/itinerary-access'

export async function GET() {
  return Response.json({authorized: await hasItineraryAccess()}, {headers: {'Cache-Control': 'private, no-store'}})
}

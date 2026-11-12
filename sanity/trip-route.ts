import type {PageCard, RouteStop, SafariTrip} from './page-types'

function hasCoordinates(stop: RouteStop) {
  const point = stop.coordinates
  return Boolean(point && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180)
}

function fromDestination(destination: PageCard | null | undefined, dayLabel?: string): RouteStop | null {
  if (!destination?.coordinates || !destination.title) return null
  return {
    _key: `destination-${destination._id}`,
    name: destination.title,
    dayLabel,
    coordinates: destination.coordinates,
    destination,
  }
}

export function tripRouteStops(trip: SafariTrip): RouteStop[] {
  const manual = (trip.routeStops || []).filter(hasCoordinates)
  if (manual.length) return manual

  const seen = new Set<string>()
  const itinerary = (trip.itinerary || []).flatMap((day) => {
    const destination = day.destination
    if (!destination?._id || seen.has(destination._id)) return []
    const stop = fromDestination(destination, `Day ${day.dayNumber}`)
    if (!stop || !hasCoordinates(stop)) return []
    seen.add(destination._id)
    return [stop]
  })
  const remaining = (trip.relatedDestinations || []).flatMap((destination) => {
    if (!destination?._id || seen.has(destination._id)) return []
    const stop = fromDestination(destination)
    if (!stop || !hasCoordinates(stop)) return []
    seen.add(destination._id)
    return [stop]
  })
  return [...itinerary, ...remaining]
}

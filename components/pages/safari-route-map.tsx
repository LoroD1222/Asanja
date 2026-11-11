'use client'

import 'leaflet/dist/leaflet.css'
import {useEffect, useRef, useState} from 'react'
import type {Map as LeafletMap, CircleMarker} from 'leaflet'
import type {RouteStop} from '../../sanity/page-types'
import {pageHref} from '../../sanity/page-routes'

export function SafariRouteMap({stops}: {stops?: RouteStop[]}) {
  const valid = (stops || []).filter((stop) => stop.coordinates && Number.isFinite(stop.coordinates.lat) && Number.isFinite(stop.coordinates.lng) && Math.abs(stop.coordinates.lat) <= 90 && Math.abs(stop.coordinates.lng) <= 180)
  const node = useRef<HTMLDivElement>(null)
  const map = useRef<LeafletMap | null>(null)
  const markers = useRef<CircleMarker[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!node.current || !valid.length) return
    let disposed = false
    import('leaflet').then((L) => {
      if (disposed || !node.current) return
      const first = valid[0].coordinates!
      const instance = L.map(node.current, {scrollWheelZoom: false, zoomControl: true}).setView([first.lat, first.lng], 6)
      map.current = instance
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 17, attribution: '&copy; OpenStreetMap contributors'}).addTo(instance)
      const coordinates: Array<[number, number]> = valid.map((stop) => [stop.coordinates!.lat, stop.coordinates!.lng])
      if (coordinates.length > 1) {
        L.polyline(coordinates, {color: '#ae774b', weight: 3, dashArray: '7 8'}).addTo(instance)
        instance.fitBounds(L.latLngBounds(coordinates).pad(.35), {maxZoom: 9})
      } else instance.setView(coordinates[0], 8)
      markers.current = valid.map((stop, index) => {
        const marker = L.circleMarker(coordinates[index], {radius: 11, color: '#fff', weight: 3, fillColor: '#3c5842', fillOpacity: 1}).addTo(instance)
        const popup = document.createElement('div')
        const label = document.createElement('strong')
        label.textContent = `${index + 1}. ${stop.name}`
        popup.append(label)
        if (stop.description) {const detail = document.createElement('p'); detail.textContent = stop.description; popup.append(detail)}
        const href = pageHref(stop.destination)
        if (href) {const link = document.createElement('a'); link.href = href; link.textContent = 'Explore destination →'; popup.append(link)}
        marker.bindPopup(popup)
        marker.on('click', () => setActive(index))
        return marker
      })
    })
    return () => {disposed = true; map.current?.remove(); map.current = null; markers.current = []}
  }, [stops])

  if (!valid.length) return null
  const selected = valid[Math.min(active, valid.length - 1)]
  return <div className="safari-route"><div ref={node} className="safari-route-map" role="application" aria-label="Interactive safari route map"/><div className="safari-route-list"><p className="safari-kicker">Your route</p><ol>{valid.map((stop, index) => <li key={stop._key}><button type="button" className={index === active ? 'is-active' : ''} onClick={() => {setActive(index); const coords = stop.coordinates!; map.current?.flyTo([coords.lat, coords.lng], Math.max(8, map.current.getZoom()), {duration: .7}); markers.current[index]?.openPopup()}}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stop.name}</strong><small>{stop.dayLabel}</small></button></li>)}</ol><div aria-live="polite"><strong>{selected.name}</strong>{selected.description ? <p>{selected.description}</p> : null}{pageHref(selected.destination) ? <a href={pageHref(selected.destination)!}>Explore this destination ↗</a> : null}</div></div></div>
}

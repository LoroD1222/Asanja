'use client'

import Link from 'next/link'
import {useState} from 'react'
import type {ItineraryDay} from '../../sanity/page-types'
import {pageHref} from '../../sanity/page-routes'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'
import styles from './safari-itinerary.module.css'

export function SafariItinerary({days}: {days?: ItineraryDay[]}) {
  const items = (days || []).filter((day) => day.title && Number.isFinite(day.dayNumber))
  const [expanded, setExpanded] = useState<number[]>(items.length ? [0] : [])
  if (!items.length) return null
  const allOpen = expanded.length === items.length
  return <div className="safari-itinerary"><div className="safari-itinerary-tools"><span>{items.length} {items.length === 1 ? 'stage' : 'stages'} in the journey</span><button type="button" onClick={() => setExpanded(allOpen ? [] : items.map((_, index) => index))}>{allOpen ? 'Close all stages' : 'Open all stages'}</button></div>
    {items.map((day, index) => {const open = expanded.includes(index); const destinationHref = pageHref(day.destination); const campHref = pageHref(day.accommodation); return <article className={open ? 'is-open' : ''} key={day._key}>
      <button className="safari-day-toggle" type="button" aria-expanded={open} aria-controls={`safari-day-${day._key}`} onClick={() => setExpanded(open ? expanded.filter((item) => item !== index) : [...expanded, index])}><span>Day {day.dayNumber}</span><strong>{day.title}</strong><small>{day.destination?.title || ''}</small><b aria-hidden="true">{open ? '−' : '+'}</b></button>
      {open ? <div id={`safari-day-${day._key}`} className="safari-day-content"><div className={styles.readable}><PortablePageText value={day.description} />{day.activities?.length ? <p><b>Activities:</b> {day.activities.join(', ')}</p> : null}{day.meals?.length ? <p><b>Meals:</b> {day.meals.join(', ')}</p> : null}{day.notes ? <p>{day.notes}</p> : null}{destinationHref ? <p><b>Destination:</b> <Link href={destinationHref}>{day.destination?.title}</Link></p> : null}{campHref ? <p><b>Overnight:</b> <Link href={campHref}>{day.accommodation?.title}</Link></p> : null}</div><PageImage image={day.image} /></div> : null}
    </article>})}
  </div>
}

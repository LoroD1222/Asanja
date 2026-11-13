import Image from 'next/image'
import {BlogShell} from '../blog/blog-shell'
import type {ArticleCardData} from '../../sanity/types'
import type {PageCard, SafariTrip, TripSection} from '../../sanity/page-types'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'
import {hasTripSectionContent, TripSectionRenderer} from './trip-section-renderer'

const defaultKinds: TripSection['kind'][] = ['overview','highlights','itinerary','route','destinations','accommodation','gallery','pricing','inclusions','season','travel','relatedTrips','relatedBlogs','relatedLandingPages','faq','reviews','booking']

export function SafariTripPage({trip, automaticBlogs, automaticTrips, whatsappNumber, preview = false}: {trip: SafariTrip; automaticBlogs: ArticleCardData[]; automaticTrips: PageCard[]; whatsappNumber?: string; preview?: boolean}) {
  const provided: TripSection[] = trip.sections || defaultKinds.map((kind) => ({_key: kind, kind}))
  const sections: TripSection[] = provided.some((section) => section.kind === 'booking') ? provided : [...provided, {_key: 'booking-fallback', kind: 'booking'}]
  const itinerary = sections.find((section) => section.kind === 'itinerary')
  return <BlogShell className="safari-site"><article className="safari-page safari-trip-page">
    <header className="safari-hero"><div className="safari-hero-media"><PageImage image={trip.heroImage} priority sizes="100vw" /></div><div className="safari-hero-overlay"/><div className="safari-hero-content"><p className="safari-kicker">{trip.isSample ? 'Sample itinerary · ' : ''}{trip.heroEyebrow || trip.category || 'Asanja Africa safari'}</p><h1>{trip.title}</h1>{trip.heroDescription?.length ? <div className="safari-hero-description"><PortablePageText value={trip.heroDescription} /></div> : <p className="safari-hero-summary">{trip.summary}</p>}<div className="safari-hero-facts"><span>{trip.durationDays} days{trip.durationNights !== undefined ? ` / ${trip.durationNights} nights` : ''}</span>{trip.relatedDestinations?.length ? <span>{trip.relatedDestinations.filter(Boolean).length} {preview ? 'featured destinations' : 'destinations'}</span> : null}{typeof trip.priceFrom === 'number' ? <span>From {new Intl.NumberFormat('en-US', {style: 'currency', currency: trip.currency || 'USD', maximumFractionDigits: 0}).format(trip.priceFrom)} per person</span> : null}</div><div className="safari-hero-actions"><a href="#booking">{preview ? 'Explore this sample' : 'Plan this safari'} <span aria-hidden="true">↗</span></a>{itinerary ? <a href={`#itinerary-${itinerary._key}`}>Explore itinerary <span aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" focusable="false"><path d="M10 3v13m0 0-5-5m5 5 5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></a> : null}</div></div></header>
    <nav className="safari-jump" aria-label="On this page"><span>Explore this journey</span>{sections.filter((section) => ['overview','itinerary','route','accommodation','pricing','faq'].includes(section.kind) && (preview || hasTripSectionContent(section, trip, automaticTrips, automaticBlogs))).map((section) => <a key={section._key} href={`#${section.kind + '-' + section._key}`}>{section.heading || section.kind}</a>)}<a href="#booking">Enquire ↗</a></nav>
    <div className="safari-page-content">{sections.map((section) => <TripSectionRenderer key={section._key} section={section} trip={trip} automaticTrips={automaticTrips} automaticBlogs={automaticBlogs} whatsappNumber={whatsappNumber} preview={preview} />)}</div>
    <section className="safari-trip-closing" aria-label="Plan your safari trip">
      <div className="safari-trip-closing-scene" aria-hidden="true"><Image src="/figma-trip-closing/landscape.png" alt="" fill sizes="100vw" /></div>
      <div className="safari-trip-closing-wash" aria-hidden="true" />
      <div className="safari-trip-closing-content">
        <Image className="safari-trip-closing-logo" src="/legacy/wp-content/uploads/2024/04/asanja_logo_with_slogan_dark-03.svg" alt="Asanja — Open Hearts and Wild Spirits" width={430} height={109} unoptimized />
        <a href="#booking">Plan Your Trip <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </article></BlogShell>
}

import Image from 'next/image'
import {BlogShell} from '../blog/blog-shell'
import type {ArticleCardData} from '../../sanity/types'
import type {PageCard, SafariTrip, TripSection} from '../../sanity/page-types'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'
import {SafariJumpNav} from './safari-jump-nav'
import {hasTripSectionContent, TripSectionRenderer} from './trip-section-renderer'

const defaultKinds: TripSection['kind'][] = ['overview','highlights','itinerary','route','destinations','accommodation','gallery','pricing','inclusions','season','travel','relatedTrips','relatedBlogs','relatedLandingPages','faq','reviews','booking']

export function SafariTripPage({trip, automaticBlogs, automaticTrips, whatsappNumber, preview = false}: {trip: SafariTrip; automaticBlogs: ArticleCardData[]; automaticTrips: PageCard[]; whatsappNumber?: string; preview?: boolean}) {
  const provided: TripSection[] = trip.sections || defaultKinds.map((kind) => ({_key: kind, kind}))
  const sections: TripSection[] = provided.some((section) => section.kind === 'booking') ? provided : [...provided, {_key: 'booking-fallback', kind: 'booking'}]
  const itinerary = sections.find((section) => section.kind === 'itinerary')
  const openingSection = sections[0]?.kind === 'overview' ? sections[0] : null
  const remainingSections = openingSection ? sections.slice(1) : sections
  const jumpLinks = sections.filter((section) => ['overview','itinerary','route','accommodation','pricing','faq'].includes(section.kind) && (preview || hasTripSectionContent(section, trip, automaticTrips, automaticBlogs)))
    .map((section) => ({id: `${section.kind}-${section._key}`, label: section.heading || section.kind}))
  jumpLinks.push({id: 'booking', label: 'Enquire'})
  const showClosingScene = trip.slug !== 'wild-treasures-of-tanzania-sample'
  return <BlogShell className="safari-site"><article className="safari-page safari-trip-page">
    <header className="safari-hero"><div className="safari-hero-media"><PageImage image={trip.heroImage} priority sizes="100vw" /></div><div className="safari-hero-overlay"/><div className="safari-hero-content"><p className="safari-kicker">{trip.isSample ? 'Sample itinerary · ' : ''}{trip.heroEyebrow || trip.category || 'Asanja Africa safari'}</p><h1>{trip.title}</h1>{trip.heroDescription?.length ? <div className="safari-hero-description"><PortablePageText value={trip.heroDescription} /></div> : <p className="safari-hero-summary">{trip.summary}</p>}<div className="safari-hero-facts"><span>{trip.durationDays} days{trip.durationNights !== undefined ? ` / ${trip.durationNights} nights` : ''}</span>{trip.relatedDestinations?.filter(Boolean).length ? <span>{trip.relatedDestinations.filter(Boolean).length} {preview ? 'featured destinations' : 'destinations'}</span> : null}{typeof trip.priceFrom === 'number' ? <span>From {new Intl.NumberFormat('en-US', {style: 'currency', currency: trip.currency || 'USD', maximumFractionDigits: 0}).format(trip.priceFrom)} per person</span> : null}</div><div className="safari-hero-actions"><a href="#booking">{preview || trip.isSample ? 'Explore this sample' : 'Plan this safari'}</a>{itinerary ? <a href={`#itinerary-${itinerary._key}`}>Explore itinerary</a> : null}</div></div></header>
    {trip.editorialIntroduction?.length ? <section className="safari-trip-editorial-introduction"><PortablePageText value={trip.editorialIntroduction} /></section> : null}
    {openingSection ? <div className="safari-page-content safari-page-opening"><TripSectionRenderer section={openingSection} trip={trip} automaticTrips={automaticTrips} automaticBlogs={automaticBlogs} whatsappNumber={whatsappNumber} preview={preview} /></div> : null}
    <SafariJumpNav links={jumpLinks} />
    <div className="safari-page-content">{remainingSections.map((section) => <TripSectionRenderer key={section._key} section={section} trip={trip} automaticTrips={automaticTrips} automaticBlogs={automaticBlogs} whatsappNumber={whatsappNumber} preview={preview} />)}</div>
    {showClosingScene ? <section className="safari-trip-closing" aria-label="Plan your safari trip">
      <div className="safari-trip-closing-scene" aria-hidden="true"><Image src="/figma-trip-closing/landscape.png" alt="" fill sizes="100vw" /></div>
      <div className="safari-trip-closing-wash" aria-hidden="true" />
      <div className="safari-trip-closing-content">
        <Image className="safari-trip-closing-logo" src="/legacy/wp-content/uploads/2024/04/asanja_logo_with_slogan_dark-03.svg" alt="Asanja — Open Hearts and Wild Spirits" width={430} height={109} unoptimized />
        <a href="#booking">Plan Your Trip</a>
      </div>
    </section> : null}
  </article></BlogShell>
}

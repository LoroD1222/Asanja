import {BlogShell} from '../blog/blog-shell'
import type {ArticleCardData} from '../../sanity/types'
import type {PageCard, SafariTrip, TripSection} from '../../sanity/page-types'
import {whatsappHref} from '../../sanity/contact'
import {Breadcrumbs, RelatedBlogs} from './page-sections'
import {PageImage} from './page-image'
import {hasTripSectionContent, TripSectionRenderer} from './trip-section-renderer'
import {StickyBookingBar} from './sticky-booking-bar'

const defaultKinds: TripSection['kind'][] = ['overview','highlights','itinerary','route','destinations','accommodation','wildlife','gallery','pricing','inclusions','season','travel','relatedTrips','relatedBlogs','relatedLandingPages','faq','reviews','booking']

export function SafariTripPage({trip, automaticBlogs, automaticTrips, whatsappNumber, preview = false}: {trip: SafariTrip; automaticBlogs: ArticleCardData[]; automaticTrips: PageCard[]; whatsappNumber?: string; preview?: boolean}) {
  const provided: TripSection[] = trip.sections || defaultKinds.map((kind) => ({_key: kind, kind}))
  const sections: TripSection[] = provided.some((section) => section.kind === 'booking') ? provided : [...provided, {_key: 'booking-fallback', kind: 'booking'}]
  const itinerary = sections.find((section) => section.kind === 'itinerary')
  const whatsapp = whatsappHref(whatsappNumber, preview ? 'Hello Asanja Africa, I saw the safari template preview and would like help planning a trip.' : `Hello Asanja Africa, I would like to ask about ${trip.title}.`)
  return <BlogShell className="safari-site">{preview ? <div className="safari-preview-banner" role="status"><strong>Client layout preview</strong><span>Sample cards, packages, FAQs and testimonials show the finished design. Replace them with verified trip content in the CMS before publishing.</span>{process.env.NODE_ENV === 'development' ? <a href="http://localhost:3333/">Open Studio ↗</a> : null}</div> : null}<article className="safari-page safari-trip-page">
    <Breadcrumbs current={trip.title} parents={[{label: 'Safaris', href: '/safaris/'}]} />
    <header className="safari-hero"><div className="safari-hero-media"><PageImage image={trip.heroImage} priority sizes="100vw" />{trip.heroImages?.slice(0, 2).map((image, index) => <PageImage key={index} image={image} />)}</div><div className="safari-hero-overlay"/><div className="safari-hero-content"><p className="safari-kicker">{trip.heroEyebrow || trip.category || 'Asanja Africa safari'}</p><h1>{trip.title}</h1><p>{trip.summary}</p><div className="safari-hero-facts"><span>{trip.durationDays} days{trip.durationNights !== undefined ? ` / ${trip.durationNights} nights` : ''}</span>{trip.relatedDestinations?.length ? <span>{trip.relatedDestinations.filter(Boolean).length} {preview ? 'featured destinations' : 'destinations'}</span> : null}{typeof trip.priceFrom === 'number' ? <span>From {new Intl.NumberFormat('en-US', {style: 'currency', currency: trip.currency || 'USD', maximumFractionDigits: 0}).format(trip.priceFrom)} per person</span> : null}</div><div className="safari-hero-actions"><a href="#booking">{preview ? 'View quote form ↗' : 'Plan this safari ↗'}</a>{itinerary ? <a href={`#itinerary-${itinerary._key}`}>Explore itinerary ↓</a> : null}</div></div></header>
    <nav className="safari-jump" aria-label="On this page"><span>Explore this journey</span>{sections.filter((section) => ['overview','itinerary','route','accommodation','pricing','faq'].includes(section.kind) && (preview || hasTripSectionContent(section, trip, automaticTrips))).map((section) => <a key={section._key} href={`#${section.kind + '-' + section._key}`}>{section.heading || section.kind}</a>)}<a href="#booking">Enquire ↗</a></nav>
    <div className="safari-page-content">{sections.map((section) => <TripSectionRenderer key={section._key} section={section} trip={trip} automaticTrips={automaticTrips} whatsappNumber={whatsappNumber} preview={preview} />)}
      <RelatedBlogs title={preview ? 'Journal card preview' : 'More from the journal'} eyebrow={preview ? 'Existing CMS articles' : 'Automatically recommended'} articles={automaticBlogs} automatic />
    </div>
    <section className="safari-closing"><p className="safari-kicker">The next chapter</p><h2>{trip.bookingHeading || 'Your Tanzania story starts with a conversation.'}</h2><div><a href="#booking">{preview ? 'View inquiry options ↗' : 'Request a quote ↗'}</a>{whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer">Ask on WhatsApp ↗</a> : null}</div></section>
    <StickyBookingBar title={trip.title} whatsapp={whatsapp} preview={preview} />
  </article></BlogShell>
}

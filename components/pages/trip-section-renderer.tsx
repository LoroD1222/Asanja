import Link from 'next/link'
import type {ArticleCardData} from '../../sanity/types'
import type {PageCard, SafariTrip, TripSection} from '../../sanity/page-types'
import {lowestPublishedRate} from '../../sanity/price'
import {pageHref} from '../../sanity/page-routes'
import {tripRouteStops} from '../../sanity/trip-route'
import {CardGrid} from './content-card'
import {PageImage} from './page-image'
import {FAQSection, RelatedBlogs, SectionHeading} from './page-sections'
import {PortablePageText} from './portable-page-text'
import {QuoteForm} from './quote-form'
import {SafariGallery} from './safari-gallery'
import {SafariItinerary} from './safari-itinerary'
import {SafariRouteMap} from './safari-route-map'
import {TripHighlights} from './trip-highlights'
import {TripReviews} from './trip-reviews'

const headings: Record<TripSection['kind'], string> = {
  overview: 'The journey', highlights: 'Safari highlights', itinerary: 'Day by day', route: 'Follow the route',
  destinations: 'Places you will explore', accommodation: 'Where you will stay', wildlife: 'The wild moments',
  gallery: 'A glimpse of the journey', pricing: 'Choose your journey', inclusions: 'What is covered',
  season: 'When to go', travel: 'Before you travel', relatedTrips: 'More journeys', relatedBlogs: 'Stories for the journey',
  relatedLandingPages: 'Explore more of Tanzania', faq: 'Good to know', reviews: 'Words from our guests',
  booking: 'Plan your own safari', editorial: 'Explore the journey',
}

const previewGuidance: Partial<Record<TripSection['kind'], {label: string; detail: string}>> = {
  route: {label: 'Map ready for CMS coordinates', detail: 'Add ordered route stops with verified coordinates in Studio. The interactive map will then draw markers and connect them in itinerary order.'},
  destinations: {label: 'Destination cards are CMS-linked', detail: 'Select published destination pages in Studio to show their images, descriptions and live links here.'},
  accommodation: {label: 'Camp cards are CMS-linked', detail: 'Select published camp pages in Studio. Each card will use that camp’s own image, location and page URL.'},
  pricing: {label: 'Price on request', detail: 'No verified package rates are attached to this preview. Add seasonal and group rates in Studio, or let guests request a tailored quotation.'},
  inclusions: {label: 'Services have not been entered', detail: 'Enter the exact included and excluded services for each trip in Studio; neither list is assumed from another package.'},
  season: {label: 'Seasonal guidance is editable', detail: 'Add the best-time narrative, recommended months and optional image for this particular safari in Studio.'},
  relatedTrips: {label: 'Related trips are selected in Studio', detail: 'Choose published safari trips manually, or let shared destinations provide recommendations when published trips are available.'},
  relatedLandingPages: {label: 'Related SEO pages are selected in Studio', detail: 'Choose published landing pages without adding links or components in code.'},
  faq: {label: 'Questions are managed per trip', detail: 'Add genuine answers in Studio and they will appear here as accessible expandable items.'},
  reviews: {label: 'No guest reviews supplied', detail: 'Only genuine, CMS-managed testimonials will be shown. This preview does not create names, ratings or quotes.'},
}

function PreviewPlaceholder({kind}: {kind: TripSection['kind']}) {
  const guidance = previewGuidance[kind]
  return guidance ? <div className="safari-preview-placeholder"><span aria-hidden="true">✳</span><div><strong>{guidance.label}</strong><p>{guidance.detail}</p></div></div> : null
}

export function hasTripSectionContent(section: TripSection, trip: SafariTrip, automaticTrips: PageCard[], automaticBlogs: ArticleCardData[] = []) {
  if (section.body?.length || section.image?.asset?.url) return true
  switch (section.kind) {
    case 'overview': return Boolean(trip.introduction?.length || trip.summary)
    case 'highlights': return Boolean(trip.highlights?.length)
    case 'itinerary': return Boolean(trip.itinerary?.length)
    case 'route': return tripRouteStops(trip).length > 0
    case 'destinations': return Boolean(trip.relatedDestinations?.some((item) => pageHref(item)))
    case 'accommodation': return Boolean(trip.relatedCamps?.some((item) => pageHref(item)))
    case 'wildlife': return Boolean(trip.wildlife?.length || trip.activities?.length)
    case 'gallery': return Boolean(trip.gallery?.length)
    case 'pricing': return true
    case 'inclusions': return Boolean(trip.included?.length || trip.excluded?.length)
    case 'season': return Boolean(trip.bestTime?.length || trip.bestMonths?.length)
    case 'travel': return Boolean(trip.travelInformation?.length || trip.travelNotes?.length)
    case 'relatedTrips': return Boolean(trip.relatedSafariTrips?.some((item) => pageHref(item)) || automaticTrips.length)
    case 'relatedBlogs': return Boolean(trip.relatedBlogs?.some((item) => item?._id && item.slug) || automaticBlogs.some((item) => item?._id && item.slug))
    case 'relatedLandingPages': return Boolean(trip.relatedLandingPages?.some((item) => pageHref(item)))
    case 'faq': return Boolean(trip.faqs?.length)
    case 'reviews': return Boolean(trip.reviews?.length)
    case 'booking': return true
    case 'editorial': return Boolean(section.body?.length || section.image?.asset?.url)
  }
}

export function TripSectionRenderer({section, trip, automaticTrips, automaticBlogs = [], whatsappNumber, preview = false}: {section: TripSection; trip: SafariTrip; automaticTrips: PageCard[]; automaticBlogs?: ArticleCardData[]; whatsappNumber?: string; preview?: boolean}) {
  if (!preview && !hasTripSectionContent(section, trip, automaticTrips, automaticBlogs)) return null
  const title = section.heading || headings[section.kind]
  const id = section.kind === 'booking' ? 'booking' : `${section.kind}-${section._key}`
  const trips = trip.relatedSafariTrips?.filter((item) => item?._id !== trip._id) || []
  const recommendedTrips = trips.length ? trips : automaticTrips
  const overviewImage = section.image?.asset?.url ? section.image : trip.relatedDestinations?.find((destination) => destination?.heroImage?.asset?.url)?.heroImage || trip.gallery?.find((item) => item.kind === 'photo' && item.image?.asset?.url)?.image || trip.heroImage
  const content = section.kind === 'overview' ? <div className="safari-overview"><div className="safari-overview-copy"><SectionHeading eyebrow={section.eyebrow} title={title} />{section.body?.length || trip.introduction?.length ? <PortablePageText value={section.body?.length ? section.body : trip.introduction} /> : trip.summary ? <p>{trip.summary}</p> : null}<dl><div><dt>Duration</dt><dd>{trip.durationDays} days{trip.durationNights !== undefined ? ` / ${trip.durationNights} nights` : ''}</dd></div>{trip.travelStyle ? <div><dt>Travel style</dt><dd>{trip.travelStyle}</dd></div> : null}{trip.startLocation ? <div><dt>Starts in</dt><dd>{trip.startLocation}</dd></div> : null}{trip.endLocation ? <div><dt>Ends in</dt><dd>{trip.endLocation}</dd></div> : null}</dl></div><PageImage image={overviewImage} /></div> : null
  if (section.kind === 'relatedBlogs') {
    const selected = (trip.relatedBlogs || []).filter((item) => item?._id && item.slug)
    const seen = new Set(selected.map((item) => item._id))
    const articles = [...selected, ...automaticBlogs.filter((item) => item?._id && item.slug && !seen.has(item._id))]
    return articles.length ? <RelatedBlogs id={id} title={title} eyebrow={section.eyebrow || 'Asanja journal'} articles={articles} /> : preview ? <section className="safari-section safari-section-relatedBlogs" id={id}><SectionHeading eyebrow="Handpicked in Studio" title={title} /><div className="safari-preview-placeholder"><span aria-hidden="true">✳</span><div><strong>Selected blog cards appear here</strong><p>Search and choose published articles in Studio, or enable automatic recommendations for this section.</p></div></div></section> : null
  }
  if (section.kind === 'reviews') return <TripReviews id={id} items={trip.reviews} fallbackImage={trip.heroImage} preview={preview} />
  if (section.kind === 'booking') return <section className="safari-section safari-section-booking" id={id}><QuoteForm tripTitle={trip.title} slug={trip.slug} durationDays={trip.durationDays} durationNights={trip.durationNights} currency={trip.currency} options={trip.pricingOptions || []} experiences={trip.optionalExperiences || []} camps={trip.relatedCamps || []} whatsappNumber={whatsappNumber} preview={preview} sample={trip.isSample} heading={section.heading || trip.bookingHeading || 'Plan your trip'} intro={trip.bookingText?.length ? <PortablePageText value={trip.bookingText} /> : undefined} /></section>
  if (section.kind === 'highlights') {
    const highlightImages = [section.image, ...(trip.gallery || []).filter((item) => item.kind === 'photo').map((item) => item.image)]
      .filter((image): image is NonNullable<typeof section.image> => Boolean(image?.asset?.url))
      .filter((image, index, all) => all.findIndex((candidate) => candidate.asset?.url === image.asset?.url) === index)
    return <section className="safari-section safari-section-highlights" id={id}>
      <SectionHeading eyebrow={section.eyebrow} title={title} />
      <PortablePageText value={section.body} />
      {trip.highlights?.length ? <TripHighlights items={trip.highlights} images={highlightImages} /> : preview ? <PreviewPlaceholder kind="highlights" /> : null}
    </section>
  }
  if (section.kind === 'pricing') return <section className="safari-section safari-section-pricing" id={id}>
    <div className="safari-pricing-intro"><SectionHeading eyebrow={section.eyebrow} title={title} /><PortablePageText value={section.body} /><PortablePageText value={trip.pricingDescription} /></div>
    {trip.pricingOptions?.length ? <div className="safari-pricing-grid">{trip.pricingOptions.map((option, index) => {
      const rate = lowestPublishedRate(option)
      return <article key={option._key} className="safari-package">
        <div className="safari-package-top"><span className="safari-package-number">{String(index + 1).padStart(2, '0')}</span><span className="safari-package-type">{option.accommodationLevel || 'Private safari'}</span></div>
        <h3>{option.name}</h3>
        {option.description ? <p className="safari-package-description">{option.description}</p> : null}
        <div className="safari-price">{rate !== null ? <><span>From</span><strong>{new Intl.NumberFormat('en-US', {style: 'currency', currency: trip.currency || 'USD', maximumFractionDigits: 0}).format(rate)}</strong><small>per adult · final quote depends on dates and group size</small></> : <><span>Private quotation</span><strong>Price on request</strong><small>Tailored to your dates and group</small></>}</div>
        {option.features?.length ? <ul>{option.features.map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}
        {option.groupPrices?.length || option.seasonalPrices?.length ? <p className="safari-package-rate-note">{option.groupPrices?.length && option.seasonalPrices?.length ? 'Group and seasonal rates' : option.groupPrices?.length ? 'Group rates' : 'Seasonal rates'} are reflected in your tailored quote.</p> : null}
        <a className="safari-package-link" href="#safari-quote">Enquire about this journey <span aria-hidden="true">↗</span></a>
      </article>
    })}</div> : preview ? <PreviewPlaceholder kind="pricing" /> : <p className="safari-price-on-request">This journey is quoted around your dates, group and preferred accommodation.</p>}
    {preview ? <p className="safari-pricing-disclaimer">Illustrative options for this preview. Your travel designer will confirm the final itinerary, inclusions and rate.</p> : null}
  </section>
  if (section.kind === 'inclusions') return <section className="safari-section safari-section-inclusions" id={id}>
    <div className="safari-inclusions-layout">
      <div className="safari-inclusions-intro"><SectionHeading eyebrow={section.eyebrow} title={title} /><PortablePageText value={section.body} /></div>
      {trip.included?.length || trip.excluded?.length ? <div className="safari-inclusions">
        {trip.included?.length ? <div><span className="safari-inclusions-label">01 / Your journey</span><h3>What&apos;s included</h3><ul>{trip.included.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
        {trip.excluded?.length ? <div><span className="safari-inclusions-label">02 / To arrange separately</span><h3>Not included</h3><ul>{trip.excluded.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
      </div> : preview ? <PreviewPlaceholder kind="inclusions" /> : null}
    </div>
  </section>
  if (section.kind === 'faq') return <section className="safari-section safari-section-faq" id={id}>
    <SectionHeading eyebrow={section.eyebrow} title={title} />
    <PortablePageText value={section.body} />
    <FAQSection items={trip.faqs} />
    {trip.faqs?.length ? <p className="safari-faq-contact">Still have a question? <a href="#safari-quote">Ask a safari planner</a></p> : preview ? <PreviewPlaceholder kind="faq" /> : null}
  </section>
  return <section className={'safari-section safari-section-' + section.kind} id={id}>
    {section.kind !== 'overview' ? <SectionHeading eyebrow={section.eyebrow || 'Asanja Africa'} title={title} /> : null}
    {section.kind !== 'overview' ? <PortablePageText value={section.body} /> : null}
    {content}
    {section.kind === 'itinerary' ? <><SafariItinerary days={trip.itinerary} /><a className="safari-text-link" href={preview ? '/preview/safari-trip/itinerary.pdf/' : `/safaris/${trip.slug}/itinerary.pdf/`} download>{preview ? 'Download sample itinerary PDF ↓' : 'Download itinerary PDF ↓'}</a></> : null}
    {section.kind === 'route' ? <SafariRouteMap stops={tripRouteStops(trip)} /> : null}
    {section.kind === 'destinations' ? <CardGrid items={trip.relatedDestinations} label="Destination" preview={preview} editorial /> : null}
    {section.kind === 'accommodation' ? <CardGrid items={trip.relatedCamps} label="Stay" preview={preview} editorial /> : null}
    {section.kind === 'wildlife' ? <><PortablePageText value={trip.wildlife} />{trip.activities?.length ? <ul className="safari-pill-list">{trip.activities.map((item) => <li key={item}>{item}</li>)}</ul> : null}<PageImage image={section.image} className="safari-wide-image" /></> : null}
    {section.kind === 'gallery' ? <SafariGallery items={trip.gallery} /> : null}
    {section.kind === 'season' ? <><PortablePageText value={trip.bestTime} />{trip.bestMonths?.length ? <ul className="safari-pill-list">{trip.bestMonths.map((month) => <li key={month}>{month}</li>)}</ul> : null}<PageImage image={section.image} className="safari-wide-image" /></> : null}
    {section.kind === 'travel' ? <><PortablePageText value={trip.travelInformation} />{trip.travelNotes?.length ? <ul className="safari-travel-notes">{trip.travelNotes.map((note) => <li key={note}>{note}</li>)}</ul> : null}</> : null}
    {section.kind === 'relatedTrips' ? <CardGrid items={recommendedTrips} label="Safari trip" preview={preview} editorial /> : null}
    {section.kind === 'relatedLandingPages' ? <CardGrid items={trip.relatedLandingPages} label="Safari guide" preview={preview} /> : null}
    {section.kind === 'editorial' ? <div className="safari-editorial"><PageImage image={section.image} /></div> : null}
    {preview && !hasTripSectionContent(section, trip, automaticTrips, automaticBlogs) ? <PreviewPlaceholder kind={section.kind} /> : null}
  </section>
}

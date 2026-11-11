import {defineQuery} from 'next-sanity'
import {articleCardFields} from './queries'

const publicPage = 'defined(slug.current) && publicationStatus != "hidden" && ($includeDrafts == true || !(_id in path("drafts.**")))'
const imageFields = '{..., asset->{url, metadata{lqip, dimensions}}}'
const cardFields = `_id, _type, title, "slug": slug.current, publicationStatus, summary, category, location, durationDays, durationNights, priceFrom, currency, heroImage${imageFields}`
const textFields = '..., markDefs[]{..., _type == "internalLink" => {"target": reference->{_id, _type, "slug": slug.current, publicationStatus}}}'
const mediaFields = `_key, kind, caption, videoUrl, image${imageFields}`
const faqFields = `_key, question, answer[]{${textFields}}, "plainAnswer": pt::text(answer)`
const seoFields = `seo{..., openGraphImage${imageFields}}`

export const safariTripBySlugQuery = defineQuery(`
  *[_type == "safariTrip" && slug.current == $slug && (${publicPage} || $includeDrafts == true)][0]{
    ${cardFields}, heroEyebrow, heroImages[]${imageFields}, introduction[]{${textFields}},
    travelStyle, startLocation, endLocation, featured, highlights[]{_key, title, description},
    itinerary[]{_key, dayNumber, title, description[]{${textFields}},
      "destination": destination->{${cardFields}}, "accommodation": accommodation->{${cardFields}},
      activities, meals, notes, image${imageFields}},
    routeStops[]{_key, name, dayLabel, description, "coordinates": coalesce(coordinates, destination->coordinates), "destination": destination->{${cardFields}}},
    "relatedDestinations": relatedDestinations[]->{${cardFields}},
    "relatedCamps": relatedCamps[]->{${cardFields}},
    wildlife[]{${textFields}}, activities, bestTime[]{${textFields}}, bestMonths,
    gallery[]{${mediaFields}}, pricingDescription[]{${textFields}}, pricingOptions[]{_key, name, accommodationLevel, description, pricePerPerson, childPrice, groupPrices[]{_key, minAdults, maxAdults, pricePerPerson}, seasonalPrices[]{_key, label, from, to, pricePerPerson}, features},
    optionalExperiences[]{_key, name, description, pricePerPerson}, customQuoteAvailable,
    included, excluded, travelInformation[]{${textFields}}, travelNotes,
    "relatedSafariTrips": relatedSafariTrips[]->{${cardFields}},
    "relatedBlogs": relatedBlogs[]->{${articleCardFields}},
    "relatedLandingPages": relatedLandingPages[]->{${cardFields}},
    "automaticBlogCategoryIds": automaticBlogCategories[]._ref,
    "automaticBlogTagIds": automaticBlogTags[]._ref,
    automaticBlogsEnabled, automaticBlogsLimit,
    faqs[]{${faqFields}}, reviews[]{_key, name, country, quote, rating, source, sourceUrl, visitDate, image${imageFields}},
    sections[]{_key, kind, eyebrow, heading, body[]{${textFields}}, image${imageFields}},
    bookingHeading, bookingText[]{${textFields}}, ${seoFields}
  }
`)

export const seoLandingPageBySlugQuery = defineQuery(`
  *[_type == "seoLandingPage" && slug.current == $slug && (${publicPage} || $includeDrafts == true)][0]{
    ${cardFields}, eyebrow, introduction[]{${textFields}},
    sections[]{_key, kind, "anchor": anchor.current, eyebrow, heading, body[]{${textFields}}, image${imageFields},
      highlights[]{_key, title, description}, statistics[]{_key, value, label}, media[]{${mediaFields}},
      "destinations": destinations[]->{${cardFields}}, "camps": camps[]->{${cardFields}},
      "trips": trips[]->{${cardFields}}, "blogs": blogs[]->{${articleCardFields}},
      "landingPages": landingPages[]->{${cardFields}},
      faqs[]{${faqFields}}, testimonials[]{_key, name, country, quote, rating, source, sourceUrl, visitDate, image${imageFields}},
      ctaLabel, ctaUrl, "documentUrl": document.asset->url
    },
    "relatedBlogs": relatedBlogs[]->{${articleCardFields}},
    "relatedLandingPages": relatedLandingPages[]->{${cardFields}},
    "relatedDestinations": relatedDestinations[]->{${cardFields}},
    "relatedCamps": relatedCamps[]->{${cardFields}},
    "relatedSafariTrips": relatedSafariTrips[]->{${cardFields}},
    "automaticBlogCategoryIds": automaticBlogCategories[]._ref,
    "automaticBlogTagIds": automaticBlogTags[]._ref,
    automaticBlogsEnabled, automaticBlogsLimit, ${seoFields}
  }
`)

export const contentPageBySlugQuery = defineQuery(`
  *[_type == $type && slug.current == $slug && (${publicPage} || $includeDrafts == true)][0]{
    ${cardFields}, description[]{${textFields}}, location, coordinates, wildlife[]{${textFields}}, bestTime[]{${textFields}},
    activities, facilities, style, gallery[]{${mediaFields}}, "destination": destination->{${cardFields}},
    "relatedCamps": relatedCamps[]->{${cardFields}},
    "relatedSafariTrips": relatedSafariTrips[]->{${cardFields}},
    "relatedBlogs": relatedBlogs[]->{${articleCardFields}}, ${seoFields}
  }
`)

export const pageSeoBySlugQuery = defineQuery(`
  *[_type == $type && slug.current == $slug && (${publicPage} || $includeDrafts == true)][0]{
    _id, _type, title, "slug": slug.current, summary, ${seoFields}
  }
`)

export const automaticPageBlogsQuery = defineQuery(`
  *[_type == "article" && defined(slug.current) && !(_id in path("drafts.**")) && !(_id in $excludedIds) && (
    count(categories[_ref in $categoryIds]) > 0 || count(tags[_ref in $tagIds]) > 0 || count(destinations[_ref in $destinationIds]) > 0
  )] | order(coalesce(originalPublishedAt, _createdAt) desc)[0...12]{${articleCardFields}}
`)

export const automaticTripsQuery = defineQuery(`
  *[_type == "safariTrip" && defined(slug.current) && publicationStatus != "hidden" && !(_id in path("drafts.**")) && _id != $currentId && count(relatedDestinations[_ref in $destinationIds]) > 0]
    | order(_updatedAt desc)[0...6]{${cardFields}}
`)

export const pageSitemapQuery = defineQuery(`
  *[_type in ["safariTrip", "seoLandingPage", "destination", "camp"] && defined(slug.current) && publicationStatus != "hidden" && seo.noIndex != true && !(_id in path("drafts.**"))]{
    _id, _type, "slug": slug.current, _updatedAt
  }
`)

export const siteSettingsQuery = defineQuery('*[_type == "siteSettings" && _id == "siteSettings"][0]{whatsappNumber, contactEmail}')

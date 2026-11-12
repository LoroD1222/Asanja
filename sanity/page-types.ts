import type {PortableTextBlock} from 'next-sanity'
import type {ArticleCardData, SanityImage} from './types'

export type PageKind = 'article' | 'safariTrip' | 'seoLandingPage' | 'destination' | 'camp'
export type PageTarget = {_id: string; _type: PageKind; slug: string; publicationStatus?: string}
export type PageMark = {_key: string; _type: 'internalLink' | 'externalLink'; href?: string; blank?: boolean; fragment?: string; target?: PageTarget | null}
export type PageText = Array<PortableTextBlock & {markDefs?: PageMark[]}>
export type GeoPoint = {lat: number; lng: number}

export type PageCard = PageTarget & {
  title: string
  summary?: string
  heroImage?: SanityImage
  coordinates?: GeoPoint
  category?: string
  location?: string
  durationDays?: number
  durationNights?: number
  priceFrom?: number
  currency?: string
}

export type PageSeo = {
  title?: string; description?: string; canonicalUrl?: string; openGraphTitle?: string
  openGraphDescription?: string; openGraphImage?: SanityImage; noIndex?: boolean
}

export type PageMedia = {_key: string; kind: 'photo' | 'video'; image?: SanityImage; caption?: string; videoUrl?: string}
export type FAQ = {_key: string; question: string; answer?: PageText; plainAnswer?: string}
export type Review = {_key: string; name: string; country?: string; quote: string; rating?: number; source?: string; sourceUrl?: string; visitDate?: string; image?: SanityImage}

export type RouteStop = {_key: string; name: string; dayLabel?: string; description?: string; coordinates?: GeoPoint; destination?: PageCard | null}
export type ItineraryDay = {_key: string; dayNumber: number; title: string; description?: PageText; destination?: PageCard | null; accommodation?: PageCard | null; activities?: string[]; meals?: string[]; notes?: string; image?: SanityImage}
export type TripPricingOption = {_key: string; name: string; accommodationLevel?: string; description?: string; pricePerPerson?: number; childPrice?: number; groupPrices?: Array<{_key: string; minAdults: number; maxAdults: number; pricePerPerson: number}>; seasonalPrices?: Array<{_key: string; label?: string; from?: string; to?: string; pricePerPerson?: number}>; features?: string[]}
export type OptionalExperience = {_key: string; name: string; description?: string; pricePerPerson?: number}
export type TripSection = {_key: string; kind: 'overview' | 'highlights' | 'itinerary' | 'route' | 'destinations' | 'accommodation' | 'wildlife' | 'gallery' | 'pricing' | 'inclusions' | 'season' | 'travel' | 'relatedTrips' | 'relatedBlogs' | 'relatedLandingPages' | 'faq' | 'reviews' | 'booking' | 'editorial'; eyebrow?: string; heading?: string; body?: PageText; image?: SanityImage}

export type SafariTrip = PageCard & {
  heroEyebrow?: string; heroImages?: SanityImage[]; introduction?: PageText; durationDays: number; durationNights?: number
  travelStyle?: string; startLocation?: string; endLocation?: string; featured?: boolean; highlights?: Array<{_key: string; title: string; description?: string}>
  itinerary?: ItineraryDay[]; routeStops?: RouteStop[]; relatedDestinations?: PageCard[]; relatedCamps?: PageCard[]
  wildlife?: PageText; activities?: string[]; bestTime?: PageText; bestMonths?: string[]; gallery?: PageMedia[]
  pricingDescription?: PageText; pricingOptions?: TripPricingOption[]; optionalExperiences?: OptionalExperience[]; customQuoteAvailable?: boolean
  included?: string[]; excluded?: string[]; travelInformation?: PageText; travelNotes?: string[]
  relatedSafariTrips?: PageCard[]; relatedBlogs?: ArticleCardData[]; relatedLandingPages?: PageCard[]
  automaticBlogCategoryIds?: string[]; automaticBlogTagIds?: string[]; automaticBlogsEnabled?: boolean; automaticBlogsLimit?: number
  faqs?: FAQ[]; reviews?: Review[]; sections?: TripSection[]; bookingHeading?: string; bookingText?: PageText; seo?: PageSeo
}

export type EditorialSection = {_key: string; kind: 'editorial' | 'highlights' | 'statistics' | 'gallery' | 'destinations' | 'camps' | 'trips' | 'blogs' | 'landingPages' | 'faq' | 'testimonials' | 'cta' | 'download'; anchor?: string; eyebrow?: string; heading?: string; body?: PageText; image?: SanityImage; highlights?: Array<{_key: string; title: string; description?: string}>; statistics?: Array<{_key: string; value: string; label: string}>; media?: PageMedia[]; destinations?: PageCard[]; camps?: PageCard[]; trips?: PageCard[]; blogs?: ArticleCardData[]; landingPages?: PageCard[]; faqs?: FAQ[]; testimonials?: Review[]; ctaLabel?: string; ctaUrl?: string; documentUrl?: string}

export type SeoLandingPage = PageCard & {eyebrow?: string; introduction?: PageText; sections?: EditorialSection[]; relatedBlogs?: ArticleCardData[]; relatedLandingPages?: PageCard[]; relatedDestinations?: PageCard[]; relatedCamps?: PageCard[]; relatedSafariTrips?: PageCard[]; automaticBlogCategoryIds?: string[]; automaticBlogTagIds?: string[]; automaticBlogsEnabled?: boolean; automaticBlogsLimit?: number; seo?: PageSeo}

export type ContentPage = PageCard & {description?: PageText; wildlife?: PageText; bestTime?: PageText; activities?: string[]; facilities?: string[]; style?: string; coordinates?: GeoPoint; gallery?: PageMedia[]; relatedCamps?: PageCard[]; relatedSafariTrips?: PageCard[]; relatedBlogs?: ArticleCardData[]; destination?: PageCard; seo?: PageSeo}

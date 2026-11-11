import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {SafariTripPage} from '../../../components/pages/safari-trip-page'
import {publishedClient} from '../../../sanity/client'
import {articlesQuery} from '../../../sanity/queries'
import type {PageText, SafariTrip} from '../../../sanity/page-types'
import type {ArticleCollection, SanityImage} from '../../../sanity/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Safari trip template preview',
  robots: {index: false, follow: false},
}

// This fixture is only rendered in development. It uses the existing legacy
// "Wild Treasures of Tanzania" trip outline and existing site photographs;
// production trips are always fetched from Sanity by slug.
const image = (path: string, alt: string, width: number, height: number): SanityImage => ({
  _type: 'image', alt, asset: {url: path, metadata: {dimensions: {width, height}}},
})
const hero = image('/legacy/wp-content/uploads/2025/08/Lion-on-rock-1-e1755693568345.webp', 'Lion resting on a rock', 1510, 1086)
const serengeti = image('/legacy/wp-content/uploads/2025/07/safaris-serengeti-wildbeest_20250723135727.webp', 'Wildebeest on the Serengeti plains', 1800, 1013)
const tarangire = image('/legacy/wp-content/uploads/2025/07/safaris-tarangire-lion-and-baobab_20250723124034.webp', 'Lion and baobab in Tarangire', 1800, 1200)
const ngorongoro = image('/legacy/wp-content/uploads/2025/07/safaris-ngorongoro-baby-lion_20250723142739.webp', 'Young lion in Ngorongoro', 1800, 1350)
const ruaha = image('/legacy/wp-content/uploads/2025/07/safars-ruaha-leopard_20250723141815.webp', 'Leopard in Ruaha', 1135, 834)

function paragraph(copy: string, key: string): PageText {
  return [{_type: 'block', _key: key, style: 'normal', markDefs: [], children: [{_type: 'span', _key: `${key}-span`, text: copy, marks: []}]}]
}

function previewTrip(introduction: PageText, relatedBlogs: ArticleCollection['articles']): SafariTrip {
  return {
    _id: 'local-template-preview', _type: 'safariTrip', slug: 'local-template-preview',
    title: 'Wild Treasures of Tanzania', category: 'Wildlife',
    summary: 'A journey through Arusha, Tarangire, Ngorongoro, Serengeti and Ruaha, adapted from Asanja Africa’s existing trip outline for this template preview.',
    durationDays: 13, durationNights: 12, travelStyle: 'Private',
    startLocation: 'Arusha', endLocation: 'Ruaha', heroImage: hero, heroImages: [serengeti, tarangire],
    introduction,
    highlights: [
      {_key: 'drives', title: 'Private game drives', description: 'Private and exclusive game drives are listed in the existing trip outline.'},
      {_key: 'guide', title: 'Your own guide', description: 'A knowledgeable, private English-speaking guide accompanies the safari.'},
      {_key: 'parks', title: 'Five remarkable stops', description: 'Arusha, Tarangire, Ngorongoro, Serengeti and Ruaha appear in the existing route outline.'},
    ],
    itinerary: [
      {_key: 'arusha', dayNumber: 1, title: 'Arusha', description: paragraph('Existing trip outline: 1 night in Arusha.', 'arusha-copy')},
      {_key: 'tarangire', dayNumber: 2, title: 'Tarangire National Park', description: paragraph('Existing trip outline: 2 nights in Tarangire National Park.', 'tarangire-copy'), image: tarangire},
      {_key: 'ngorongoro', dayNumber: 4, title: 'Ngorongoro Conservation Area', description: paragraph('Existing trip outline: 1 night in Ngorongoro, with a half-day crater visit and crater fees.', 'ngorongoro-copy'), image: ngorongoro},
      {_key: 'serengeti', dayNumber: 5, title: 'Serengeti National Park', description: paragraph('Existing trip outline: 4 nights at Asanja Nyasirori.', 'serengeti-copy'), image: serengeti},
      {_key: 'ruaha', dayNumber: 9, title: 'Ruaha National Park', description: paragraph('Existing trip outline: 4 nights at Asanja Ndembo.', 'ruaha-copy'), image: ruaha},
    ],
    wildlife: paragraph('The original Asanja trip features private game drives across Tarangire, Ngorongoro, Serengeti and Ruaha. Add the complete wildlife story in Sanity Studio for a published trip.', 'wildlife-copy'),
    gallery: [
      {_key: 'serengeti-photo', kind: 'photo', image: serengeti, caption: 'Serengeti'},
      {_key: 'tarangire-photo', kind: 'photo', image: tarangire, caption: 'Tarangire'},
      {_key: 'ngorongoro-photo', kind: 'photo', image: ngorongoro, caption: 'Ngorongoro'},
      {_key: 'ruaha-photo', kind: 'photo', image: ruaha, caption: 'Ruaha'},
    ],
    travelInformation: paragraph('The existing trip outline lists flights from the Serengeti to Ruaha and from Ruaha to Dar es Salaam, with a 15 kg soft-bag allowance per person.', 'travel-copy'),
    relatedBlogs,
    sections: [
      {_key: 'overview', kind: 'overview', image: serengeti},
      {_key: 'highlights', kind: 'highlights'},
      {_key: 'itinerary', kind: 'itinerary', eyebrow: 'Existing route outline', heading: 'The journey, stage by stage'},
      {_key: 'route', kind: 'route'},
      {_key: 'destinations', kind: 'destinations'},
      {_key: 'accommodation', kind: 'accommodation'},
      {_key: 'wildlife', kind: 'wildlife', image: ruaha},
      {_key: 'gallery', kind: 'gallery'},
      {_key: 'pricing', kind: 'pricing'},
      {_key: 'inclusions', kind: 'inclusions'},
      {_key: 'season', kind: 'season'},
      {_key: 'travel', kind: 'travel'},
      {_key: 'related-trips', kind: 'relatedTrips'},
      {_key: 'related-blogs', kind: 'relatedBlogs', heading: 'From the Asanja journal'},
      {_key: 'related-pages', kind: 'relatedLandingPages'},
      {_key: 'faq', kind: 'faq'},
      {_key: 'reviews', kind: 'reviews'},
      {_key: 'booking', kind: 'booking', heading: 'Plan a journey like this'},
    ],
  }
}

export default async function SafariTripTemplatePreview() {
  if (process.env.NODE_ENV !== 'development') notFound()
  const collection = await publishedClient.fetch<ArticleCollection>(articlesQuery(0, 3), {includeDrafts: false}).catch(() => ({articles: [], total: 0}))
  const articles = collection.articles || []
  const first = articles[0]
  const introduction = paragraph('This local preview shows the actual CMS-driven safari template using the route outline of an existing Asanja Africa trip. A published trip can replace this preview with its own images, itinerary, links and pricing.', 'intro-copy')
  if (first) introduction.push({
    _type: 'block', _key: 'journal-link', style: 'normal',
    markDefs: [{_key: 'cms-article', _type: 'internalLink', target: {_id: first._id, _type: 'article', slug: first.slug}}],
    children: [
      {_type: 'span', _key: 'journal-before', text: 'The rich-text editor can also link directly to a published CMS article, such as ', marks: []},
      {_type: 'span', _key: 'journal-title', text: first.title, marks: ['cms-article']},
      {_type: 'span', _key: 'journal-after', text: '.', marks: []},
    ],
  })
  return <SafariTripPage trip={previewTrip(introduction, first ? [first] : [])} automaticBlogs={articles.slice(1)} automaticTrips={[]} preview />
}

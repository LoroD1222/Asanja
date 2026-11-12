import type {PageText, SafariTrip} from './page-types'
import type {ArticleCardData, SanityImage} from './types'

// This no-index fixture demonstrates the template with the existing Asanja
// "Wild Treasures of Tanzania" outline. It is not a published CMS trip.
const image = (path: string, alt: string, width: number, height: number): SanityImage => ({
  _type: 'image', alt, asset: {url: path, metadata: {dimensions: {width, height}}},
})
const hero = image('/legacy/wp-content/uploads/2025/08/Lion-on-rock-1-e1755693568345.webp', 'Lion resting on a rock', 1510, 1086)
const serengeti = image('/legacy/wp-content/uploads/2025/07/safaris-serengeti-wildbeest_20250723135727.webp', 'Wildebeest on the Serengeti plains', 1800, 1013)
const tarangire = image('/legacy/wp-content/uploads/2025/07/safaris-tarangire-lion-and-baobab_20250723124034.webp', 'Lion and baobab in Tarangire', 1800, 1200)
const ngorongoro = image('/legacy/wp-content/uploads/2025/07/safaris-ngorongoro-baby-lion_20250723142739.webp', 'Young lion in Ngorongoro', 1800, 1350)
const ruaha = image('/legacy/wp-content/uploads/2025/07/safars-ruaha-leopard_20250723141815.webp', 'Leopard in Ruaha', 1135, 834)

export function previewParagraph(copy: string, key: string): PageText {
  return [{_type: 'block', _key: key, style: 'normal', markDefs: [], children: [{_type: 'span', _key: `${key}-span`, text: copy, marks: []}]}]
}

const overnight = (dayNumber: number, title: string, description: string, photo?: SanityImage) => ({
  _key: `day-${dayNumber}`, dayNumber, title, description: previewParagraph(description, `day-${dayNumber}-copy`), image: photo,
})

export function buildPreviewTrip(introduction?: PageText, relatedBlogs: ArticleCardData[] = []): SafariTrip {
  return {
    _id: 'local-template-preview', _type: 'safariTrip', slug: 'local-template-preview',
    title: 'Wild Treasures of Tanzania', category: 'Wildlife', heroEyebrow: 'Private Tanzania safari',
    summary: 'A journey through Arusha, Tarangire, Ngorongoro, Serengeti and Ruaha, adapted from Asanja Africa’s existing trip outline for this template preview.',
    durationDays: 13, durationNights: 12, travelStyle: 'Private',
    startLocation: 'Arusha', endLocation: 'Dar es Salaam', heroImage: hero, heroImages: [serengeti, tarangire],
    introduction: introduction || previewParagraph('This sample demonstrates the CMS-driven trip template using an existing Asanja Africa route outline. Day-specific activities, prices and availability must be confirmed before a trip is published.', 'intro-copy'),
    highlights: [
      {_key: 'drives', title: 'Private game drives', description: 'Private and exclusive game drives are listed in the existing trip outline.'},
      {_key: 'guide', title: 'Your own guide', description: 'A knowledgeable, private English-speaking guide accompanies the safari.'},
      {_key: 'parks', title: 'Five remarkable stops', description: 'Arusha, Tarangire, Ngorongoro, Serengeti and Ruaha appear in the existing route outline.'},
    ],
    itinerary: [
      overnight(1, 'Arrival in Arusha', 'The existing trip outline begins with one night in Arusha.'),
      overnight(2, 'Tarangire National Park', 'First of two nights allocated to Tarangire National Park in the existing trip outline.', tarangire),
      overnight(3, 'Tarangire National Park', 'Second night in Tarangire. Day-specific activities are confirmed in the final itinerary.', tarangire),
      overnight(4, 'Ngorongoro Conservation Area', 'One night in Ngorongoro, with a half-day crater visit and crater fees listed in the existing outline.', ngorongoro),
      overnight(5, 'Serengeti National Park', 'First of four nights in the Serengeti at Asanja Nyasirori.', serengeti),
      overnight(6, 'Serengeti National Park', 'Second night at Asanja Nyasirori. Day-specific activities are confirmed in the final itinerary.', serengeti),
      overnight(7, 'Serengeti National Park', 'Third night at Asanja Nyasirori. Day-specific activities are confirmed in the final itinerary.', serengeti),
      overnight(8, 'Serengeti National Park', 'Fourth night at Asanja Nyasirori. Day-specific activities are confirmed in the final itinerary.', serengeti),
      overnight(9, 'Ruaha National Park', 'First of four nights in Ruaha at Asanja Ndembo.', ruaha),
      overnight(10, 'Ruaha National Park', 'Second night at Asanja Ndembo. Day-specific activities are confirmed in the final itinerary.', ruaha),
      overnight(11, 'Ruaha National Park', 'Third night at Asanja Ndembo. Day-specific activities are confirmed in the final itinerary.', ruaha),
      overnight(12, 'Ruaha National Park', 'Fourth night at Asanja Ndembo. Day-specific activities are confirmed in the final itinerary.', ruaha),
      overnight(13, 'Departure for Dar es Salaam', 'The existing outline includes a flight from Msembe airstrip in Ruaha to Dar es Salaam.'),
    ],
    // Approximate city and park reference points, not an operational travel route.
    // City: GeoNames 161325. Parks: UN Tanzania Environment Statistics 2014,
    // UNESCO World Heritage listings 39bis and 156, and NGA gazetteer for Ruaha.
    routeStops: [
      {_key: 'arusha-map', name: 'Arusha', dayLabel: 'Day 1', coordinates: {lat: -3.36667, lng: 36.68333}},
      {_key: 'tarangire-map', name: 'Tarangire National Park', dayLabel: 'Days 2–3', coordinates: {lat: -3.83333, lng: 36}},
      {_key: 'ngorongoro-map', name: 'Ngorongoro Conservation Area', dayLabel: 'Day 4', coordinates: {lat: -3.18722, lng: 35.54083}},
      {_key: 'serengeti-map', name: 'Serengeti National Park', dayLabel: 'Days 5–8', coordinates: {lat: -2.74, lng: 34.859}},
      {_key: 'ruaha-map', name: 'Ruaha National Park', dayLabel: 'Days 9–12', coordinates: {lat: -7.5, lng: 35}},
    ],
    wildlife: previewParagraph('The original Asanja trip lists private game drives in Tarangire, Ngorongoro, Serengeti and Ruaha. The detailed wildlife story is written per trip in Sanity Studio.', 'wildlife-copy'),
    gallery: [
      {_key: 'serengeti-photo', kind: 'photo', image: serengeti, caption: 'Serengeti'},
      {_key: 'tarangire-photo', kind: 'photo', image: tarangire, caption: 'Tarangire'},
      {_key: 'ngorongoro-photo', kind: 'photo', image: ngorongoro, caption: 'Ngorongoro'},
      {_key: 'ruaha-photo', kind: 'photo', image: ruaha, caption: 'Ruaha'},
    ],
    included: [
      'Transfers listed in the existing trip outline',
      'Flights from Grumeti to Msembe and from Msembe to Dar es Salaam',
      'Private game drives and a private English-speaking guide',
      'Dedicated 4×4 safari vehicle with a pop-up roof hatch',
      'Park and concession fees',
    ],
    travelInformation: previewParagraph('The existing outline lists flights from the Serengeti to Ruaha and from Ruaha to Dar es Salaam, with a maximum baggage allowance of 15 kg per person in soft bags.', 'travel-copy'),
    relatedBlogs,
    sections: [
      {_key: 'overview', kind: 'overview', image: serengeti},
      {_key: 'highlights', kind: 'highlights'},
      {_key: 'itinerary', kind: 'itinerary', eyebrow: 'Existing route outline', heading: 'The journey, day by day'},
      {_key: 'route', kind: 'route', body: previewParagraph('This map plots approximate reference points to demonstrate the interactive route. A published safari uses verified stops selected in the CMS.', 'map-note')},
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

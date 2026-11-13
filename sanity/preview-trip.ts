import type {PageCard, PageText, SafariTrip} from './page-types'
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
const nyasiroriCamp = image('/legacy/wp-content/uploads/2025/10/Asanja-Nyasirori-Main-picture-1.webp', 'Asanja Nyasirori camp', 1200, 800)
const ndemboCamp = image('/legacy/wp-content/uploads/2025/07/camps-asanja-ndembo-lounge_20250710111917.webp', 'Asanja Ndembo lounge', 1200, 800)
const giraffes = image('/legacy/wp-content/uploads/2025/05/safaris-masterpiece-giraffes_20250723123323.webp', 'Giraffes on safari', 1200, 800)
const figmaMoruCamp = image('/figma-trip-review/camp.png', 'Asanja Moru safari tent in its natural setting', 1400, 788)
const figmaMoruThumb = image('/figma-trip-review/thumbnails.jpg', 'Asanja Moru tent', 4000, 1868)
const figmaGuestAvatar = image('/figma-trip-review/avatar.png', 'Guest profile photograph', 100, 100)

const demoCard = (id: string, type: PageCard['_type'], title: string, summary: string, heroImage: SanityImage, extras: Partial<PageCard> = {}): PageCard => ({
  _id: `demo-${id}`, _type: type, slug: id, title, summary, heroImage, ...extras,
})

export function previewParagraph(copy: string, key: string): PageText {
  return [{_type: 'block', _key: key, style: 'normal', markDefs: [], children: [{_type: 'span', _key: `${key}-span`, text: copy, marks: []}]}]
}

const overnight = (dayNumber: number, title: string, paragraphs: string[], photo?: SanityImage) => ({
  _key: `day-${dayNumber}`, dayNumber, title,
  description: paragraphs.flatMap((paragraph, index) => previewParagraph(paragraph, `day-${dayNumber}-copy-${index + 1}`)),
  image: photo,
})

export function buildPreviewTrip(introduction?: PageText, relatedBlogs: ArticleCardData[] = []): SafariTrip {
  return {
    _id: 'local-template-preview', _type: 'safariTrip', slug: 'local-template-preview',
    title: 'Wild Treasures of Tanzania', category: 'Wildlife', heroEyebrow: 'Private Tanzania safari',
    summary: 'From Tarangire’s ancient baobabs to the Serengeti plains and wild Ruaha, discover Tanzania on a private journey shaped around you.',
    durationDays: 13, durationNights: 12, travelStyle: 'Private',
    startLocation: 'Arusha', endLocation: 'Dar es Salaam', heroImage: hero,
    heroDescription: previewParagraph('From Tarangire’s ancient baobabs to the Serengeti plains and wild Ruaha, discover Tanzania on a private journey shaped around you.', 'hero-description'),
    introduction: introduction || previewParagraph('Explore the changing landscapes of northern and southern Tanzania, with private guiding, remarkable wildlife areas and time to unwind in the bush.', 'intro-copy'),
    highlights: [
      {_key: 'drives', title: 'Explore at your own pace', description: 'Private game drives in a dedicated 4×4 leave room to pause for the wildlife, landscapes and moments that catch your eye.'},
      {_key: 'guide', title: 'Guided, not hurried', description: 'A private English-speaking guide helps shape each day around the conditions and your interests.'},
      {_key: 'parks', title: 'North meets south', description: 'Journey through Tarangire, Ngorongoro and the Serengeti before flying to the wide wilderness of Ruaha.'},
    ],
    itinerary: [
      overnight(1, 'Arrival in Arusha', [
        'Your journey begins in Arusha, the gateway to Tanzania’s northern safari circuit. Arrive, settle in and take a moment to unwind after your travels.',
        'This first night leaves room to rest before the adventure starts. Your travel designer will confirm the arrival transfer, accommodation and next-day departure details in your final itinerary.',
      ]),
      overnight(2, 'Into Tarangire', [
        'Leave Arusha and travel toward Tarangire for the first of two nights in this distinctive landscape. The route opens onto broad views and the park’s memorable baobab scenery.',
        'Meet your private guide and begin exploring at a pace that works for your arrival time. The exact game-drive plan and overnight arrangements will be confirmed for your travel dates.',
      ], tarangire),
      overnight(3, 'A full day in Tarangire', [
        'With a full day here, there is time to explore beyond a quick first impression. Follow your guide through changing habitats and pause when a sighting invites a longer look.',
        'The day can be shaped around the conditions and your interests, with space for a slower midday break before returning to your accommodation for a second night in Tarangire.',
      ], tarangire),
      overnight(4, 'Ngorongoro Conservation Area', [
        'Continue from Tarangire to the Ngorongoro Conservation Area. The existing trip outline includes a half-day crater visit, giving this stage a very different setting from the days before.',
        'After your time in the crater, settle in for one night in the area. Your guide will confirm the order of travel, the visit and your accommodation in the final day-by-day plan.',
      ], ngorongoro),
      overnight(5, 'On to the Serengeti', [
        'Travel onward to the Serengeti, where open plains mark the next chapter of the safari. The journey itself offers a chance to watch the scenery change as you head toward camp.',
        'Settle in at Asanja Nyasirori, listed in the existing outline as your base for four nights. Your first Serengeti outing will depend on the day’s travel time and final arrangements.',
      ], serengeti),
      overnight(6, 'Serengeti safari', [
        'Begin a full day in the Serengeti with your private guide. Rather than following a fixed checklist, the drive can respond to recent sightings, weather and the areas best suited to your interests.',
        'Take time to enjoy the wider landscape as well as the wildlife you encounter. Return to Asanja Nyasirori at the end of the day, ready for another perspective on the plains tomorrow.',
      ], serengeti),
      overnight(7, 'More time on the plains', [
        'A second full Serengeti day gives the journey breathing room. You might revisit a promising area or explore a different part of the landscape with your guide, depending on the season.',
        'This is the benefit of several nights in one place: less time packing and more time noticing the details. The exact route remains flexible rather than promising a particular sighting.',
      ], serengeti),
      overnight(8, 'Your final Serengeti day', [
        'Make the most of your final full day based at Asanja Nyasirori. Follow the light and the wildlife with your guide, or simply enjoy a less hurried pace before the next leg of the journey.',
        'Tonight is the fourth night in the Serengeti in the existing trip outline. The following stage connects the northern safari circuit with Ruaha in southern Tanzania.',
      ], serengeti),
      overnight(9, 'Fly to Ruaha', [
        'The existing route includes a flight from Grumeti to Msembe. After arriving in Ruaha, the setting changes again as you begin the southern part of your safari.',
        'Settle in at Asanja Ndembo, listed as your base for four nights. Flight timing, transfers and any available safari time on arrival will be confirmed when your dates are booked.',
      ], ruaha),
      overnight(10, 'Ruaha in your own time', [
        'Spend your first full day exploring Ruaha with a private guide. There is time to get a feel for its landscape and let the day unfold around what you find along the way.',
        'Your guide can adapt the outing to the conditions and your preferences. The final proposal will set out confirmed activities, timings and any arrangements specific to your stay.',
      ], ruaha),
      overnight(11, 'Another day in Ruaha', [
        'A second full day gives you room to see Ruaha from another angle. Return to an area that caught your eye or take a different route as the light and activity change.',
        'The itinerary is designed to feel unhurried, with time back at Asanja Ndembo between outings if your confirmed schedule allows. No particular wildlife encounter can be guaranteed.',
      ], ruaha),
      overnight(12, 'A final day in the bush', [
        'Enjoy one last full safari day in Ruaha before the onward journey. This is a chance to slow down, take in the landscape and make the most of your time with your guide.',
        'Return to Asanja Ndembo for the fourth night shown in the existing outline. Your departure transfer and flight details will be included in the confirmed travel documents.',
      ], ruaha),
      overnight(13, 'Departure for Dar es Salaam', [
        'The journey closes with the flight from Msembe airstrip to Dar es Salaam listed in the existing trip outline. Leave Ruaha behind with thirteen days of contrasting safari landscapes to remember.',
        'Your final itinerary will specify flight times, transfers and onward connection details. This preview illustrates the page layout; it is not a confirmed booking or ticketed schedule.',
      ]),
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
    relatedDestinations: [
      demoCard('tarangire', 'destination', 'Tarangire National Park', 'Baobab-studded scenery and rewarding game drives introduce the journey.', tarangire, {location: 'Northern Tanzania'}),
      demoCard('serengeti', 'destination', 'Serengeti National Park', 'Wide open plains form the heart of this safari route.', serengeti, {location: 'Northern Tanzania'}),
      demoCard('ruaha', 'destination', 'Ruaha National Park', 'A contrasting southern landscape adds another dimension to the trip.', ruaha, {location: 'Southern Tanzania'}),
    ],
    relatedCamps: [
      demoCard('asanja-nyasirori', 'camp', 'Asanja Nyasirori', 'Your Serengeti base for four nights, with the plains waiting beyond camp.', nyasiroriCamp, {location: 'Serengeti National Park'}),
      demoCard('asanja-ndembo', 'camp', 'Asanja Ndembo', 'Settle into the rhythm of Ruaha with four nights at Asanja Ndembo.', ndemboCamp, {location: 'Ruaha National Park'}),
    ],
    gallery: [
      {_key: 'serengeti-photo', kind: 'photo', image: serengeti, caption: 'Serengeti'},
      {_key: 'tarangire-photo', kind: 'photo', image: tarangire, caption: 'Tarangire'},
      {_key: 'ngorongoro-photo', kind: 'photo', image: ngorongoro, caption: 'Ngorongoro'},
      {_key: 'ruaha-photo', kind: 'photo', image: ruaha, caption: 'Ruaha'},
    ],
    pricingDescription: previewParagraph('Every safari is shaped around the people taking it. Start with the travel style that feels right, then let us tailor the details to your dates.', 'pricing-copy'),
    pricingOptions: [
      {_key: 'classic-demo', name: 'Classic private safari', accommodationLevel: 'The essential journey', description: 'A thoughtful way to experience the full route, with a private guide and stays chosen to suit your travel dates.', features: ['Private guide and safari vehicle', 'Camps selected around your itinerary', 'A route paced for your group']},
      {_key: 'signature-demo', name: 'Signature safari', accommodationLevel: 'More room to make it yours', description: 'A more personalised approach to camp choices, pacing and the moments you want to make time for.', features: ['Private guiding throughout', 'Flexible accommodation preferences', 'Optional experiences by request']},
    ],
    optionalExperiences: [
      {_key: 'experience-demo', name: 'A special occasion experience', description: 'Example add-on; availability and cost are confirmed in the final proposal.'},
    ],
    included: [
      'Transfers shown in your trip plan',
      'Flights from Grumeti to Msembe and from Msembe to Dar es Salaam',
      'Private game drives and a private English-speaking guide',
      'Dedicated 4×4 safari vehicle with a pop-up roof hatch',
      'Park and concession fees',
    ],
    excluded: ['International flights', 'Travel insurance', 'Personal purchases and gratuities'],
    bestTime: previewParagraph('There is no single perfect month for every safari. Tell us when you hope to travel and our team can shape the route, camp choices and pace around the conditions you want to experience.', 'season-copy'),
    travelInformation: previewParagraph('The existing outline lists flights from the Serengeti to Ruaha and from Ruaha to Dar es Salaam, with a maximum baggage allowance of 15 kg per person in soft bags.', 'travel-copy'),
    relatedSafariTrips: [
      demoCard('northern-safari', 'safariTrip', 'Northern Tanzania Explorer', 'A shorter sample journey through northern Tanzania’s celebrated safari landscapes.', giraffes, {durationDays: 8, durationNights: 7, category: 'Wildlife'}),
      demoCard('ruaha-escape', 'safariTrip', 'Ruaha Wilderness Escape', 'An example fly-in escape focused on the quieter southern safari circuit.', ruaha, {durationDays: 6, durationNights: 5, category: 'Fly-in'}),
    ],
    relatedBlogs,
    relatedLandingPages: [
      demoCard('serengeti-guide', 'seoLandingPage', 'The Serengeti Safari Guide', 'Explore the landscapes, seasons and experiences that make the Serengeti unforgettable.', serengeti),
      demoCard('tanzania-safari-planning', 'seoLandingPage', 'Planning a Tanzania Safari', 'Find inspiration for choosing a route, the right season and a travel style that fits.', tarangire),
    ],
    faqs: [
      {_key: 'faq-dates', question: 'Can I choose my own travel dates?', answer: previewParagraph('Yes—share your preferred dates and our team can confirm availability before tailoring the final itinerary.', 'faq-dates-answer')},
      {_key: 'faq-custom', question: 'Can this itinerary be tailored?', answer: previewParagraph('The journey can be shaped around your pace, interests and accommodation preferences. Your final proposal will set out the confirmed details.', 'faq-custom-answer')},
      {_key: 'faq-packing', question: 'What should I pack for the safari?', answer: previewParagraph('Bring comfortable layers and practical safari essentials. The existing route specifies a 15 kg soft-bag limit for its internal flights; your confirmed travel notes will provide the full packing guidance.', 'faq-packing-answer')},
    ],
    reviews: [
      {_key: 'review-demo-one', name: 'Kathy P.', guestDescription: 'Family of three', rating: 5, quote: 'We stayed at Asanja Moru for three nights and I am definitely coming back here again. I have travelled a lot but this has to be my favourite place I have stayed at. The hospitality was unmatched, the food was the best we had in Tanzania and the accommodation itself was just unreal. They made every moment special like bringing us a cake for climbing Kilimanjaro. We loved loved this place.', mobileQuote: 'We stayed for only three nights, but all of us were teary-eyed when we left. The elephants were twenty feet away each morning at breakfast.', image: figmaGuestAvatar, settingImage: figmaMoruCamp, locationLabel: 'Moru, Emanyata tent', source: 'TripAdvisor', sourceUrl: 'https://www.tripadvisor.com/Search?geo=6&q=asanja&ssrc=h'},
      {_key: 'review-demo-two', name: 'Sample guest', guestDescription: 'Illustrative story', rating: 5, quote: 'Every day felt thoughtfully paced, from the first game drive to the quiet evenings back at camp.', settingImage: figmaMoruThumb},
      {_key: 'review-demo-three', name: 'Sample traveller', guestDescription: 'Illustrative story', rating: 5, quote: 'The changing landscapes made this journey feel like several wonderful safaris in one.', settingImage: figmaMoruThumb},
      {_key: 'review-demo-four', name: 'Sample family', guestDescription: 'Illustrative story', rating: 5, quote: 'We loved having the time to slow down, explore and enjoy quiet evenings at camp.', settingImage: figmaMoruThumb},
    ],
    sections: [
      {_key: 'overview', kind: 'overview', image: serengeti},
      {_key: 'highlights', kind: 'highlights', image: tarangire, body: previewParagraph('A private journey across Tanzania’s northern and southern safari country, with the freedom to follow each day as it unfolds.', 'highlights-intro')},
      {_key: 'itinerary', kind: 'itinerary', eyebrow: 'Illustrative day-by-day plan', heading: 'The journey, day by day'},
      {_key: 'route', kind: 'route', body: previewParagraph('Follow the journey from Arusha through Tarangire, Ngorongoro and the Serengeti to Ruaha. Map markers are approximate reference points for this client preview.', 'map-note')},
      {_key: 'destinations', kind: 'destinations', eyebrow: 'Across the route'},
      {_key: 'accommodation', kind: 'accommodation', eyebrow: 'Places to stay'},
      {_key: 'gallery', kind: 'gallery'},
      {_key: 'pricing', kind: 'pricing', eyebrow: 'Your safari, your way'},
      {_key: 'inclusions', kind: 'inclusions', body: previewParagraph('Know what is part of your journey before you set off. Your final proposal will confirm every inclusion and anything you need to arrange separately.', 'inclusions-note')},
      {_key: 'related-trips', kind: 'relatedTrips', eyebrow: 'Continue exploring'},
      {_key: 'related-blogs', kind: 'relatedBlogs', heading: 'From the Asanja journal'},
      {_key: 'related-pages', kind: 'relatedLandingPages', eyebrow: 'Continue the journey'},
      {_key: 'faq', kind: 'faq', heading: 'Good to know', body: previewParagraph('Answers to a few questions you may have before setting off.', 'faq-intro')},
      {_key: 'reviews', kind: 'reviews', eyebrow: 'Sample testimonials', body: previewParagraph('Illustrative quotes for the client preview. Replace them with approved guest reviews in the CMS.', 'reviews-note')},
      {_key: 'booking', kind: 'booking', heading: 'Plan your trip'},
    ],
  }
}

import type {Metadata} from 'next'
import {CampPageView} from '../../components/pages/camp-page'
import {getCampPage, getCampSeo} from '../../sanity/camp-data'
import type {CampPage} from '../../sanity/camp-types'
import type {PageMedia, PageText} from '../../sanity/page-types'
import {pageMetadata} from '../../sanity/page-seo'
import type {SanityImage} from '../../sanity/types'

const slug = 'asanja-ewasi-tarangire'
const title = 'Asanja Ewasi Tarangire'
const description = 'Opening in 2027 in Tarangire National Park, Asanja Ewasi is an intimate 10-room luxury safari camp with private plunge pools and personalised Asanja hospitality.'
const canonical = 'https://asanjaafrica.com/asanja-ewasi-tarangire/'

const fallbackMetadata: Metadata = {
  title,
  description,
  alternates: {canonical},
  keywords: ['Asanja Ewasi', 'Tarangire luxury camp', 'Tarangire National Park accommodation', 'luxury safari camp Tanzania', 'Asanja Africa'],
  openGraph: {
    type: 'website',
    url: canonical,
    title,
    description,
    images: [{url: '/camps/asanja-ewasi-tarangire/ewasi-safari-002-social.webp', width: 1920, height: 1081, alt: 'Asanja Ewasi private suite and plunge pool in Tarangire'}],
  },
  twitter: {card: 'summary_large_image', title, description, images: ['/camps/asanja-ewasi-tarangire/ewasi-safari-002-social.webp']},
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCampSeo(slug).catch(() => null)
  return page ? pageMetadata(page, `/${slug}/`) : fallbackMetadata
}

function image(url: string, alt: string, width = 2560, height = 1441): SanityImage {
  return {_type: 'image', alt, asset: {url, metadata: {dimensions: {width, height}}}}
}

function paragraphs(values: string[]): PageText {
  return values.map((value, index) => ({
    _key: `paragraph-${index + 1}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `span-${index + 1}`, _type: 'span', marks: [], text: value}],
  }))
}

const heroImage = image(
  '/camps/asanja-ewasi-tarangire/ewasi-safari-002.webp',
  'Asanja Ewasi luxury suite and private plunge pool in Tarangire National Park',
)

const gallery: PageMedia[] = [
  {
    _key: 'ewasi-gallery-1',
    kind: 'photo',
    caption: 'A private suite shaped by the Tarangire landscape',
    image: image('/camps/asanja-ewasi-tarangire/ewasi-safari-001.webp', 'Spacious Asanja Ewasi suite with a four-poster bed and open wilderness views'),
  },
  {
    _key: 'ewasi-gallery-2',
    kind: 'photo',
    caption: 'Contemporary comfort, rooted in Tanzania',
    image: heroImage,
  },
  {
    _key: 'ewasi-gallery-3',
    kind: 'photo',
    caption: 'Quiet interiors overlooking the wild',
    image: image('/camps/asanja-ewasi-tarangire/ewasi-safari-001-social.webp', 'Interior of an Asanja Ewasi guest suite in Tarangire', 1920, 1081),
  },
  {
    _key: 'ewasi-gallery-4',
    kind: 'photo',
    caption: 'A private plunge pool beneath the Tarangire sky',
    image: image('/camps/asanja-ewasi-tarangire/ewasi-safari-002-social.webp', 'Private suite and plunge pool at Asanja Ewasi Tarangire', 1920, 1081),
  },
]

const ewasiFallback: CampPage = {
  _id: 'asanja-ewasi-tarangire-fallback',
  _type: 'camp',
  slug,
  publicationStatus: 'public',
  title,
  summary: description,
  category: 'Luxury safari camp',
  location: 'Tarangire National Park',
  heroImage,
  heroEyebrow: 'Welcome to Asanja Ewasi Tarangire',
  tagline: 'Tarangire National Park · Opening 2027',
  description: paragraphs([
    'Opening in 2027 within Tarangire National Park, Asanja Ewasi will feature 10 rooms, including one family unit.',
    '“Ewasi,” a place in Tarangire and a Maa word meaning “plain ground,” reflects the camp’s deep connection to the land and its rich heritage.',
    'Guests will discover the unique wonders of Tarangire, from vast plains dotted with ancient baobabs and immense elephant herds to seasonal migrations and the rare sight of tree-climbing pythons, all while enjoying Asanja’s signature personalised hospitality.',
  ]),
  storyHeading: 'A story written by the land',
  storyImage: gallery[0].image,
  storyPoints: [
    {
      _key: 'heritage',
      title: 'Cultural heritage',
      description: 'The name “Ewasi,” derived from a Maa word meaning “plain ground,” reflects the camp’s strong connection to the land, its people and the rich cultural heritage of northern Tanzania.',
    },
    {
      _key: 'design',
      title: 'Intimate luxury',
      description: 'Ten private suites, including one family unit, pair private plunge pools and sweeping wilderness views with contemporary comfort and authentic Tanzanian influences.',
    },
    {
      _key: 'encounters',
      title: 'Beyond the drive',
      description: 'Guided nature walks, sundowners, night game drives and immersive bush activities reveal Tarangire from a more intimate perspective.',
    },
  ],
  amenitiesIntroduction: paragraphs([
    'Thoughtfully positioned for privacy and sweeping views, every suite is supported by personalised Asanja hospitality in the heart of Tarangire National Park.',
  ]),
  facilities: [
    '10 private suites',
    'One family unit',
    'Private plunge pools',
    '30 minutes from Kuro Airstrip',
    'Guided nature walks',
    'Sundowner experiences',
    'Night game drives',
    'Immersive bush activities',
  ],
  gallery,
  locationImage: gallery[3].image,
  locationDescription: paragraphs([
    'Nestled within Tarangire National Park, just a 30-minute drive from Kuro Airstrip, Asanja Ewasi looks across vast plains dotted with ancient baobabs and traversed by immense elephant herds.',
    'From camp, guests may witness giraffes, zebras, predators and seasonal wildlife migrations moving through the surrounding wilderness.',
  ]),
  bookingImage: image(
    '/legacy/wp-content/uploads/2026/09/Photo-29-11-2025-03-58-52-1-scaled.webp',
    'Elephant herd crossing the misty plains beneath acacia trees',
    2560,
    1707,
  ),
  bookingHeading: 'Plan your Tarangire stay',
  bookingText: paragraphs([
    'Let our safari specialists create a personalised journey around your stay at Asanja Ewasi, from the first game drive to your final Tarangire sunset.',
  ]),
  bookingButtonLabel: 'Plan your stay',
}

export default async function AsanjaEwasiTarangirePage() {
  const publishedPage = await getCampPage(slug).catch(() => null)
  const page: CampPage = publishedPage ? {
    ...ewasiFallback,
    ...publishedPage,
    heroImage: publishedPage.heroImage?.asset?.url ? publishedPage.heroImage : ewasiFallback.heroImage,
    description: publishedPage.description?.length ? publishedPage.description : ewasiFallback.description,
    storyImage: publishedPage.storyImage?.asset?.url ? publishedPage.storyImage : ewasiFallback.storyImage,
    storyPoints: publishedPage.storyPoints?.length ? publishedPage.storyPoints : ewasiFallback.storyPoints,
    amenitiesIntroduction: publishedPage.amenitiesIntroduction?.length ? publishedPage.amenitiesIntroduction : ewasiFallback.amenitiesIntroduction,
    facilities: publishedPage.facilities?.length ? publishedPage.facilities : ewasiFallback.facilities,
    gallery: publishedPage.gallery?.length ? publishedPage.gallery : ewasiFallback.gallery,
    locationImage: publishedPage.locationImage?.asset?.url ? publishedPage.locationImage : ewasiFallback.locationImage,
    locationDescription: publishedPage.locationDescription?.length ? publishedPage.locationDescription : ewasiFallback.locationDescription,
    bookingImage: publishedPage.bookingImage?.asset?.url ? publishedPage.bookingImage : ewasiFallback.bookingImage,
    bookingText: publishedPage.bookingText?.length ? publishedPage.bookingText : ewasiFallback.bookingText,
  } : ewasiFallback
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: page.title,
    description: page.summary || description,
    url: canonical,
    image: (page.gallery || gallery)
      .filter((item) => item.kind === 'photo' && item.image?.asset?.url)
      .map((item) => new URL(item.image!.asset!.url!, canonical).toString()),
    address: {'@type': 'PostalAddress', addressLocality: page.location || 'Tarangire National Park', addressCountry: 'TZ'},
    numberOfRooms: 10,
    amenityFeature: [
      {'@type': 'LocationFeatureSpecification', name: 'Private plunge pool', value: true},
      {'@type': 'LocationFeatureSpecification', name: 'Family unit', value: true},
    ],
  }

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData).replace(/</g, '\\u003c')}} />
    <CampPageView page={page} />
  </>
}

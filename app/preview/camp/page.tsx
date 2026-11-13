import type {Metadata} from 'next'
import {CampPageView} from '../../../components/pages/camp-page'
import type {CampPage} from '../../../sanity/camp-types'
import type {PageText} from '../../../sanity/page-types'
import type {SanityImage} from '../../../sanity/types'

export const metadata: Metadata = {
  title: 'Camp page template preview',
  robots: {index: false, follow: false},
}

function image(url: string, alt: string): SanityImage {
  return {_type: 'image', asset: {url}, alt}
}

function paragraph(text: string, key: string): PageText {
  return [{
    _type: 'block', _key: key, style: 'normal', markDefs: [],
    children: [{_type: 'span', _key: `${key}-span`, text, marks: []}],
  }]
}

const previewCamp: CampPage = {
  _id: 'camp-template-preview',
  _type: 'camp',
  title: 'Asanja Moru',
  slug: 'camp-template-preview',
  publicationStatus: 'hidden',
  heroEyebrow: 'Welcome to Asanja Moru',
  tagline: 'In the heart of Serengeti',
  summary: 'A luxury tented camp tucked among the Moru Kopjes in the central Serengeti.',
  description: paragraph('A sanctuary of intimate luxury in the Serengeti, Asanja Moru brings thoughtful hospitality, quiet privacy and extraordinary wildlife encounters together in one unforgettable setting.', 'description'),
  location: 'Moru Kopjes, Serengeti National Park',
  heroImage: image('/legacy/wp-content/uploads/2026/01/Asanja-Moru-150.jpeg', 'Asanja Moru camp in the Serengeti'),
  storyHeading: 'Your private Serengeti sanctuary',
  storyImage: image('/legacy/wp-content/uploads/2025/07/camps-asanja-moru-couple_20250709163233.webp', 'Guests enjoying the landscape at Asanja Moru'),
  storyPoints: [
    {_key: 'setting', title: 'A remarkable setting', description: 'Set among the dramatic Moru Kopjes, the camp opens onto sweeping plains alive with the rhythms of the Serengeti.'},
    {_key: 'hospitality', title: 'Open-hearted hospitality', description: 'Personal service, considered details and warm Tanzanian welcome shape every part of the stay.'},
    {_key: 'wildlife', title: 'Wildlife at your doorstep', description: 'Game drives reveal big cats, resident plains game and seasonal migration activity across this exceptional region.'},
  ],
  amenitiesIntroduction: paragraph('Each space is designed to make the wilderness feel close while preserving the comfort and calm of a private retreat.', 'amenities'),
  facilities: ['En-suite tented suites', 'Private verandas', 'Dining and lounge tent', 'Campfire evenings', 'Solar power', 'Laundry service'],
  gallery: [
    {_key: 'gallery-one', kind: 'photo', caption: 'Life in the wild', image: image('/legacy/wp-content/uploads/2025/07/camps-asanja-moru-slide-couple_20250709164250.webp', 'Guests overlooking the Serengeti')},
    {_key: 'gallery-two', kind: 'photo', caption: 'Inside the tent', image: image('/legacy/wp-content/uploads/2025/07/camps-asanja-moru-slide-tent-interior_20250709164250.webp', 'Asanja Moru tent interior')},
    {_key: 'gallery-three', kind: 'photo', caption: 'Restful spaces', image: image('/legacy/wp-content/uploads/2025/07/camps-asanja-moru-slide-tent-room_20250709164250.webp', 'Asanja Moru guest room')},
    {_key: 'gallery-four', kind: 'photo', caption: 'Under canvas', image: image('/legacy/wp-content/uploads/2025/07/camps-asanja-moru-tent_20250709164250.webp', 'Asanja Moru safari tent')},
    {_key: 'gallery-five', kind: 'photo', caption: 'Moru Kopjes', image: image('/legacy/wp-content/uploads/2025/07/camps-asanja-moru-kopjes_20250722164924.webp', 'Moru Kopjes landscape')},
  ],
  locationDescription: paragraph('Moru Kopjes lies in the central Serengeti, where granite outcrops rise above open grassland and year-round wildlife gathers around the surrounding plains.', 'location'),
  locationImage: image('/legacy/wp-content/uploads/2025/08/Lion-on-rock.webp', 'Lion resting on a Serengeti kopje'),
  bookingHeading: 'Begin your Serengeti story',
  bookingText: paragraph('Tell our safari specialists how you would like to travel and we will shape a private journey around your stay.', 'booking'),
  bookingButtonLabel: 'Plan your stay',
}

export default function CampTemplatePreview() {
  return <CampPageView page={previewCamp} />
}

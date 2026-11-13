import type {ArticleCardData, SanityImage} from './types'
import type {PageCard, PageMedia, PageSeo, PageText} from './page-types'

export type CampStoryPoint = {
  _key: string
  title: string
  description?: string
}

export type CampPage = PageCard & {
  _type: 'camp'
  heroEyebrow?: string
  tagline?: string
  description?: PageText
  storyHeading?: string
  storyImage?: SanityImage
  storyPoints?: CampStoryPoint[]
  amenitiesIntroduction?: PageText
  facilities?: string[]
  gallery?: PageMedia[]
  locationDescription?: PageText
  locationImage?: SanityImage
  destination?: PageCard | null
  bookingHeading?: string
  bookingText?: PageText
  bookingButtonLabel?: string
  relatedSafariTrips?: PageCard[]
  relatedBlogs?: ArticleCardData[]
  seo?: PageSeo
}

export type CampMenuItem = {
  _id: string
  label: string
  href: string
}

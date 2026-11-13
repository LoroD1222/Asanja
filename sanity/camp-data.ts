import 'server-only'

import {defineQuery} from 'next-sanity'
import {publishedClient, sanityFetch} from './client'
import type {CampMenuItem, CampPage} from './camp-types'
import type {PageCard} from './page-types'

const publicCamp = 'defined(slug.current) && publicationStatus != "hidden" && ($includeDrafts == true || !(_id in path("drafts.**")))'
const imageFields = '{..., asset->{url, metadata{lqip, dimensions}}, hotspot, crop}'
const textFields = '..., markDefs[]{..., _type == "internalLink" => {"target": reference->{_id, _type, "slug": slug.current, publicationStatus}}}'
const cardFields = `_id, _type, title, "slug": slug.current, publicationStatus, summary, category, location, heroImage${imageFields}`

export const campBySlugQuery = defineQuery(`
  *[_type == "camp" && slug.current == $slug && (${publicCamp} || $includeDrafts == true)][0]{
    ${cardFields},
    heroEyebrow,
    tagline,
    description[]{${textFields}},
    storyHeading,
    storyImage${imageFields},
    storyPoints[]{_key, title, description},
    amenitiesIntroduction[]{${textFields}},
    facilities,
    gallery[]{_key, kind, caption, videoUrl, image${imageFields}},
    locationDescription[]{${textFields}},
    locationImage${imageFields},
    "destination": destination->{${cardFields}},
    bookingHeading,
    bookingText[]{${textFields}},
    bookingButtonLabel,
    "relatedSafariTrips": relatedSafariTrips[]->{${cardFields}},
    "relatedBlogs": relatedBlogs[]->{
      _id, title, "slug": slug.current, excerpt, originalPublishedAt, readingTimeMinutes,
      featuredImage${imageFields}, author->{_id, name, "slug": slug.current},
      categories[]->{_id, title, "slug": slug.current}, tags[]->{_id, title, "slug": slug.current}
    },
    seo{..., openGraphImage${imageFields}}
  }
`)

export const campSeoBySlugQuery = defineQuery(`
  *[_type == "camp" && slug.current == $slug && (${publicCamp} || $includeDrafts == true)][0]{
    _id, _type, title, "slug": slug.current, summary, heroImage${imageFields},
    seo{..., openGraphImage${imageFields}}
  }
`)

export const campMenuQuery = defineQuery(`
  *[_type == "camp" && ${publicCamp}] | order(title asc){
    _id,
    "label": coalesce(navigationLabel, title),
    "href": "/camps/" + slug.current + "/"
  }
`)

export function getCampPage(slug: string, stega = true) {
  return sanityFetch<CampPage | null>({
    query: campBySlugQuery,
    params: {slug},
    tags: ['sanity', 'camp', `camp:${slug}`],
    stega,
  })
}

export function getCampSeo(slug: string) {
  return sanityFetch<(Pick<PageCard, '_id' | '_type' | 'title' | 'slug' | 'summary' | 'heroImage'> & {seo?: CampPage['seo']}) | null>({
    query: campSeoBySlugQuery,
    params: {slug},
    tags: ['sanity', 'camp', `camp:${slug}`],
    stega: false,
  })
}

export function getCampMenuItems() {
  return sanityFetch<CampMenuItem[]>({
    query: campMenuQuery,
    tags: ['sanity', 'camp', 'camp-navigation'],
    stega: false,
  })
}

export function getPublishedCampMenuItems() {
  return publishedClient.fetch<CampMenuItem[]>(campMenuQuery, {includeDrafts: false}, {
    next: {revalidate: 300, tags: ['sanity', 'camp', 'camp-navigation']},
  })
}

import {defineField, defineType} from 'sanity'
import {imageOptimizationWarning, imageUploadGuidance} from '../imageOptimization'

const sectionNames: Record<string, string> = {
  overview: 'The Journey', highlights: 'Safari highlights', itinerary: 'Day-by-day itinerary',
  route: 'Route map', destinations: 'Destinations', accommodation: 'Accommodation',
  wildlife: 'Wildlife and activities', gallery: 'Gallery', pricing: 'Pricing and quote',
  inclusions: 'What is covered', season: 'Best time to visit', travel: 'Travel information',
  relatedTrips: 'Related trips', relatedBlogs: 'Journal stories',
  relatedLandingPages: 'Related guides', faq: 'Questions and answers',
  reviews: 'Guest reviews', booking: 'Booking enquiry', editorial: 'Custom editorial content',
}
const imageSections = new Set(['overview', 'highlights', 'wildlife', 'season', 'editorial'])

export const tripSection = defineType({
  name: 'tripSection', title: 'Safari trip section', type: 'object',
  fields: [
    defineField({name: 'kind', title: 'Section', type: 'string', validation: (rule) => rule.required(), options: {list: [
      {title: 'Overview', value: 'overview'}, {title: 'Highlights', value: 'highlights'},
      {title: 'Itinerary', value: 'itinerary'}, {title: 'Interactive route map', value: 'route'},
      {title: 'Destinations', value: 'destinations'}, {title: 'Accommodation', value: 'accommodation'},
      {title: 'Wildlife and activities', value: 'wildlife'}, {title: 'Gallery', value: 'gallery'},
      {title: 'Pricing and quote', value: 'pricing'}, {title: 'Included and excluded', value: 'inclusions'},
      {title: 'Best time to visit', value: 'season'}, {title: 'Travel information', value: 'travel'},
      {title: 'Related trips', value: 'relatedTrips'}, {title: 'Selected blogs', value: 'relatedBlogs'},
      {title: 'Related landing pages', value: 'relatedLandingPages'}, {title: 'FAQ', value: 'faq'},
      {title: 'Guest reviews', value: 'reviews'}, {title: 'Booking inquiry', value: 'booking'},
      {title: 'Custom editorial content', value: 'editorial'},
    ]}}),
    defineField({name: 'eyebrow', title: 'Small label above heading', type: 'string', description: 'Optional. Leave blank to use the page default.', hidden: ({parent, value}) => parent?.kind === 'booking' && !value}),
    defineField({name: 'heading', title: 'Main heading on page', type: 'string', description: 'Optional. Leave blank to use the default heading for this section.'}),
    defineField({name: 'body', title: 'Introductory rich text for this section', type: 'pageRichText', description: 'Optional text below this section heading. For The Journey, this replaces The Journey section text in the first tab.'}),
    defineField({name: 'image', title: 'Section image', type: 'image', description: `Used for The Journey, Highlights, Wildlife, Best time or Custom editorial sections. ${imageUploadGuidance}`, hidden: ({parent, value}) => !value && !imageSections.has(String(parent?.kind || '')), options: {hotspot: true}, validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
  ],
  preview: {select: {title: 'heading', kind: 'kind', media: 'image'}, prepare: ({title, kind, media}) => ({title: title || sectionNames[kind] || 'Trip section', subtitle: kind ? `Page section · ${sectionNames[kind] || kind}` : 'Choose a section', media})},
})

import {defineField, defineType} from 'sanity'

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
    defineField({name: 'eyebrow', title: 'Small heading override', type: 'string'}),
    defineField({name: 'heading', title: 'Heading override', type: 'string'}),
    defineField({name: 'body', title: 'Section introduction', type: 'pageRichText'}),
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
  ],
  preview: {select: {title: 'heading', kind: 'kind', media: 'image'}, prepare: ({title, kind, media}) => ({title: title || kind || 'Trip section', subtitle: kind, media})},
})

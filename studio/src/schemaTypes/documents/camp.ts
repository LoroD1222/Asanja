import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences, validateUniqueSlug} from '../referenceValidation'
import {imageOptimizationWarning, imageUploadGuidance} from '../imageOptimization'

export const camp = defineType({
  name: 'camp', title: 'Camp and accommodation', type: 'document', icon: HomeIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'story', title: 'Camp story'},
    {name: 'amenities', title: 'Amenities'},
    {name: 'location', title: 'Location'},
    {name: 'media', title: 'Media'},
    {name: 'related', title: 'Related content'},
    {name: 'seo', title: 'SEO and publishing'},
  ],
  initialValue: {publicationStatus: 'public'},
  fields: [
    defineField({name: 'title', title: 'Camp name', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'URL slug', type: 'slug', group: 'overview', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required().custom(validateUniqueSlug)}),
    defineField({name: 'navigationLabel', title: 'Navigation label', type: 'string', group: 'overview', description: 'Optional shorter name shown beneath Camps & Lodges in the site menu.'}),
    defineField({name: 'heroEyebrow', title: 'Hero heading', type: 'string', group: 'overview', description: 'Large text over the hero image. Leave empty to use “Welcome to [camp name]”.'}),
    defineField({name: 'tagline', title: 'Introduction eyebrow', type: 'string', group: 'overview', description: 'Short uppercase line above the camp name in the introduction.'}),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 3, group: 'overview'}),
    defineField({name: 'description', title: 'Full description', type: 'pageRichText', group: 'overview'}),
    defineField({name: 'location', title: 'Location', type: 'string', group: 'location'}),
    defineField({name: 'destination', title: 'Destination', type: 'reference', group: 'location', to: [{type: 'destination'}], validation: (rule) => rule.custom((value, context) => validatePublishedReferences(value ? [value] : [], context))}),
    defineField({name: 'category', title: 'Accommodation category', type: 'string', group: 'overview', options: {list: ['Camping','Midrange','Luxury','Ultra-luxury','Mobile camp']}}),
    defineField({name: 'style', title: 'Accommodation style', type: 'string', group: 'overview'}),
    defineField({name: 'facilities', title: 'Facilities', type: 'array', group: 'amenities', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'amenitiesIntroduction', title: 'Amenities introduction', type: 'pageRichText', group: 'amenities'}),
    defineField({name: 'coordinates', title: 'Geographic coordinates', type: 'geopoint', group: 'location'}),
    defineField({name: 'locationDescription', title: 'Location description', type: 'pageRichText', group: 'location'}),
    defineField({name: 'locationImage', title: 'Location image', type: 'image', group: 'location', description: imageUploadGuidance, options: {hotspot: true}, validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'heroImage', title: 'Featured image', type: 'image', group: 'media', description: imageUploadGuidance, options: {hotspot: true}, validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.warning('Add descriptive alternative text for accessibility and SEO.')})]}),
    defineField({name: 'storyHeading', title: 'Story heading', type: 'string', group: 'story'}),
    defineField({name: 'storyImage', title: 'Story image', type: 'image', group: 'story', description: imageUploadGuidance, options: {hotspot: true}, validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({
      name: 'storyPoints',
      title: 'Story sections',
      type: 'array',
      group: 'story',
      of: [defineArrayMember({
        type: 'object',
        name: 'campStoryPoint',
        fields: [
          defineField({name: 'title', title: 'Heading', type: 'string', validation: (rule) => rule.required()}),
          defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
        ],
        preview: {select: {title: 'title', subtitle: 'description'}},
      })],
    }),
    defineField({name: 'gallery', title: 'Gallery', type: 'array', group: 'media', of: [defineArrayMember({type: 'tripMedia'})]}),
    defineField({name: 'bookingHeading', title: 'Booking heading', type: 'string', group: 'overview'}),
    defineField({name: 'bookingText', title: 'Booking message', type: 'pageRichText', group: 'overview'}),
    defineField({name: 'bookingButtonLabel', title: 'Booking button label', type: 'string', group: 'overview'}),
    defineField({name: 'relatedSafariTrips', title: 'Related safari trips', type: 'array', group: 'related', of: [defineArrayMember({type: 'reference', to: [{type: 'safariTrip'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'relatedBlogs', title: 'Related blogs', type: 'array', group: 'related', of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'publicationStatus', title: 'Visibility after publishing', type: 'string', group: 'seo', options: {list: ['public','hidden'], layout: 'radio'}, initialValue: 'public'}),
    defineField({name: 'seo', title: 'SEO and social sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'location', media: 'heroImage'}},
})

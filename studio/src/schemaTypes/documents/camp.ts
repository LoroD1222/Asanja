import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences, validateUniqueSlug} from '../referenceValidation'

export const camp = defineType({
  name: 'camp', title: 'Camp and accommodation', type: 'document', icon: HomeIcon,
  groups: [{name: 'overview', title: 'Overview', default: true}, {name: 'media', title: 'Media'}, {name: 'related', title: 'Related content'}, {name: 'seo', title: 'SEO and publishing'}],
  initialValue: {publicationStatus: 'public'},
  fields: [
    defineField({name: 'title', title: 'Camp name', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'URL slug', type: 'slug', group: 'overview', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required().custom(validateUniqueSlug)}),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 3, group: 'overview'}),
    defineField({name: 'description', title: 'Full description', type: 'pageRichText', group: 'overview'}),
    defineField({name: 'location', title: 'Location', type: 'string', group: 'overview'}),
    defineField({name: 'destination', title: 'Destination', type: 'reference', group: 'overview', to: [{type: 'destination'}], validation: (rule) => rule.custom((value, context) => validatePublishedReferences(value ? [value] : [], context))}),
    defineField({name: 'category', title: 'Accommodation category', type: 'string', group: 'overview', options: {list: ['Camping','Midrange','Luxury','Ultra-luxury','Mobile camp']}}),
    defineField({name: 'style', title: 'Accommodation style', type: 'string', group: 'overview'}),
    defineField({name: 'facilities', title: 'Facilities', type: 'array', group: 'overview', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'coordinates', title: 'Geographic coordinates', type: 'geopoint', group: 'overview'}),
    defineField({name: 'heroImage', title: 'Featured image', type: 'image', group: 'media', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'gallery', title: 'Gallery', type: 'array', group: 'media', of: [defineArrayMember({type: 'tripMedia'})]}),
    defineField({name: 'relatedSafariTrips', title: 'Related safari trips', type: 'array', group: 'related', of: [defineArrayMember({type: 'reference', to: [{type: 'safariTrip'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'relatedBlogs', title: 'Related blogs', type: 'array', group: 'related', of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'publicationStatus', title: 'Visibility after publishing', type: 'string', group: 'seo', options: {list: ['public','hidden'], layout: 'radio'}, initialValue: 'public'}),
    defineField({name: 'seo', title: 'SEO and social sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'location', media: 'heroImage'}},
})

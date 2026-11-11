import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences, validateUniqueSlug} from '../referenceValidation'

export const destination = defineType({
  name: 'destination', title: 'Destination', type: 'document', icon: EarthGlobeIcon,
  groups: [{name: 'overview', title: 'Overview', default: true}, {name: 'media', title: 'Media'}, {name: 'related', title: 'Related content'}, {name: 'seo', title: 'SEO and publishing'}],
  initialValue: {publicationStatus: 'public'},
  fields: [
    defineField({name: 'title', title: 'Destination name', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'URL slug', type: 'slug', group: 'overview', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required().custom(validateUniqueSlug)}),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 3, group: 'overview'}),
    defineField({name: 'description', title: 'Full description', type: 'pageRichText', group: 'overview'}),
    defineField({name: 'location', title: 'Location or region', type: 'string', group: 'overview'}),
    defineField({name: 'coordinates', title: 'Geographic coordinates', type: 'geopoint', group: 'overview', description: 'Used by safari route maps. Enter verified coordinates.'}),
    defineField({name: 'wildlife', title: 'Wildlife information', type: 'pageRichText', group: 'overview'}),
    defineField({name: 'bestTime', title: 'Best time to visit', type: 'pageRichText', group: 'overview'}),
    defineField({name: 'activities', title: 'Activities', type: 'array', group: 'overview', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'heroImage', title: 'Featured image', type: 'image', group: 'media', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'gallery', title: 'Gallery', type: 'array', group: 'media', of: [defineArrayMember({type: 'tripMedia'})]}),
    defineField({name: 'relatedCamps', title: 'Related camps', type: 'array', group: 'related', of: [defineArrayMember({type: 'reference', to: [{type: 'camp'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'relatedSafariTrips', title: 'Related safari trips', type: 'array', group: 'related', of: [defineArrayMember({type: 'reference', to: [{type: 'safariTrip'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'relatedBlogs', title: 'Related blogs', type: 'array', group: 'related', of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'publicationStatus', title: 'Visibility after publishing', type: 'string', group: 'seo', options: {list: ['public','hidden'], layout: 'radio'}, initialValue: 'public'}),
    defineField({name: 'seo', title: 'SEO and social sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'location', media: 'heroImage'}},
})

import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences} from '../referenceValidation'

export const pageSection = defineType({
  name: 'pageSection', title: 'Editorial page section', type: 'object',
  fields: [
    defineField({name: 'kind', title: 'Section type', type: 'string', validation: (rule) => rule.required(), options: {list: [
      {title: 'Rich text and image', value: 'editorial'}, {title: 'Highlights', value: 'highlights'},
      {title: 'Statistics', value: 'statistics'}, {title: 'Photo and video gallery', value: 'gallery'},
      {title: 'Destination cards', value: 'destinations'}, {title: 'Camp cards', value: 'camps'},
      {title: 'Safari trip cards', value: 'trips'}, {title: 'Selected blogs', value: 'blogs'},
      {title: 'Related landing pages', value: 'landingPages'}, {title: 'FAQ', value: 'faq'},
      {title: 'Testimonials', value: 'testimonials'}, {title: 'Call to action', value: 'cta'},
      {title: 'Downloadable document', value: 'download'},
    ]}}),
    defineField({name: 'anchor', title: 'Section anchor', type: 'slug', options: {source: 'heading'}, description: 'Optional on-page anchor used by links.'}),
    defineField({name: 'eyebrow', title: 'Small heading', type: 'string'}),
    defineField({name: 'heading', title: 'Section heading', type: 'string'}),
    defineField({name: 'body', title: 'Rich text', type: 'pageRichText', description: 'Highlight text to add contextual links to CMS pages.'}),
    defineField({name: 'image', title: 'Section image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'}), defineField({name: 'caption', title: 'Caption', type: 'string'})]}),
    defineField({name: 'highlights', title: 'Highlights', type: 'array', hidden: ({parent}) => parent?.kind !== 'highlights', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'title', title: 'Title', type: 'string'}), defineField({name: 'description', title: 'Description', type: 'text', rows: 2})], preview: {select: {title: 'title'}}})]}),
    defineField({name: 'statistics', title: 'Statistics', type: 'array', hidden: ({parent}) => parent?.kind !== 'statistics', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'value', title: 'Value', type: 'string'}), defineField({name: 'label', title: 'Label', type: 'string'})], preview: {select: {title: 'value', subtitle: 'label'}}})]}),
    defineField({name: 'media', title: 'Gallery items', type: 'array', hidden: ({parent}) => parent?.kind !== 'gallery', of: [defineArrayMember({type: 'tripMedia'})]}),
    defineField({name: 'destinations', title: 'Destination cards', type: 'array', hidden: ({parent}) => parent?.kind !== 'destinations', of: [defineArrayMember({type: 'reference', to: [{type: 'destination'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'camps', title: 'Camp cards', type: 'array', hidden: ({parent}) => parent?.kind !== 'camps', of: [defineArrayMember({type: 'reference', to: [{type: 'camp'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'trips', title: 'Safari trip cards', type: 'array', hidden: ({parent}) => parent?.kind !== 'trips', of: [defineArrayMember({type: 'reference', to: [{type: 'safariTrip'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'blogs', title: 'Selected blog cards', type: 'array', hidden: ({parent}) => parent?.kind !== 'blogs', of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'landingPages', title: 'Related landing page cards', type: 'array', hidden: ({parent}) => parent?.kind !== 'landingPages', of: [defineArrayMember({type: 'reference', to: [{type: 'seoLandingPage'}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)}),
    defineField({name: 'faqs', title: 'Questions', type: 'array', hidden: ({parent}) => parent?.kind !== 'faq', of: [defineArrayMember({type: 'faqItem'})]}),
    defineField({name: 'testimonials', title: 'Guest reviews', type: 'array', hidden: ({parent}) => parent?.kind !== 'testimonials', of: [defineArrayMember({type: 'guestReview'})]}),
    defineField({name: 'ctaLabel', title: 'Button label', type: 'string', hidden: ({parent}) => parent?.kind !== 'cta'}),
    defineField({name: 'ctaUrl', title: 'Button URL', type: 'string', hidden: ({parent}) => parent?.kind !== 'cta'}),
    defineField({name: 'document', title: 'Downloadable document', type: 'file', hidden: ({parent}) => parent?.kind !== 'download'}),
  ],
  preview: {select: {heading: 'heading', kind: 'kind', media: 'image'}, prepare: ({heading, kind, media}) => ({title: heading || kind || 'Untitled section', subtitle: kind, media})},
})

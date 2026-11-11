import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences, validateUniqueSlug} from '../referenceValidation'

const related = (name: string, title: string, type: string) => defineField({name, title, type: 'array', group: 'relationships', of: [defineArrayMember({type: 'reference', to: [{type}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)})

export const seoLandingPage = defineType({
  name: 'seoLandingPage', title: 'SEO landing page', type: 'document', icon: DocumentIcon,
  groups: [{name: 'hero', title: 'Hero and overview', default: true}, {name: 'content', title: 'Page sections'}, {name: 'relationships', title: 'Related content'}, {name: 'seo', title: 'SEO and publishing'}],
  initialValue: {publicationStatus: 'public', automaticBlogsEnabled: true, automaticBlogsLimit: 3},
  fields: [
    defineField({name: 'title', title: 'Page title', type: 'string', group: 'hero', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'URL slug', type: 'slug', group: 'hero', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required().custom(validateUniqueSlug)}),
    defineField({name: 'eyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero'}),
    defineField({name: 'summary', title: 'Short introduction', type: 'text', rows: 3, group: 'hero'}),
    defineField({name: 'heroImage', title: 'Hero image', type: 'image', group: 'hero', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required().warning('Describe the image.')})]}),
    defineField({name: 'introduction', title: 'Full introduction', type: 'pageRichText', group: 'hero'}),
    defineField({name: 'sections', title: 'Reorderable page sections', type: 'array', group: 'content', of: [defineArrayMember({type: 'pageSection'})]}),
    related('relatedBlogs', 'Manually selected blogs', 'article'),
    related('relatedLandingPages', 'Related landing pages', 'seoLandingPage'),
    related('relatedDestinations', 'Related destinations', 'destination'),
    related('relatedCamps', 'Related camps', 'camp'),
    related('relatedSafariTrips', 'Related safari trips and packages', 'safariTrip'),
    related('automaticBlogCategories', 'Automatic blog categories', 'category'),
    related('automaticBlogTags', 'Automatic blog tags', 'tag'),
    defineField({name: 'automaticBlogsEnabled', title: 'Show automatic related blogs', type: 'boolean', group: 'relationships', initialValue: true}),
    defineField({name: 'automaticBlogsLimit', title: 'Maximum automatic blogs', type: 'number', group: 'relationships', initialValue: 3, hidden: ({document}) => document?.automaticBlogsEnabled === false, validation: (rule) => rule.integer().min(1).max(9)}),
    defineField({name: 'publicationStatus', title: 'Visibility after publishing', type: 'string', group: 'seo', options: {layout: 'radio', list: [{title: 'Public', value: 'public'}, {title: 'Hidden', value: 'hidden'}]}, initialValue: 'public', validation: (rule) => rule.required()}),
    defineField({name: 'seo', title: 'SEO and social sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current', media: 'heroImage'}},
})

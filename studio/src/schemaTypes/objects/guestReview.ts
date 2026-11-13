import {defineField, defineType} from 'sanity'
import {imageOptimizationWarning, imageUploadGuidance} from '../imageOptimization'

export const guestReview = defineType({
  name: 'guestReview', title: 'Verified guest review', type: 'object',
  fields: [
    defineField({name: 'name', title: 'Guest name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'country', title: 'Country', type: 'string'}),
    defineField({name: 'quote', title: 'Review text', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({name: 'mobileQuote', title: 'Short mobile excerpt', type: 'text', rows: 3, description: 'Optional guest-approved excerpt of the same review for compact mobile cards.'}),
    defineField({name: 'rating', title: 'Rating (if provided by guest)', type: 'number', validation: (rule) => rule.integer().min(1).max(5)}),
    defineField({name: 'source', title: 'Review source', type: 'string', description: 'For example, email or a review platform.'}),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
    defineField({name: 'visitDate', title: 'Visit date', type: 'date'}),
    defineField({name: 'image', title: 'Guest image (permission required)', type: 'image', description: imageUploadGuidance, validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'guestDescription', title: 'Guest description', type: 'string', description: 'Optional attribution such as Family of three.'}),
    defineField({name: 'settingImage', title: 'Story photograph', type: 'image', description: 'The camp or experience photograph shown beside this review. Use only approved imagery.', validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'locationLabel', title: 'Photograph location', type: 'string', description: 'For example, Moru, Emanyata tent.'}),
  ],
  preview: {select: {title: 'name', subtitle: 'source', media: 'image'}},
})

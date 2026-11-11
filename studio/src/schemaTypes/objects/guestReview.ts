import {defineField, defineType} from 'sanity'

export const guestReview = defineType({
  name: 'guestReview', title: 'Verified guest review', type: 'object',
  fields: [
    defineField({name: 'name', title: 'Guest name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'country', title: 'Country', type: 'string'}),
    defineField({name: 'quote', title: 'Review text', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({name: 'rating', title: 'Rating (if provided by guest)', type: 'number', validation: (rule) => rule.integer().min(1).max(5)}),
    defineField({name: 'source', title: 'Review source', type: 'string', description: 'For example, email or a review platform.'}),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
    defineField({name: 'visitDate', title: 'Visit date', type: 'date'}),
    defineField({name: 'image', title: 'Guest image (permission required)', type: 'image', fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
  ],
  preview: {select: {title: 'name', subtitle: 'source', media: 'image'}},
})

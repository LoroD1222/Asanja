import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences} from '../referenceValidation'

export const itineraryDay = defineType({
  name: 'itineraryDay', title: 'Itinerary day', type: 'object',
  fields: [
    defineField({name: 'dayNumber', title: 'Day number', type: 'number', validation: (rule) => rule.required().integer().min(1)}),
    defineField({name: 'title', title: 'Day title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Day description', type: 'pageRichText'}),
    defineField({name: 'destination', title: 'Destination', type: 'reference', to: [{type: 'destination'}], validation: (rule) => rule.custom((value, context) => validatePublishedReferences(value ? [value] : [], context))}),
    defineField({name: 'accommodation', title: 'Overnight camp', type: 'reference', to: [{type: 'camp'}], validation: (rule) => rule.custom((value, context) => validatePublishedReferences(value ? [value] : [], context))}),
    defineField({name: 'activities', title: 'Activities', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'meals', title: 'Meals', type: 'array', of: [defineArrayMember({type: 'string', options: {list: ['Breakfast', 'Lunch', 'Dinner']}})]}),
    defineField({name: 'notes', title: 'Optional notes', type: 'text', rows: 2}),
    defineField({name: 'image', title: 'Day image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
  ],
  preview: {select: {title: 'title', day: 'dayNumber', media: 'image'}, prepare: ({title, day, media}) => ({title: `Day ${day || '?'} — ${title || 'Untitled'}`, media})},
})

import {defineField, defineType} from 'sanity'
import {validatePublishedReferences} from '../referenceValidation'

export const routeStop = defineType({
  name: 'routeStop', title: 'Route stop', type: 'object',
  fields: [
    defineField({name: 'name', title: 'Stop name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'dayLabel', title: 'Day label', type: 'string'}),
    defineField({name: 'description', title: 'Short description', type: 'text', rows: 2}),
    defineField({name: 'destination', title: 'Destination page', type: 'reference', to: [{type: 'destination'}], description: 'The map uses the destination coordinates. Select a published destination.', validation: (rule) => rule.custom((value, context) => validatePublishedReferences(value ? [value] : [], context))}),
    defineField({name: 'coordinates', title: 'Coordinates for a stop without a destination page', type: 'geopoint'}),
  ],
  validation: (rule) => rule.custom((value) => Boolean(value?.destination || value?.coordinates) || 'Select a destination or enter coordinates.'),
  preview: {select: {title: 'name', subtitle: 'dayLabel'}},
})

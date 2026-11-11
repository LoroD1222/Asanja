import {defineArrayMember, defineField, defineType} from 'sanity'

export const tripPricingOption = defineType({
  name: 'tripPricingOption', title: 'Package and pricing option', type: 'object',
  fields: [
    defineField({name: 'name', title: 'Option name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'accommodationLevel', title: 'Accommodation level', type: 'string', options: {list: ['Camping', 'Midrange', 'Luxury', 'Custom']}}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({name: 'pricePerPerson', title: 'Base price per adult', type: 'number', description: 'Leave blank when pricing requires a custom quote.', validation: (rule) => rule.min(0)}),
    defineField({name: 'childPrice', title: 'Base price per child', type: 'number', validation: (rule) => rule.min(0)}),
    defineField({name: 'groupPrices', title: 'Group-size prices', type: 'array', description: 'Optional per-adult overrides for exact group sizes.', of: [defineArrayMember({type: 'object', fields: [
      defineField({name: 'minAdults', title: 'Minimum adults', type: 'number', validation: (rule) => rule.required().integer().min(1)}),
      defineField({name: 'maxAdults', title: 'Maximum adults', type: 'number', validation: (rule) => rule.required().integer().min(1)}),
      defineField({name: 'pricePerPerson', title: 'Price per adult', type: 'number', validation: (rule) => rule.required().min(0)}),
    ], preview: {select: {title: 'pricePerPerson', min: 'minAdults', max: 'maxAdults'}, prepare: ({title, min, max}) => ({title: `${min || '?'}–${max || '?'} adults`, subtitle: title ? `$${title} per adult` : 'No price'})}})]}),
    defineField({name: 'seasonalPrices', title: 'Seasonal pricing', type: 'array', of: [defineArrayMember({type: 'object', fields: [
      defineField({name: 'label', title: 'Season', type: 'string'}),
      defineField({name: 'from', title: 'Start date', type: 'date'}),
      defineField({name: 'to', title: 'End date', type: 'date'}),
      defineField({name: 'pricePerPerson', title: 'Price per adult', type: 'number', validation: (rule) => rule.min(0)}),
    ], preview: {select: {title: 'label', subtitle: 'pricePerPerson'}}})]}),
    defineField({name: 'features', title: 'Option features', type: 'array', of: [defineArrayMember({type: 'string'})]}),
  ],
  preview: {select: {title: 'name', subtitle: 'accommodationLevel'}},
})

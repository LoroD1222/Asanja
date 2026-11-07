import {defineArrayMember, defineField, defineType} from 'sanity'

export const articleTable = defineType({
  name: 'articleTable',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({
      name: 'hasHeaderRow',
      title: 'First row contains headings',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [defineArrayMember({type: 'tableRow'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {select: {title: 'caption'}, prepare: ({title}) => ({title: title || 'Table'})},
})

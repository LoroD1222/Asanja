import {defineArrayMember, defineField, defineType} from 'sanity'

export const tableRow = defineType({
  name: 'tableRow',
  title: 'Table row',
  type: 'object',
  fields: [
    defineField({
      name: 'cells',
      title: 'Cells',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
  preview: {
    select: {cells: 'cells'},
    prepare: ({cells}: {cells?: string[]}) => ({title: cells?.join(' | ') || 'Empty row'}),
  },
})

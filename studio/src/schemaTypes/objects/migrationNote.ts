import {defineField, defineType} from 'sanity'

export const migrationNote = defineType({
  name: 'migrationNote',
  title: 'Unsupported source content',
  type: 'object',
  fields: [
    defineField({name: 'reason', title: 'Reason', type: 'string', readOnly: true}),
    defineField({name: 'sourceHtml', title: 'Original source HTML', type: 'text', readOnly: true}),
  ],
  preview: {select: {title: 'reason'}, prepare: ({title}) => ({title: title || 'Migration note'})},
})

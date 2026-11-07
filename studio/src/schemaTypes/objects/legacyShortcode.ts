import {defineField, defineType} from 'sanity'

export const legacyShortcode = defineType({
  name: 'legacyShortcode',
  title: 'Legacy shortcode requiring review',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Shortcode name', type: 'string', readOnly: true}),
    defineField({name: 'raw', title: 'Original shortcode', type: 'text', readOnly: true}),
    defineField({name: 'note', title: 'Migration note', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'note'},
    prepare: ({title, subtitle}) => ({title: title ? `[${title}]` : 'Legacy shortcode', subtitle}),
  },
})

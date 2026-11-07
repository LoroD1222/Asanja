import {defineField, defineType} from 'sanity'

export const articleImage = defineType({
  name: 'articleImage',
  title: 'Article image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      validation: (rule) => rule.required().warning('Alt text is important for accessibility and SEO.'),
    }),
    defineField({name: 'caption', title: 'Caption', type: 'text', rows: 2}),
    defineField({name: 'credit', title: 'Image credit', type: 'string'}),
    defineField({name: 'linkHref', title: 'Image link', type: 'url'}),
    defineField({name: 'sourceUrl', title: 'Original source URL', type: 'url', readOnly: true}),
    defineField({name: 'wordpressAttachmentId', title: 'WordPress attachment ID', type: 'number', readOnly: true}),
  ],
})

import {defineField, defineType} from 'sanity'

export const tripMedia = defineType({
  name: 'tripMedia', title: 'Photo or video', type: 'object',
  fields: [
    defineField({name: 'kind', title: 'Media type', type: 'string', options: {layout: 'radio', list: ['photo', 'video']}, initialValue: 'photo', validation: (rule) => rule.required()}),
    defineField({name: 'image', title: 'Photo or video poster', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({name: 'videoUrl', title: 'YouTube or Vimeo URL', type: 'url', hidden: ({parent}) => parent?.kind !== 'video', validation: (rule) => rule.uri({scheme: ['https']})}),
  ],
  preview: {select: {title: 'caption', subtitle: 'kind', media: 'image'}, prepare: ({title, subtitle, media}) => ({title: title || subtitle || 'Media', subtitle, media})},
})

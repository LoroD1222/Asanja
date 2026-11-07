import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', title: 'Public name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name', maxLength: 96}, validation: (rule) => rule.required()}),
    defineField({name: 'bio', title: 'Biography', type: 'array', of: [defineArrayMember({type: 'block'})]}),
    defineField({
      name: 'image',
      title: 'Portrait',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({name: 'wordpressId', title: 'WordPress author ID', type: 'number', readOnly: true}),
    defineField({name: 'identityApproved', title: 'Public identity approved', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {title: 'name', media: 'image', approved: 'identityApproved'}, prepare: ({title, media, approved}) => ({title, media, subtitle: approved ? 'Approved' : 'Requires owner approval'})},
})

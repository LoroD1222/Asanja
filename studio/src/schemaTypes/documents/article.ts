import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'taxonomy', title: 'Taxonomy'},
    {name: 'workflow', title: 'Workflow'},
    {name: 'seo', title: 'SEO'},
    {name: 'migration', title: 'Migration'},
  ],
  initialValue: {editorialStatus: 'draft'},
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Slug is required.'
          return /^[a-z0-9-]+$/.test(slug.current) || 'Use lowercase letters, numbers and hyphens only.'
        }),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      group: 'content',
      validation: (rule) => rule.max(320).warning('Long excerpts may be truncated in article cards.'),
    }),
    defineField({name: 'body', title: 'Body', type: 'blockContent', group: 'content', validation: (rule) => rule.required()}),
    defineField({
      name: 'featuredImage',
      title: 'Featured image',
      type: 'image',
      group: 'content',
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
        defineField({name: 'wordpressAttachmentId', title: 'WordPress attachment ID', type: 'number', readOnly: true}),
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'taxonomy',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'taxonomy',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'taxonomy',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related articles',
      type: 'array',
      group: 'taxonomy',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (rule) => rule.unique().max(6),
    }),
    defineField({
      name: 'editorialStatus',
      title: 'Editorial status',
      type: 'string',
      group: 'workflow',
      options: {
        layout: 'radio',
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Awaiting review', value: 'review'},
          {title: 'Approved', value: 'approved'},
          {title: 'Scheduled', value: 'scheduled'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'scheduledAt',
      title: 'Planned publication time',
      type: 'datetime',
      group: 'workflow',
      description: 'Planning metadata only until Sanity scheduling is owner-approved and configured.',
      hidden: ({parent}) => parent?.editorialStatus !== 'scheduled',
    }),
    defineField({name: 'originalPublishedAt', title: 'Original publication time', type: 'datetime', group: 'workflow'}),
    defineField({name: 'sourceUpdatedAt', title: 'Original last-modified time', type: 'datetime', group: 'workflow'}),
    defineField({name: 'readingTimeMinutes', title: 'Reading time (minutes)', type: 'number', group: 'workflow', validation: (rule) => rule.integer().positive()}),
    defineField({name: 'seo', title: 'SEO and social sharing', type: 'seo', group: 'seo'}),
    defineField({name: 'migration', title: 'WordPress provenance', type: 'migrationMetadata', group: 'migration'}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'editorialStatus', media: 'featuredImage'},
    prepare: ({title, subtitle, media}) => ({title: title || 'Untitled article', subtitle: subtitle || 'draft', media}),
  },
})

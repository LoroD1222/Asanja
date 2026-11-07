import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO and social sharing',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'SEO title',
      type: 'string',
      description: 'Optional override. The article title is used when empty.',
      validation: (rule) => rule.max(60).warning('Search results may truncate titles over 60 characters.'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning('Search results may truncate descriptions over 160 characters.'),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'openGraphTitle',
      title: 'Open Graph title',
      type: 'string',
    }),
    defineField({
      name: 'openGraphDescription',
      title: 'Open Graph description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required().warning('Alt text is important for accessibility and SEO.'),
        }),
      ],
    }),
    defineField({name: 'focusKeyword', title: 'Focus keyword', type: 'string'}),
    defineField({
      name: 'noIndex',
      title: 'Exclude from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})

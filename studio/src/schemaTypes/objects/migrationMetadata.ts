import {defineArrayMember, defineField, defineType} from 'sanity'

export const migrationMetadata = defineType({
  name: 'migrationMetadata',
  title: 'WordPress migration metadata',
  type: 'object',
  fields: [
    defineField({
      name: 'wordpressId',
      title: 'WordPress ID',
      type: 'number',
      readOnly: true,
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({name: 'wordpressType', title: 'WordPress content type', type: 'string', readOnly: true}),
    defineField({name: 'wordpressStatus', title: 'WordPress status', type: 'string', readOnly: true}),
    defineField({
      name: 'sourcePath',
      title: 'Original WordPress path',
      type: 'string',
      readOnly: true,
      description: 'Preserves the path used by the original WordPress article URL.',
    }),
    defineField({
      name: 'wordpressUrl',
      title: 'Original WordPress URL',
      type: 'url',
      readOnly: true,
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({name: 'sourceModifiedAt', title: 'Source modified time', type: 'datetime', readOnly: true}),
    defineField({
      name: 'sourceContentSha256',
      title: 'Source content SHA-256',
      type: 'string',
      readOnly: true,
      description: 'Integrity checksum of the original WordPress post_content value.',
    }),
    defineField({name: 'transformedAt', title: 'Last transformed time', type: 'datetime', readOnly: true}),
    defineField({
      name: 'qualityFlags',
      title: 'Migration quality flags',
      type: 'array',
      readOnly: true,
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
})

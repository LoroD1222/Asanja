import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences} from '../referenceValidation'

export const pageRichText = defineType({
  name: 'pageRichText', title: 'Rich text with internal links', type: 'array',
  validation: (rule) => rule.custom(async (blocks, context) => {
    const typedBlocks = (blocks || []) as Array<{_type?: string; markDefs?: Array<{_type?: string; reference?: {_ref?: string}}>}>
    const references = typedBlocks.flatMap((block) =>
      block._type === 'block'
        ? (block.markDefs || []).filter((mark) => mark._type === 'internalLink').map((mark) => ({_ref: mark.reference?._ref}))
        : [],
    )
    if (!references.length) return true
    const unique = [...new Map(references.map((reference) => [reference._ref, reference])).values()]
    return validatePublishedReferences(unique, context)
  }),
  of: [defineArrayMember({
    type: 'block',
    styles: [{title: 'Paragraph', value: 'normal'}, {title: 'Heading 2', value: 'h2'}, {title: 'Heading 3', value: 'h3'}, {title: 'Quote', value: 'blockquote'}],
    lists: [{title: 'Bullet list', value: 'bullet'}, {title: 'Numbered list', value: 'number'}],
    marks: {
      decorators: [{title: 'Strong', value: 'strong'}, {title: 'Emphasis', value: 'em'}],
      annotations: [
        defineArrayMember({
          name: 'internalLink', title: 'Internal CMS link', type: 'object',
          fields: [
            defineField({name: 'reference', title: 'Link to published content', type: 'reference', to: [
              {type: 'article'}, {type: 'safariTrip'}, {type: 'seoLandingPage'}, {type: 'destination'}, {type: 'camp'},
            ], validation: (rule) => rule.required()}),
            defineField({name: 'fragment', title: 'Section anchor (optional)', type: 'string', description: 'Without #. Use only if the target page has this section ID.', validation: (rule) => rule.regex(/^[a-z0-9-]+$/).warning('Use lowercase letters, numbers and hyphens.')}),
          ],
        }),
        defineArrayMember({name: 'externalLink', title: 'External link', type: 'object', fields: [
          defineField({name: 'href', title: 'URL', type: 'url', validation: (rule) => rule.required().uri({scheme: ['https', 'http', 'mailto', 'tel']})}),
          defineField({name: 'blank', title: 'Open in a new tab', type: 'boolean', initialValue: true}),
        ]}),
      ],
    },
  })],
})

import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences} from '../referenceValidation'

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Article body',
  type: 'array',
  validation: (rule) => rule.custom(async (blocks, context) => {
    const references = ((blocks || []) as Array<{_type?: string; markDefs?: Array<{_type?: string; reference?: {_ref?: string}}>}>)
      .flatMap((block) => block._type === 'block'
        ? (block.markDefs || []).filter((mark) => mark._type === 'internalLink').map((mark) => ({_ref: mark.reference?._ref}))
        : [])
    const unique = [...new Map(references.map((reference) => [reference._ref, reference])).values()]
    return unique.length ? validatePublishedReferences(unique, context) : true
  }),
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Heading 2', value: 'h2'},
        {title: 'Heading 3', value: 'h3'},
        {title: 'Heading 4', value: 'h4'},
        {title: 'Heading 5', value: 'h5'},
        {title: 'Heading 6', value: 'h6'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet list', value: 'bullet'},
        {title: 'Numbered list', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike-through', value: 'strike-through'},
        ],
        annotations: [
          defineArrayMember({
            name: 'internalLink',
            title: 'Internal CMS link',
            type: 'object',
            fields: [
              defineField({name: 'reference', title: 'Published page', type: 'reference', to: [
                {type: 'article'}, {type: 'safariTrip'}, {type: 'seoLandingPage'}, {type: 'destination'}, {type: 'camp'},
              ], validation: (rule) => rule.required()}),
            ],
          }),
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({name: 'href', title: 'URL', type: 'string', validation: (rule) => rule.required()}),
              defineField({name: 'blank', title: 'Open in a new tab', type: 'boolean', initialValue: false}),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({type: 'articleImage'}),
    defineArrayMember({type: 'articleTable'}),
    defineArrayMember({type: 'legacyShortcode'}),
    defineArrayMember({type: 'migrationNote'}),
  ],
})

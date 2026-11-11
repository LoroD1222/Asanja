import {defineField, defineType} from 'sanity'

export const faqItem = defineType({
  name: 'faqItem', title: 'Question and answer', type: 'object',
  fields: [defineField({name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required()}), defineField({name: 'answer', title: 'Answer', type: 'pageRichText', validation: (rule) => rule.required()})],
  preview: {select: {title: 'question'}},
})

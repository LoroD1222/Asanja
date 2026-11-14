import {defineField, defineType} from 'sanity'
import {imageOptimizationWarning, imageUploadGuidance} from '../imageOptimization'

export const guestReview = defineType({
  name: 'guestReview', title: 'Verified guest review', type: 'object',
  fields: [
    defineField({name: 'name', title: 'Guest name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'country', title: 'Country', type: 'string'}),
    defineField({name: 'textType', title: 'How this text is presented', type: 'string', initialValue: 'quote', options: {list: [{title: 'Guest’s own words', value: 'quote'}, {title: 'Editorial summary of a real review', value: 'summary'}], layout: 'radio'}, description: 'Older reviews without this field continue to display as direct quotes.'}),
    defineField({name: 'quote', title: 'Review text or summary', type: 'text', rows: 4, description: 'For a summary, paraphrase the review accurately. Do not present it as the guest’s exact words.', validation: (rule) => rule.required()}),
    defineField({name: 'mobileQuote', title: 'Short mobile excerpt', type: 'text', rows: 3, description: 'Optional guest-approved excerpt of the same review for compact mobile cards.'}),
    defineField({name: 'rating', title: 'Rating (if provided by guest)', type: 'number', validation: (rule) => rule.integer().min(1).max(5)}),
    defineField({name: 'source', title: 'Review source', type: 'string', description: 'For example, email or a review platform.'}),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
    defineField({name: 'reviewUrl', title: 'Individual review URL', type: 'url', description: 'Link to the original review so visitors can check the full context.'}),
    defineField({name: 'profileUrl', title: 'Reviewer profile URL', type: 'url', description: 'Link to the reviewer’s public profile. Do not copy their profile photo without permission.'}),
    defineField({name: 'visitDate', title: 'Visit date', type: 'date'}),
    defineField({name: 'image', title: 'Guest image (permission required)', type: 'image', options: {hotspot: true}, description: imageUploadGuidance, validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'guestDescription', title: 'Guest description', type: 'string', description: 'Optional attribution such as Family of three.'}),
    defineField({name: 'settingImage', title: 'Story photograph', type: 'image', options: {hotspot: true}, description: 'The camp or experience photograph shown beside this review. Use only approved imagery.', validation: imageOptimizationWarning, fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})]}),
    defineField({name: 'locationLabel', title: 'Photograph location', type: 'string', description: 'For example, Moru, Emanyata tent.'}),
  ],
  preview: {select: {title: 'name', subtitle: 'source', media: 'image'}},
})

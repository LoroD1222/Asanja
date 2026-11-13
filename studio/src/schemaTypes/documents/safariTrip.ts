import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {validatePublishedReferences, validateUniqueSlug} from '../referenceValidation'
import {imageOptimizationWarning, imageUploadGuidance} from '../imageOptimization'

const image = (name: string, title: string, group: string) => defineField({name, title, type: 'image', group, description: imageUploadGuidance, options: {hotspot: true}, validation: (rule) => [rule.required(), imageOptimizationWarning(rule)], fields: [
  defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required().warning('Describe the image for accessibility.')}),
  defineField({name: 'caption', title: 'Caption', type: 'string'}),
]})
const references = (name: string, title: string, type: string, group = 'related') => defineField({name, title, group, type: 'array', of: [defineArrayMember({type: 'reference', to: [{type}]})], validation: (rule) => rule.unique().custom(validatePublishedReferences)})

export const safariTrip = defineType({
  name: 'safariTrip', title: 'Safari trip', type: 'document', icon: CalendarIcon,
  groups: [
    {name: 'overview', title: 'Overview', default: true}, {name: 'hero', title: 'Hero'},
    {name: 'itinerary', title: 'Itinerary and route'}, {name: 'experience', title: 'Experience'},
    {name: 'gallery', title: 'Gallery'}, {name: 'pricing', title: 'Pricing'},
    {name: 'related', title: 'Related content'}, {name: 'sections', title: 'Page order'},
    {name: 'booking', title: 'Booking'}, {name: 'seo', title: 'SEO and publishing'},
  ],
  initialValue: {publicationStatus: 'public', currency: 'USD', automaticBlogsEnabled: true, automaticBlogsLimit: 3,
    sections: ['overview','highlights','itinerary','route','destinations','accommodation','wildlife','gallery','pricing','inclusions','season','travel','relatedTrips','relatedBlogs','relatedLandingPages','faq','reviews','booking'].map((kind) => ({_type: 'tripSection', _key: kind, kind}))},
  fields: [
    defineField({name: 'title', title: 'Safari name', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'URL slug', type: 'slug', group: 'overview', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required().custom(validateUniqueSlug)}),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 3, group: 'overview', validation: (rule) => rule.required().max(280)}),
    defineField({name: 'introduction', title: 'Full introduction', type: 'pageRichText', group: 'overview'}),
    defineField({name: 'durationDays', title: 'Days', type: 'number', group: 'overview', validation: (rule) => rule.required().integer().min(1)}),
    defineField({name: 'durationNights', title: 'Nights', type: 'number', group: 'overview', validation: (rule) => rule.integer().min(0)}),
    defineField({name: 'category', title: 'Safari category', type: 'string', group: 'overview', options: {list: ['Wildlife','Family','Honeymoon','Luxury','Adventure','Migration','Photography','Safari and beach']}}),
    defineField({name: 'travelStyle', title: 'Travel style', type: 'string', group: 'overview', options: {list: ['Private','Small group','Fly-in','Self-drive','Custom']}}),
    defineField({name: 'startLocation', title: 'Starting location', type: 'string', group: 'overview'}),
    defineField({name: 'endLocation', title: 'Ending location', type: 'string', group: 'overview'}),
    defineField({name: 'featured', title: 'Featured safari', type: 'boolean', group: 'overview', initialValue: false}),
    defineField({name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero'}),
    defineField({name: 'heroDescription', title: 'Hero description', type: 'pageRichText', group: 'hero', description: 'Rich text below the safari name. Supports contextual links to published CMS pages; the short description is used when this is empty.'}),
    image('heroImage', 'Main hero image', 'hero'),
    defineField({name: 'highlights', title: 'Safari highlights', type: 'array', group: 'experience', of: [defineArrayMember({type: 'object', fields: [
      defineField({name: 'title', title: 'Highlight', type: 'string', validation: (rule) => rule.required()}),
      defineField({name: 'description', title: 'Description', type: 'text', rows: 2}),
    ], preview: {select: {title: 'title'}}})]}),
    defineField({name: 'itinerary', title: 'Day-by-day itinerary', type: 'array', group: 'itinerary', description: 'Drag days into travel order.', of: [defineArrayMember({type: 'itineraryDay'})], validation: (rule) => rule.custom((days) => {
      const numbers = ((days || []) as Array<{dayNumber?: unknown}>).map((day) => day?.dayNumber).filter((number): number is number => typeof number === 'number')
      return new Set(numbers).size === numbers.length || 'Each itinerary day needs a unique day number.'
    })}),
    defineField({name: 'routeStops', title: 'Map route stops', type: 'array', group: 'itinerary', description: 'Drag stops into travel order. Destinations supply their stored coordinates.', of: [defineArrayMember({type: 'routeStop'})]}),
    references('relatedDestinations', 'Destinations covered', 'destination', 'itinerary'),
    references('relatedCamps', 'Camps and accommodation', 'camp', 'experience'),
    defineField({name: 'wildlife', title: 'Wildlife and safari experiences', type: 'pageRichText', group: 'experience'}),
    defineField({name: 'activities', title: 'Safari activities', type: 'array', group: 'experience', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'bestTime', title: 'Best time to visit', type: 'pageRichText', group: 'experience'}),
    defineField({name: 'bestMonths', title: 'Recommended months', type: 'array', group: 'experience', of: [defineArrayMember({type: 'string', options: {list: ['January','February','March','April','May','June','July','August','September','October','November','December']}})]}),
    defineField({name: 'gallery', title: 'Photo and video gallery', type: 'array', group: 'gallery', of: [defineArrayMember({type: 'tripMedia'})]}),
    defineField({name: 'currency', title: 'Currency', type: 'string', group: 'pricing', options: {list: ['USD','EUR','GBP','TZS']}, validation: (rule) => rule.required()}),
    defineField({name: 'priceFrom', title: 'Starting price per person', type: 'number', group: 'pricing', description: 'Optional display price. Leave blank when a quote is required.', validation: (rule) => rule.min(0)}),
    defineField({name: 'pricingDescription', title: 'Pricing explanation', type: 'pageRichText', group: 'pricing'}),
    defineField({name: 'pricingOptions', title: 'Package options', type: 'array', group: 'pricing', of: [defineArrayMember({type: 'tripPricingOption'})]}),
    defineField({name: 'optionalExperiences', title: 'Optional experiences', type: 'array', group: 'pricing', of: [defineArrayMember({type: 'object', fields: [
      defineField({name: 'name', title: 'Experience', type: 'string'}), defineField({name: 'description', title: 'Description', type: 'text', rows: 2}),
      defineField({name: 'pricePerPerson', title: 'Price per person', type: 'number', validation: (rule) => rule.min(0)}),
    ], preview: {select: {title: 'name'}}})]}),
    defineField({name: 'customQuoteAvailable', title: 'Offer custom quotations', type: 'boolean', group: 'pricing', initialValue: true}),
    defineField({name: 'included', title: 'Included services', type: 'array', group: 'pricing', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'excluded', title: 'Excluded services', type: 'array', group: 'pricing', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'travelInformation', title: 'Travel information and preparation', type: 'pageRichText', group: 'experience'}),
    defineField({name: 'travelNotes', title: 'Important notes', type: 'array', group: 'experience', of: [defineArrayMember({type: 'string'})]}),
    references('relatedSafariTrips', 'Related safari trips and packages', 'safariTrip'),
    references('relatedBlogs', 'Manually selected blogs', 'article'),
    references('relatedLandingPages', 'Related SEO landing pages', 'seoLandingPage'),
    references('automaticBlogCategories', 'Automatic blog categories', 'category'),
    references('automaticBlogTags', 'Automatic blog tags', 'tag'),
    defineField({name: 'automaticBlogsEnabled', title: 'Show automatic related blogs', type: 'boolean', group: 'related', initialValue: true}),
    defineField({name: 'automaticBlogsLimit', title: 'Maximum automatic blogs', type: 'number', group: 'related', initialValue: 3, hidden: ({document}) => document?.automaticBlogsEnabled === false, validation: (rule) => rule.integer().min(1).max(9)}),
    defineField({name: 'faqs', title: 'Frequently asked questions', type: 'array', group: 'experience', of: [defineArrayMember({type: 'faqItem'})]}),
    defineField({name: 'reviews', title: 'Verified guest reviews', type: 'array', group: 'experience', of: [defineArrayMember({type: 'guestReview'})]}),
    defineField({name: 'sections', title: 'Page section order', type: 'array', group: 'sections', description: 'Drag sections to change their order. Add custom editorial sections as needed.', of: [defineArrayMember({type: 'tripSection'})], validation: (rule) => rule.custom((sections) => {
      const kinds = ((sections || []) as Array<{kind?: string}>).map((section) => section?.kind).filter((kind): kind is string => Boolean(kind) && kind !== 'editorial')
      return new Set(kinds).size === kinds.length || 'Each structured section can appear once. Add multiple custom editorial sections if needed.'
    })}),
    defineField({name: 'bookingHeading', title: 'Booking heading', type: 'string', group: 'booking'}),
    defineField({name: 'bookingText', title: 'Booking introduction', type: 'pageRichText', group: 'booking'}),
    defineField({name: 'publicationStatus', title: 'Visibility after publishing', type: 'string', group: 'seo', options: {layout: 'radio', list: [{title: 'Public', value: 'public'}, {title: 'Hidden', value: 'hidden'}]}, initialValue: 'public', validation: (rule) => rule.required()}),
    defineField({name: 'seo', title: 'SEO and social sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', days: 'durationDays', media: 'heroImage'}, prepare: ({title, days, media}) => ({title: title || 'Untitled safari', subtitle: days ? `${days} days` : 'New trip', media})},
})

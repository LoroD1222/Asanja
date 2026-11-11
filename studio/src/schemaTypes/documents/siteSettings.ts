import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings', title: 'Site contact settings', type: 'document', icon: CogIcon,
  fields: [
    defineField({name: 'title', title: 'Name', type: 'string', readOnly: true, initialValue: 'Site contact settings'}),
    defineField({name: 'whatsappNumber', title: 'WhatsApp number', type: 'string', description: 'Country code and digits only, without + or spaces.', validation: (rule) => rule.regex(/^\d{8,15}$/).warning('Use 8–15 digits.')}),
    defineField({name: 'contactEmail', title: 'Contact email', type: 'string', validation: (rule) => rule.email()}),
  ],
})

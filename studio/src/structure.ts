import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Asanja Africa CMS')
    .items([
      S.documentTypeListItem('article').title('Articles'),
      S.divider(),
      S.documentTypeListItem('safariTrip').title('Safari trips'),
      S.documentTypeListItem('seoLandingPage').title('SEO landing pages'),
      S.documentTypeListItem('destination').title('Destinations'),
      S.documentTypeListItem('camp').title('Camps and accommodation'),
      S.listItem().title('Site contact settings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('tag').title('Tags'),
    ])

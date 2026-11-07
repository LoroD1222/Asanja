import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Asanja Africa CMS')
    .items([
      S.listItem()
        .title('Articles')
        .child(
          S.list()
            .title('Articles')
            .items([
              S.documentTypeListItem('article').title('All articles'),
              S.listItem()
                .title('WordPress imports')
                .child(
                  S.documentList()
                    .title('WordPress imports')
                    .schemaType('article')
                    .filter('_type == "article" && defined(migration.wordpressId)'),
                ),
              S.listItem()
                .title('Awaiting review')
                .child(
                  S.documentList()
                    .title('Awaiting review')
                    .schemaType('article')
                    .filter('_type == "article" && editorialStatus == "review"'),
                ),
              S.listItem()
                .title('Scheduled')
                .child(
                  S.documentList()
                    .title('Scheduled')
                    .schemaType('article')
                    .filter('_type == "article" && editorialStatus == "scheduled"'),
                ),
              S.listItem()
                .title('Published')
                .child(
                  S.documentList()
                    .title('Published')
                    .schemaType('article')
                    .filter('_type == "article" && !(_id in path("drafts.**"))'),
                ),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('tag').title('Tags'),
    ])

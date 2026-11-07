import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    article: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (document) => ({
        locations: [
          {
            title: document?.title || 'Untitled article',
            href: document?.slug ? `/blogs/${document.slug}/` : '/blogs/',
          },
          {title: 'Blog index', href: '/blogs/'},
        ],
      }),
    }),
  },
}

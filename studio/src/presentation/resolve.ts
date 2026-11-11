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
    safariTrip: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (document) => ({locations: [{title: document?.title || 'Safari trip', href: document?.slug ? `/safaris/${document.slug}/` : '/safaris/'}]}),
    }),
    seoLandingPage: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (document) => ({locations: [{title: document?.title || 'SEO landing page', href: document?.slug ? `/safari-guides/${document.slug}/` : '/safari-guides/'}]}),
    }),
    destination: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (document) => ({locations: [{title: document?.title || 'Destination', href: document?.slug ? `/destinations/${document.slug}/` : '/destinations/'}]}),
    }),
    camp: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (document) => ({locations: [{title: document?.title || 'Camp', href: document?.slug ? `/camps/${document.slug}/` : '/camps/'}]}),
    }),
  },
}

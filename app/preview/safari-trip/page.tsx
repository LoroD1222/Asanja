import type {Metadata} from 'next'
import {SafariTripPage} from '../../../components/pages/safari-trip-page'
import {publishedClient} from '../../../sanity/client'
import {buildPreviewTrip, previewParagraph} from '../../../sanity/preview-trip'
import {articlesQuery} from '../../../sanity/queries'
import type {ArticleCollection} from '../../../sanity/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Safari trip template preview',
  robots: {index: false, follow: false},
}

export default async function SafariTripTemplatePreview() {
  const collection = await publishedClient.fetch<ArticleCollection>(articlesQuery(0, 3), {includeDrafts: false}).catch(() => ({articles: [], total: 0}))
  const articles = collection.articles || []
  const first = articles[0]
  const introduction = previewParagraph('This preview demonstrates the CMS-driven safari template using the route outline of an existing Asanja Africa trip. A published trip uses its own day-by-day details, images, related content and confirmed prices.', 'intro-copy')
  if (first) introduction.push({
    _type: 'block', _key: 'journal-link', style: 'normal',
    markDefs: [{_key: 'cms-article', _type: 'internalLink', target: {_id: first._id, _type: 'article', slug: first.slug}}],
    children: [
      {_type: 'span', _key: 'journal-before', text: 'The rich-text editor can also link directly to a published CMS article, such as ', marks: []},
      {_type: 'span', _key: 'journal-title', text: first.title, marks: ['cms-article']},
      {_type: 'span', _key: 'journal-after', text: '.', marks: []},
    ],
  })
  return <SafariTripPage trip={buildPreviewTrip(introduction, first ? [first] : [])} automaticBlogs={articles.slice(1)} automaticTrips={[]} preview />
}

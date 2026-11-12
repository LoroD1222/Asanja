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
  const introduction = previewParagraph('Journey from the baobab country of Tarangire to the Ngorongoro highlands, the Serengeti plains and the wide wilderness of Ruaha. Private guiding and carefully chosen stays give this route room to feel entirely your own.', 'intro-copy')
  if (first) introduction.push({
    _type: 'block', _key: 'journal-link', style: 'normal',
    markDefs: [{_key: 'cms-article', _type: 'internalLink', target: {_id: first._id, _type: 'article', slug: first.slug}}],
    children: [
      {_type: 'span', _key: 'journal-before', text: 'For more inspiration before you travel, read ', marks: []},
      {_type: 'span', _key: 'journal-title', text: first.title, marks: ['cms-article']},
      {_type: 'span', _key: 'journal-after', text: ' in the Asanja journal.', marks: []},
    ],
  })
  return <SafariTripPage trip={buildPreviewTrip(introduction, first ? [first] : [])} automaticBlogs={articles.slice(1)} automaticTrips={[]} preview />
}

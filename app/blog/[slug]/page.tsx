import {permanentRedirect} from 'next/navigation'

export default async function LegacyArticleRoute({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  permanentRedirect(`/blogs/${encodeURIComponent(slug)}/`)
}

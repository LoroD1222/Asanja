import {permanentRedirect} from 'next/navigation'

export default async function TagPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  permanentRedirect(`/blogs/tag/${encodeURIComponent(slug)}/`)
}

import {permanentRedirect} from 'next/navigation'

export default async function AuthorPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  permanentRedirect(`/blogs/author/${encodeURIComponent(slug)}/`)
}

import {defineEnableDraftMode} from 'next-sanity/draft-mode'
import {publishedClient} from '../../../../sanity/client'

export async function GET(request: Request) {
  const token = process.env.SANITY_API_READ_TOKEN?.trim()
  if (!token) return new Response('Draft preview is not configured.', {status: 503})
  return defineEnableDraftMode({client: publishedClient.withConfig({token, useCdn: false})}).GET(request)
}

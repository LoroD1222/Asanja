import 'server-only'

import {draftMode} from 'next/headers'
import {createClient, type QueryParams} from 'next-sanity'
import {sanityEnv} from './env'

export const publishedClient = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: sanityEnv.apiVersion,
  perspective: 'published',
  useCdn: true,
  stega: false,
})

type SanityFetchOptions = {
  query: string
  params?: QueryParams
  tags?: string[]
}

export async function sanityFetch<T>({query, params = {}, tags = []}: SanityFetchOptions) {
  const preview = (await draftMode()).isEnabled
  const queryParams = {...params, includeDrafts: preview}

  if (!preview) {
    return publishedClient.fetch<T>(query, queryParams, {
      next: {revalidate: 300, tags},
    })
  }

  const token = process.env.SANITY_API_READ_TOKEN?.trim()
  if (!token) {
    throw new Error('Draft Mode requires the server-only SANITY_API_READ_TOKEN environment variable.')
  }

  return publishedClient
    .withConfig({
      token,
      perspective: 'drafts',
      useCdn: false,
      stega: {enabled: true, studioUrl: sanityEnv.studioUrl},
    })
    .fetch<T>(query, queryParams, {cache: 'no-store'})
}

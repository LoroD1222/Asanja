import 'server-only'

import {draftMode} from 'next/headers'
import {createClient, type QueryParams} from 'next-sanity'
import {sanityEnv} from './env'

const readToken = process.env.SANITY_API_READ_TOKEN?.trim()

export const publishedClient = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: sanityEnv.apiVersion,
  token: readToken || undefined,
  perspective: 'published',
  useCdn: true,
  stega: false,
})

type SanityFetchOptions = {
  query: string
  params?: QueryParams
  tags?: string[]
  stega?: boolean
}

export async function sanityFetch<T>({query, params = {}, tags = [], stega = true}: SanityFetchOptions) {
  const preview = (await draftMode()).isEnabled
  const queryParams = {...params, includeDrafts: preview}

  if (!preview) {
    if (process.env.NODE_ENV === 'development') {
      return publishedClient.fetch<T>(query, queryParams, {cache: 'no-store'})
    }

    return publishedClient.fetch<T>(query, queryParams, {
      next: {revalidate: 300, tags},
    })
  }

  if (!readToken) {
    throw new Error('Draft Mode requires the server-only SANITY_API_READ_TOKEN environment variable.')
  }

  return publishedClient
    .withConfig({
      token: readToken,
      perspective: 'drafts',
      useCdn: false,
      stega: stega ? {enabled: true, studioUrl: sanityEnv.studioUrl} : false,
    })
    .fetch<T>(query, queryParams, {cache: 'no-store'})
}

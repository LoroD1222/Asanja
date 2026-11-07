import 'server-only'

import {publishedClient} from './client'
import {legacyArticleRedirectQuery} from './queries'

export async function findPublishedArticleRedirect(requestUrl: string, sourcePath: string) {
  const url = new URL(requestUrl)
  const wordpressId = Number(url.searchParams.get('p')) || -1
  const normalizedPath = `/${sourcePath.replace(/^\/+|\/+$/g, '')}/`
  const sourceUrls = [
    `https://asanjaafrica.com${normalizedPath}`,
    `https://www.asanjaafrica.com${normalizedPath}`,
    `http://asanjaafrica.com${normalizedPath}`,
    `http://www.asanjaafrica.com${normalizedPath}`,
  ]

  const match = await publishedClient.fetch<{slug?: string} | null>(
    legacyArticleRedirectQuery,
    {wordpressId, sourcePath: normalizedPath, sourceUrls, includeDrafts: false},
    {next: {revalidate: 300, tags: ['sanity', 'article-redirects']}},
  )

  return match?.slug ? `/blogs/${match.slug}/` : null
}

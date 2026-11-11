import {revalidateTag} from 'next/cache'
import type {NextRequest} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

type WebhookBody = {_type?: string; slug?: {current?: string}}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim()
  if (!secret) return new Response('Revalidation is not configured.', {status: 503})

  const {body, isValidSignature} = await parseBody<WebhookBody>(request, secret)
  if (!isValidSignature) return new Response('Invalid signature.', {status: 401})

  revalidateTag('sanity', 'max')
  revalidateTag('articles', 'max')
  revalidateTag('safariTrip', 'max')
  revalidateTag('seoLandingPage', 'max')
  revalidateTag('destination', 'max')
  revalidateTag('camp', 'max')
  revalidateTag('siteSettings', 'max')
  revalidateTag('automatic-related-blogs', 'max')
  if (body?._type && body.slug?.current) revalidateTag(`${body._type}:${body.slug.current}`, 'max')

  return Response.json({revalidated: true})
}

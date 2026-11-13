import 'server-only'

import {createHmac, timingSafeEqual} from 'node:crypto'
import {cookies} from 'next/headers'

export const itineraryAccessCookie = 'asanja_itinerary_access'
export const itineraryAccessMaxAge = 60 * 60 * 24 * 90

function signingKey() {
  const secret = process.env.PDF_ACCESS_SECRET?.trim() || process.env.SANITY_REVALIDATE_SECRET?.trim()
  return secret ? createHmac('sha256', secret).update('asanja-itinerary-access-v1').digest() : null
}

export function itineraryAccessConfigured() {
  return Boolean(signingKey())
}

export function createItineraryAccessToken() {
  const key = signingKey()
  if (!key) return null
  const expires = String(Math.floor(Date.now() / 1000) + itineraryAccessMaxAge)
  const signature = createHmac('sha256', key).update(expires).digest('base64url')
  return `v1.${expires}.${signature}`
}

export async function hasItineraryAccess() {
  const token = (await cookies()).get(itineraryAccessCookie)?.value
  const key = signingKey()
  if (!token || !key) return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1' || !/^\d{10}$/.test(parts[1])) return false
  const expires = Number(parts[1])
  if (!Number.isSafeInteger(expires) || expires < Math.floor(Date.now() / 1000)) return false
  const expected = createHmac('sha256', key).update(parts[1]).digest()
  let actual: Buffer
  try {actual = Buffer.from(parts[2], 'base64url')} catch {return false}
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

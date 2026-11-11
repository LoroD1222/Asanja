import type {PageKind, PageTarget} from './page-types'

const prefixes: Record<PageKind, string> = {
  article: '/blogs/', safariTrip: '/safaris/', seoLandingPage: '/safari-guides/',
  destination: '/destinations/', camp: '/camps/',
}

export function pageHref(target?: Partial<PageTarget> | null) {
  if (!target?._type || !target.slug || target.publicationStatus === 'hidden') return null
  if (!/^[a-z0-9-]+$/.test(target.slug)) return null
  const prefix = prefixes[target._type as PageKind]
  return prefix ? `${prefix}${target.slug}/` : null
}

export function safeExternalHref(href?: string) {
  if (!href) return null
  try {
    const url = new URL(href)
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? href : null
  } catch {return null}
}

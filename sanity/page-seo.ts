import type {Metadata} from 'next'
import type {PageSeo} from './page-types'

export const siteOrigin = 'https://asanjaafrica.com'
export const organizationData = {'@context': 'https://schema.org', '@type': 'TravelAgency', '@id': `${siteOrigin}/#organization`, name: 'Asanja Africa', url: siteOrigin}

export function pageMetadata(page: {title: string; summary?: string; seo?: PageSeo}, pathname: string): Metadata {
  const title = page.seo?.title || page.title
  const description = page.seo?.description || page.summary
  const image = page.seo?.openGraphImage?.asset?.url
  return {
    title, description,
    alternates: {canonical: page.seo?.canonicalUrl || new URL(pathname, siteOrigin).toString()},
    robots: page.seo?.noIndex ? {index: false, follow: false} : undefined,
    openGraph: {title: page.seo?.openGraphTitle || title, description: page.seo?.openGraphDescription || description, images: image ? [{url: image, alt: page.seo?.openGraphImage?.alt || ''}] : undefined},
  }
}

export function jsonLd(value: unknown) {return JSON.stringify(value).replace(/</g, '\\u003c')}

export function breadcrumbData(items: Array<{name: string; path: string}>) {
  return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({'@type': 'ListItem', position: index + 1, name: item.name, item: new URL(item.path, siteOrigin).toString()}))}
}

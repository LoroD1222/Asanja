import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {CampPageView} from '../../../components/pages/camp-page'
import {getCampPage, getCampSeo} from '../../../sanity/camp-data'
import {breadcrumbData, jsonLd, pageMetadata, siteOrigin} from '../../../sanity/page-seo'

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const page = await getCampSeo(slug)
  return page
    ? pageMetadata(page, `/camps/${page.slug}/`)
    : {title: 'Camp not found', robots: {index: false, follow: false}}
}

export default async function CampRoute({params}: Props) {
  const {slug} = await params
  const page = await getCampPage(slug)
  if (!page) notFound()

  const path = `/camps/${page.slug}/`
  const lodging = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: page.title,
    description: page.summary,
    url: new URL(path, siteOrigin).toString(),
    image: page.heroImage?.asset?.url,
    address: page.location ? {'@type': 'PostalAddress', addressLocality: page.location, addressCountry: 'TZ'} : undefined,
  }

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd(breadcrumbData([
      {name: 'Home', path: '/'},
      {name: 'Camps and lodges', path: '/camps-and-lodges/'},
      {name: page.title, path},
    ]))}} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd(lodging)}} />
    <CampPageView page={page} />
  </>
}

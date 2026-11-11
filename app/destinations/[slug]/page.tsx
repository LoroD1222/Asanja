import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ContentPageView} from '../../../components/pages/content-page'
import {getContentPage, getPageSeo} from '../../../sanity/page-data'
import {breadcrumbData, jsonLd, pageMetadata} from '../../../sanity/page-seo'

type Props = {params: Promise<{slug: string}>}
export async function generateMetadata({params}: Props): Promise<Metadata> {const {slug} = await params; const page = await getPageSeo('destination', slug); return page ? pageMetadata(page, `/destinations/${page.slug}/`) : {title: 'Destination not found', robots: {index: false, follow: false}}}
export default async function DestinationRoute({params}: Props) {const {slug} = await params; const page = await getContentPage('destination', slug); if (!page) notFound(); return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd(breadcrumbData([{name: 'Home', path: '/'}, {name: 'Safaris', path: '/safaris/'}, {name: page.title, path: `/destinations/${page.slug}/`}] ))}} /><ContentPageView page={page} type="destination" /></>}

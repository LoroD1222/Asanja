import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ContentPageView} from '../../../components/pages/content-page'
import {getContentPage, getPageSeo} from '../../../sanity/page-data'
import {breadcrumbData, jsonLd, pageMetadata} from '../../../sanity/page-seo'

type Props = {params: Promise<{slug: string}>}
export async function generateMetadata({params}: Props): Promise<Metadata> {const {slug} = await params; const page = await getPageSeo('camp', slug); return page ? pageMetadata(page, `/camps/${page.slug}/`) : {title: 'Camp not found', robots: {index: false, follow: false}}}
export default async function CampRoute({params}: Props) {const {slug} = await params; const page = await getContentPage('camp', slug); if (!page) notFound(); return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd(breadcrumbData([{name: 'Home', path: '/'}, {name: 'Camps and lodges', path: '/camps-and-lodges/'}, {name: page.title, path: `/camps/${page.slug}/`}] ))}} /><ContentPageView page={page} type="camp" /></>}

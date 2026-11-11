import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {SeoLandingPageView} from '../../../components/pages/seo-landing-page'
import {getAutomaticBlogs, getPageSeo, getSeoLandingPage} from '../../../sanity/page-data'
import {breadcrumbData, jsonLd, organizationData, pageMetadata} from '../../../sanity/page-seo'

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const page = await getPageSeo('seoLandingPage', slug)
  return page ? pageMetadata(page, `/safari-guides/${page.slug}/`) : {title: 'Guide not found', robots: {index: false, follow: false}}
}

export default async function SeoLandingRoute({params}: Props) {
  const {slug} = await params
  const page = await getSeoLandingPage(slug)
  if (!page) notFound()
  const selectedBlogs = [...(page.relatedBlogs || []), ...(page.sections || []).flatMap((section) => section.blogs || [])].filter(Boolean)
  const automaticBlogs = await getAutomaticBlogs({categoryIds: page.automaticBlogCategoryIds, tagIds: page.automaticBlogTagIds, destinationIds: page.relatedDestinations?.filter(Boolean).map((item) => item._id), excludedIds: selectedBlogs.map((item) => item._id), enabled: page.automaticBlogsEnabled !== false, limit: page.automaticBlogsLimit})
  const structured = [organizationData, breadcrumbData([{name: 'Home', path: '/'}, {name: 'Safaris', path: '/safaris/'}, {name: page.title, path: `/safari-guides/${page.slug}/`}])]
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd(structured)}} /><SeoLandingPageView page={page} automaticBlogs={automaticBlogs} /></>
}

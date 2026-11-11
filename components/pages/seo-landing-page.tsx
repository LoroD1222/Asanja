import {BlogShell} from '../blog/blog-shell'
import type {ArticleCardData} from '../../sanity/types'
import type {EditorialSection, SeoLandingPage} from '../../sanity/page-types'
import {Breadcrumbs, RelatedBlogs, RelatedCards} from './page-sections'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'
import {EditorialSectionRenderer} from './editorial-section-renderer'

const relatedKinds: Array<{kind: EditorialSection['kind']; title: string; key: 'relatedDestinations' | 'relatedCamps' | 'relatedSafariTrips' | 'relatedLandingPages'; label: string}> = [
  {kind: 'destinations', title: 'Destinations to explore', key: 'relatedDestinations', label: 'Destination'},
  {kind: 'camps', title: 'Places to stay', key: 'relatedCamps', label: 'Camp'},
  {kind: 'trips', title: 'Safari journeys', key: 'relatedSafariTrips', label: 'Safari trip'},
  {kind: 'landingPages', title: 'Keep exploring', key: 'relatedLandingPages', label: 'Safari guide'},
]

export function SeoLandingPageView({page, automaticBlogs}: {page: SeoLandingPage; automaticBlogs: ArticleCardData[]}) {
  const usedKinds = new Set(page.sections?.map((section) => section.kind) || [])
  return <BlogShell className="safari-site"><article className="safari-page safari-landing-page">
    <Breadcrumbs current={page.title} parents={[{label: 'Safaris', href: '/safaris/'}]} />
    <header className="safari-landing-hero"><div><p className="safari-kicker">{page.eyebrow || 'Explore Tanzania'}</p><h1>{page.title}</h1>{page.summary ? <p>{page.summary}</p> : null}</div><PageImage image={page.heroImage} priority sizes="(max-width: 900px) 100vw, 55vw" /></header>
    <div className="safari-page-content">
      {page.introduction?.length ? <section className="safari-section safari-landing-intro"><PortablePageText value={page.introduction} /></section> : null}
      {page.sections?.map((section) => <EditorialSectionRenderer key={section._key} section={section} page={page} />)}
      {relatedKinds.filter((item) => !usedKinds.has(item.kind)).map((item) => <RelatedCards key={item.kind} title={item.title} items={page[item.key]} label={item.label} />)}
      {!usedKinds.has('blogs') ? <RelatedBlogs title="Selected stories for this journey" eyebrow="Handpicked from the journal" articles={page.relatedBlogs} /> : null}
      <RelatedBlogs title="More from the journal" eyebrow="Automatically recommended" articles={automaticBlogs} automatic />
    </div>
    <section className="safari-closing"><p className="safari-kicker">Make it yours</p><h2>Let us help you plan your Tanzania journey.</h2><a href="/make-a-booking/">Plan your safari ↗</a></section>
  </article></BlogShell>
}

import {BlogShell} from '../blog/blog-shell'
import type {ContentPage} from '../../sanity/page-types'
import {Breadcrumbs, RelatedBlogs, RelatedCards, SectionHeading} from './page-sections'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'
import {SafariGallery} from './safari-gallery'

export function ContentPageView({page, type}: {page: ContentPage; type: 'destination' | 'camp'}) {
  return <BlogShell className="safari-site"><article className="safari-page safari-content-page">
    <Breadcrumbs current={page.title} parents={[{label: type === 'camp' ? 'Camps and lodges' : 'Safaris', href: type === 'camp' ? '/camps-and-lodges/' : '/safaris/'}]} />
    <header className="safari-landing-hero"><div><p className="safari-kicker">{type === 'camp' ? 'Stay close to the wild' : 'Explore Tanzania'}</p><h1>{page.title}</h1>{page.summary ? <p>{page.summary}</p> : null}{page.location ? <span className="safari-location">{page.location}</span> : null}</div><PageImage image={page.heroImage} priority /></header>
    <div className="safari-page-content"><section className="safari-section"><SectionHeading title={type === 'camp' ? 'Your place in the wild' : 'A sense of place'} /><PortablePageText value={page.description} />{page.style ? <p>{page.style}</p> : null}</section>
      {page.wildlife?.length ? <section className="safari-section"><SectionHeading title="Wildlife" /><PortablePageText value={page.wildlife} /></section> : null}
      {page.bestTime?.length ? <section className="safari-section"><SectionHeading title="When to visit" /><PortablePageText value={page.bestTime} /></section> : null}
      {page.activities?.length || page.facilities?.length ? <section className="safari-section"><SectionHeading title={type === 'camp' ? 'Camp facilities' : 'What to experience'} /><ul className="safari-pill-list">{(type === 'camp' ? page.facilities : page.activities)?.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      {page.gallery?.length ? <section className="safari-section"><SectionHeading title="Gallery" /><SafariGallery items={page.gallery} /></section> : null}
      {type === 'destination' ? <RelatedCards title="Stay nearby" items={page.relatedCamps} label="Camp" /> : page.destination ? <RelatedCards title="Explore the destination" items={[page.destination]} label="Destination" /> : null}
      <RelatedCards title="Safari journeys" items={page.relatedSafariTrips} label="Safari trip" />
      <RelatedBlogs title="From the journal" articles={page.relatedBlogs} />
    </div>
  </article></BlogShell>
}

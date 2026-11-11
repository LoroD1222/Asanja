import type {EditorialSection, SeoLandingPage} from '../../sanity/page-types'
import {safeExternalHref} from '../../sanity/page-routes'
import {CardGrid} from './content-card'
import {FAQSection, RelatedBlogs, ReviewSection, SectionHeading} from './page-sections'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'
import {SafariGallery} from './safari-gallery'

function actionHref(href?: string) {return href?.startsWith('/') && !href.startsWith('//') ? href : safeExternalHref(href)}

export function EditorialSectionRenderer({section, page}: {section: EditorialSection; page: SeoLandingPage}) {
  const title = section.heading || 'Explore more'
  const id = section.anchor || `section-${section._key}`
  const cards = section.kind === 'destinations' ? section.destinations?.length ? section.destinations : page.relatedDestinations
    : section.kind === 'camps' ? section.camps?.length ? section.camps : page.relatedCamps
      : section.kind === 'trips' ? section.trips?.length ? section.trips : page.relatedSafariTrips
        : section.kind === 'landingPages' ? section.landingPages?.length ? section.landingPages : page.relatedLandingPages : undefined
  if (section.kind === 'blogs') return <RelatedBlogs title={title} eyebrow={section.eyebrow || 'Selected reading'} articles={section.blogs?.length ? section.blogs : page.relatedBlogs} />
  return <section id={id} className={'safari-section safari-editorial-section safari-editorial-' + section.kind}>
    <SectionHeading eyebrow={section.eyebrow} title={title} />
    {section.kind === 'editorial' ? <div className="safari-editorial-layout"><PortablePageText value={section.body} /><figure><PageImage image={section.image} />{section.image?.caption ? <figcaption>{section.image.caption}</figcaption> : null}</figure></div> : <PortablePageText value={section.body} />}
    {section.kind === 'highlights' ? <div className="safari-highlights">{section.highlights?.map((item, index) => <div key={item._key}><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.description}</p></div>)}</div> : null}
    {section.kind === 'statistics' ? <div className="safari-statistics">{section.statistics?.map((item) => <div key={item._key}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div> : null}
    {section.kind === 'gallery' ? <SafariGallery items={section.media} /> : null}
    {cards ? <CardGrid items={cards} label={section.kind === 'trips' ? 'Safari trip' : section.kind === 'landingPages' ? 'Safari guide' : undefined} /> : null}
    {section.kind === 'faq' ? <FAQSection items={section.faqs} /> : null}
    {section.kind === 'testimonials' ? <ReviewSection items={section.testimonials} /> : null}
    {section.kind === 'cta' && actionHref(section.ctaUrl) ? <a className="safari-action" href={actionHref(section.ctaUrl)!}>{section.ctaLabel || 'Learn more'} ↗</a> : null}
    {section.kind === 'download' && section.documentUrl ? <a className="safari-action" href={section.documentUrl} download>Download document ↓</a> : null}
  </section>
}

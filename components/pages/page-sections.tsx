import Link from 'next/link'
import {ArticleList} from '../blog/article-list'
import type {ArticleCardData} from '../../sanity/types'
import type {FAQ, PageCard, Review} from '../../sanity/page-types'
import {pageHref, safeExternalHref} from '../../sanity/page-routes'
import {CardGrid} from './content-card'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'

export function SectionHeading({eyebrow, title}: {eyebrow?: string; title: string}) {
  return <div className="safari-section-heading">{eyebrow ? <p className="safari-kicker">{eyebrow}</p> : null}<h2>{title}</h2></div>
}

export function RelatedCards({title, eyebrow, items, label}: {title: string; eyebrow?: string; items?: Array<PageCard | null>; label?: string}) {
  const visible = (items || []).filter((item) => item && pageHref(item))
  return visible.length ? <section className="safari-section"><SectionHeading eyebrow={eyebrow} title={title} /><CardGrid items={visible} label={label} /></section> : null
}

export function RelatedBlogs({title, eyebrow, articles, automatic = false}: {title: string; eyebrow?: string; articles?: ArticleCardData[]; automatic?: boolean}) {
  const visible = (articles || []).filter((article) => article?._id && article.slug)
  return visible.length ? <section className={'safari-section safari-blogs' + (automatic ? ' is-automatic' : '')}><SectionHeading eyebrow={eyebrow || 'Asanja journal'} title={title} /><ArticleList articles={visible} /></section> : null
}

export function FAQSection({items}: {items?: FAQ[]}) {
  const visible = (items || []).filter((item) => item.question && item.answer?.length)
  return visible.length ? <div className="safari-faq">{visible.map((item) => <details key={item._key}><summary>{item.question}<span aria-hidden="true">+</span></summary><PortablePageText value={item.answer} /></details>)}</div> : null
}

export function ReviewSection({items}: {items?: Review[]}) {
  const visible = (items || []).filter((item) => item.name && item.quote)
  return visible.length ? <div className="safari-reviews">{visible.map((item) => <blockquote key={item._key}>{item.image?.asset?.url ? <PageImage image={item.image} /> : null}{item.rating ? <div aria-label={`${item.rating} out of 5 stars`} className="safari-stars">{'★'.repeat(Math.round(item.rating))}</div> : null}<p>“{item.quote}”</p><footer><strong>{item.name}</strong>{item.country ? ` · ${item.country}` : ''}{item.source ? <span> · {safeExternalHref(item.sourceUrl) ? <a href={safeExternalHref(item.sourceUrl)!} target="_blank" rel="noopener noreferrer">{item.source}</a> : item.source}</span> : null}</footer></blockquote>)}</div> : null
}

export function Breadcrumbs({current, parents}: {current: string; parents: Array<{label: string; href: string}>}) {
  return <nav className="safari-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link>{parents.map((parent) => <span key={parent.href}><span aria-hidden="true">/</span><Link href={parent.href}>{parent.label}</Link></span>)}<span aria-hidden="true">/</span><span aria-current="page">{current}</span></nav>
}

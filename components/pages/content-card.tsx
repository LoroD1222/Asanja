import Image from 'next/image'
import Link from 'next/link'
import type {PageCard} from '../../sanity/page-types'
import {pageHref} from '../../sanity/page-routes'

export function ContentCard({item, label, preview = false}: {item: PageCard | null; label?: string; preview?: boolean}) {
  const href = pageHref(item)
  if (!item || (!href && !preview)) return null
  const asset = item.heroImage?.asset
  const image = asset?.url ? <Image src={asset.url} alt={item.heroImage?.alt || ''} width={asset.metadata?.dimensions?.width || 800} height={asset.metadata?.dimensions?.height || 600} sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" /> : <span className="safari-card-placeholder" />
  return <article className="safari-card">
    {preview ? <div className="safari-card-image" aria-label={item.title}>{image}</div> : <Link className="safari-card-image" href={href!} aria-label={item.title}>{image}</Link>}
    <div className="safari-card-content"><span className="safari-kicker">{[preview ? 'Sample' : label, preview ? label : item.category].filter(Boolean).join(' · ') || item._type}</span><h3>{preview ? item.title : <Link href={href!}>{item.title}</Link>}</h3>
      {item.location ? <span className="safari-card-location">{item.location}</span> : null}
      {item._type === 'safariTrip' && item.durationDays ? <span className="safari-card-location">{item.durationDays} days{item.durationNights !== undefined ? ` · ${item.durationNights} nights` : ''}</span> : null}
      {item.summary ? <p>{item.summary}</p> : null}
      {preview ? <span className="safari-text-link">CMS page link in the published trip</span> : <Link className="safari-text-link" href={href!}>Explore <span aria-hidden="true">↗</span></Link>}
    </div>
  </article>
}

export function CardGrid({items, label, preview = false}: {items?: Array<PageCard | null>; label?: string; preview?: boolean}) {
  const visible = (items || []).filter((item): item is PageCard => Boolean(item && (preview || pageHref(item))))
  return visible.length ? <div className="safari-card-grid">{visible.map((item) => <ContentCard key={item._id} item={item} label={label} preview={preview} />)}</div> : null
}

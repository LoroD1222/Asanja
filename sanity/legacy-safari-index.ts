import 'server-only'

import {getSafariTripCollection} from './page-data'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character] || character)
}

const styles = `<style id="sanity-safari-catalog-styles">
  .sanity-safari-catalog{padding:clamp(52px,7vw,100px) 24px;background:#f7f3ef;color:#303b31}
  .sanity-safari-catalog-inner{max-width:1220px;margin:0 auto}
  .sanity-safari-catalog-eyebrow{margin:0 0 12px;color:#a47545;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase}
  .sanity-safari-catalog h2{margin:0 0 14px;color:#303b31;font:400 clamp(36px,5vw,64px)/1.08 Georgia,serif}
  .sanity-safari-catalog-intro{max-width:650px;margin:0 0 32px;color:#4f5b50;font:400 17px/1.65 Arial,sans-serif}
  .sanity-safari-catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
  .sanity-safari-catalog-card{min-width:0;background:#fff;border:1px solid #ded9d1}
  .sanity-safari-catalog-image{display:block;aspect-ratio:1.5;overflow:hidden;background:#e3e0d7}
  .sanity-safari-catalog-image img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .35s}
  .sanity-safari-catalog-card:hover img{transform:scale(1.04)}
  .sanity-safari-catalog-copy{padding:24px}
  .sanity-safari-catalog-meta{display:block;margin-bottom:10px;color:#986d42;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.11em;text-transform:uppercase}
  .sanity-safari-catalog h3{margin:0 0 12px;color:#303b31;font:400 clamp(24px,2.2vw,32px)/1.2 Georgia,serif}
  .sanity-safari-catalog h3 a{color:inherit;text-decoration:none}
  .sanity-safari-catalog h3 a:hover,.sanity-safari-catalog h3 a:focus-visible{text-decoration:underline}
  .sanity-safari-catalog-copy p{margin:0 0 22px;color:#536154;font:400 14px/1.6 Arial,sans-serif}
  .sanity-safari-catalog-link{display:inline-block;color:#4c6345!important;border-bottom:1px solid currentColor;padding-bottom:4px;font:700 12px/1.4 Arial,sans-serif;letter-spacing:.09em;text-decoration:none;text-transform:uppercase}
  .sanity-safari-catalog-link:hover,.sanity-safari-catalog-link:focus-visible{color:#986d42!important}
  @media(max-width:900px){.sanity-safari-catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:600px){.sanity-safari-catalog{padding:50px 16px}.sanity-safari-catalog-grid{grid-template-columns:1fr;gap:16px}.sanity-safari-catalog-copy{padding:20px}.sanity-safari-catalog-intro{font-size:15px}}
</style>`

export async function renderLegacySafariIndex(html: string) {
  const trips = await getSafariTripCollection().catch(() => [])
  if (!trips.length) return html

  const cards = trips.filter((trip) => trip.slug && trip.title).map((trip) => {
    const href = `/safaris/${encodeURIComponent(trip.slug)}/`
    const image = trip.heroImage?.asset?.url
    const detail = trip.durationDays ? `${trip.durationDays} days${trip.durationNights ? ` · ${trip.durationNights} nights` : ''}` : ''
    return `<article class="sanity-safari-catalog-card">
      <a class="sanity-safari-catalog-image" href="${href}" aria-label="Explore ${escapeHtml(trip.title)}">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(trip.heroImage?.alt || '')}" loading="lazy" decoding="async">` : ''}</a>
      <div class="sanity-safari-catalog-copy">
        <span class="sanity-safari-catalog-meta">${trip.isSample ? 'Sample itinerary' : 'Private safari'}${detail ? ` · ${escapeHtml(detail)}` : ''}</span>
        <h3><a href="${href}">${escapeHtml(trip.title)}</a></h3>
        ${trip.summary ? `<p>${escapeHtml(trip.summary)}</p>` : ''}
        <a class="sanity-safari-catalog-link" href="${href}">Explore this journey ↗</a>
      </div>
    </article>`
  }).join('')
  if (!cards) return html

  const marker = '<div class="elementor-element elementor-element-4cc9398'
  const insertAt = html.indexOf(marker)
  if (insertAt < 0) return html
  const section = `<section class="sanity-safari-catalog" aria-labelledby="sanity-safari-catalog-title"><div class="sanity-safari-catalog-inner"><p class="sanity-safari-catalog-eyebrow">Explore Asanja journeys</p><h2 id="sanity-safari-catalog-title">Safari itineraries</h2><p class="sanity-safari-catalog-intro">Discover our private Tanzania journeys. Each itinerary can be shaped around your dates and interests.</p><div class="sanity-safari-catalog-grid">${cards}</div></div></section>`
  return `${html.slice(0, insertAt)}${section}${html.slice(insertAt)}`.replace('</head>', `${styles}</head>`)
}

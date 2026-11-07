import 'server-only'

import {sanityFetch} from './client'
import {articlesQuery} from './queries'
import type {ArticleCardData, ArticleCollection} from './types'

const pageSize = 12

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] || character)
}

function articleCard(article: ArticleCardData) {
  const image = article.featuredImage?.asset?.url
  const category = article.categories?.[0]?.title
  const date = article.originalPublishedAt
    ? new Intl.DateTimeFormat('en', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(article.originalPublishedAt))
    : ''
  return `<article class="sanity-journal-card">
    <a class="sanity-journal-image" href="/blogs/${encodeURIComponent(article.slug)}/">
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(article.featuredImage?.alt || '')}" loading="lazy" decoding="async">` : ''}
    </a>
    <div class="sanity-journal-copy">
      ${category ? `<p class="sanity-journal-category">${escapeHtml(category)}</p>` : ''}
      <h2><a href="/blogs/${encodeURIComponent(article.slug)}/">${escapeHtml(article.title)}</a></h2>
      ${article.excerpt ? `<p>${escapeHtml(article.excerpt)}</p>` : ''}
      ${date || article.readingTimeMinutes ? `<p class="sanity-journal-meta">${escapeHtml(date)}${date && article.readingTimeMinutes ? ' · ' : ''}${article.readingTimeMinutes ? `${article.readingTimeMinutes} min read` : ''}</p>` : ''}
    </div>
  </article>`
}

const styles = `<style id="sanity-journal-styles">
  .elementor-element-69b8a87{background:#f5f2ee;padding:80px 28px 100px}
  .elementor-element-69b8a87>.e-con-inner{max-width:1240px!important}
  .sanity-journal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:55px 30px;width:100%}
  .sanity-journal-card{background:#fff;min-width:0}
  .sanity-journal-image{display:block;aspect-ratio:4/3;overflow:hidden;background:#e7e1d9}
  .sanity-journal-image img{width:100%;height:100%;object-fit:cover;transition:transform .65s ease}
  .sanity-journal-card:hover .sanity-journal-image img{transform:scale(1.035)}
  .sanity-journal-copy{padding:24px 24px 28px;color:#666}
  .sanity-journal-category,.sanity-journal-meta{margin:0;color:#b78654;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
  .sanity-journal-copy h2{margin:9px 0 12px;color:#53545c;font-family:var(--e-global-typography-primary-font-family),serif;font-size:28px;font-weight:400;line-height:1.15}
  .sanity-journal-copy h2 a{color:inherit}
  .sanity-journal-copy>p:not(.sanity-journal-category):not(.sanity-journal-meta){font-size:14px;line-height:1.65}
  .sanity-journal-meta{border-top:1px solid #ded8d1;padding-top:14px!important;color:#85817d!important}
  .sanity-journal-empty{width:100%;padding:55px 25px;text-align:center;background:#fff;color:#666}
  .sanity-journal-empty h2{font-family:var(--e-global-typography-primary-font-family),serif;font-size:34px;font-weight:400;color:#53545c}
  .sanity-journal-pagination{display:flex;justify-content:center;gap:12px;width:100%;margin-top:45px}
  .sanity-journal-pagination a{border:1px solid #596c52;padding:10px 18px;color:#596c52;font-size:12px;text-transform:uppercase}
  @media(max-width:900px){.sanity-journal-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:600px){
    .elementor-37072 .elementor-element.elementor-element-68f9fb2 .elementor-heading-title{max-width:100%;font-size:54px!important;line-height:1!important;white-space:normal!important}
    .elementor-element-69b8a87{padding:50px 16px 65px}
    .sanity-journal-grid{grid-template-columns:1fr}
    .sanity-journal-copy h2{font-size:25px}
    .sanity-journal-empty{padding-inline:18px}
    .sanity-journal-empty h2{font-size:28px;line-height:1.15}
  }
</style>`

export async function renderLegacyBlogIndex(html: string, requestUrl: string) {
  const requestedPage = Number(new URL(requestUrl).searchParams.get('page'))
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const start = (page - 1) * pageSize
  const result = await sanityFetch<ArticleCollection>({
    query: articlesQuery(start, start + pageSize),
    tags: ['sanity', 'articles'],
  })
  const totalPages = Math.ceil(result.total / pageSize)
  const cards = result.articles.length
    ? `<div class="sanity-journal-grid">${result.articles.map(articleCard).join('')}</div>`
    : '<div class="sanity-journal-empty"><h2>Stories are coming soon</h2><p>Our safari journal is being prepared. Please check back shortly.</p></div>'
  const pagination = totalPages > 1
    ? `<nav class="sanity-journal-pagination" aria-label="Article pages">${page > 1 ? `<a href="${page === 2 ? '/blogs/' : `/blogs/?page=${page - 1}`}">Previous</a>` : ''}${page < totalPages ? `<a href="/blogs/?page=${page + 1}">Next</a>` : ''}</nav>`
    : ''
  const marker = '<div class="elementor-element elementor-element-69b8a87 e-flex e-con-boxed e-con e-parent"'
  const startIndex = html.indexOf(marker)
  if (startIndex < 0) return html
  const innerIndex = html.indexOf('<div class="e-con-inner">', startIndex)
  if (innerIndex < 0) return html
  const insertAt = innerIndex + '<div class="e-con-inner">'.length

  return `${html.slice(0, insertAt)}${cards}${pagination}${html.slice(insertAt)}`.replace('</head>', `${styles}</head>`)
}

import {writeFile} from 'node:fs/promises'
import path from 'node:path'
import {migrationRoot, pathExists, readJson, writeJson} from './lib.mjs'

const projectRoot = path.dirname(migrationRoot)
const reportsDirectory = path.join(migrationRoot, 'reports')
const plan = await readJson(path.join(migrationRoot, 'transformed', 'sanity-import-plan.json'))
const verification = await readJson(path.join(reportsDirectory, 'sanity-verification.json'))
const studioAuditFile = path.join(reportsDirectory, 'sanity-studio-audit.json')
const studioAudit = (await pathExists(studioAuditFile)) ? await readJson(studioAuditFile) : null
const markdownFile = path.join(projectRoot, 'ARTICLE-PUBLICATION-PREVIEW.md')
const htmlFile = path.join(reportsDirectory, 'article-publication-preview.html')
const jsonFile = path.join(reportsDirectory, 'article-publication-preview.json')

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character])
}

function markdownCell(value = '') {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>')
}

function mediaWarnings(flags = []) {
  const warnings = []
  const unresolvedInline = flags.filter((flag) => flag.startsWith('unresolved-inline-image:')).length
  if (flags.includes('missing-featured-image')) warnings.push('Missing featured image')
  const unresolvedFeatured = flags.find((flag) => flag.startsWith('unresolved-featured-image:'))
  if (unresolvedFeatured) warnings.push(`Featured image unresolved (WordPress attachment ${unresolvedFeatured.split(':')[1]})`)
  if (flags.includes('missing-featured-image-alt')) warnings.push('Featured image alt text missing')
  const missingInlineAlt = flags.filter((flag) => flag.startsWith('missing-inline-image-alt')).length
  if (unresolvedInline) warnings.push(`${unresolvedInline} unresolved inline image${unresolvedInline === 1 ? '' : 's'}`)
  if (missingInlineAlt) warnings.push(`${missingInlineAlt} inline image alt warning${missingInlineAlt === 1 ? '' : 's'}`)
  return warnings
}

const records = []
for (const item of plan.articles) {
  const document = item.document
  const featuredPath = document.featuredImage?.sourcePath
  const featuredAvailable = Boolean(featuredPath && (await pathExists(featuredPath)))
  const warnings = mediaWarnings(document.migration?.qualityFlags || [])
  records.push({
    wordpressId: document.migration.wordpressId,
    title: document.title,
    slug: document.slug.current,
    proposedPublicUrl: `https://asanjaafrica.com/blogs/${document.slug.current}/`,
    originalWordPressUrl: document.migration.wordpressUrl,
    status: 'Draft — not public',
    noIndex: document.seo?.noIndex === true,
    featuredImage: featuredAvailable ? featuredPath : null,
    featuredImageAlt: document.featuredImage?.alt || '',
    warnings,
    qualityFlags: document.migration?.qualityFlags || [],
  })
}

const summary = {
  generatedAt: new Date().toISOString(),
  projectId: studioAudit?.projectId || verification.projectId || 'mduy4p4u',
  dataset: studioAudit?.dataset || verification.dataset || 'production',
  totalArticles: records.length,
  drafts: studioAudit?.counts?.drafts ?? verification.counts.draftArticles,
  published: studioAudit?.counts?.published ?? verification.counts.publishedArticles,
  withFeaturedImage: records.filter((record) => record.featuredImage).length,
  missingOrUnresolvedFeaturedImage: records.filter((record) => !record.featuredImage).length,
  withMediaWarnings: records.filter((record) => record.warnings.length).length,
  approvalRequiredBeforePublishing: true,
}

await writeJson(jsonFile, {summary, articles: records})

const markdownRows = records.map((record) => {
  const image = record.featuredImage
    ? `[Open image](<${record.featuredImage}>)`
    : 'Missing / unresolved'
  const warnings = record.warnings.length ? record.warnings.join('; ') : 'None'
  return `| ${record.wordpressId} | ${markdownCell(record.title)} | [${record.slug}](${record.proposedPublicUrl}) | ${image} | ${record.status} | ${markdownCell(warnings)} |`
})

const markdown = `# Asanja Africa Article Publication Preview

Generated: ${summary.generatedAt}  
Sanity project: \`mduy4p4u\` / \`production\`

No article was published while generating this preview.

## Summary

| Measure | Count |
|---|---:|
| Articles awaiting approval | ${summary.totalArticles} |
| Verified drafts | ${summary.drafts} |
| Published articles | ${summary.published} |
| Featured images available | ${summary.withFeaturedImage} |
| Missing or unresolved featured images | ${summary.missingOrUnresolvedFeaturedImage} |
| Articles with at least one media warning | ${summary.withMediaWarnings} |

The proposed canonical route is \`/blogs/<slug>/\`. Original WordPress URLs remain stored for permanent redirects. Publishing is intentionally paused until the owner approves this preview.

## Articles

| WP ID | Article title | Proposed public URL | Featured image | Status | Missing media warnings |
|---:|---|---|---|---|---|
${markdownRows.join('\n')}
`

await writeFile(markdownFile, markdown)

const cards = records.map((record) => {
  const relativeImage = record.featuredImage
    ? path.relative(reportsDirectory, record.featuredImage).split(path.sep).map(encodeURIComponent).join('/')
    : ''
  const warnings = record.warnings.length
    ? `<ul>${record.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>`
    : '<p class="clear">No media warnings</p>'
  return `<article class="card" data-warning="${record.warnings.length ? 'yes' : 'no'}">
    <div class="media">${relativeImage ? `<img src="${relativeImage}" alt="${escapeHtml(record.featuredImageAlt)}" loading="lazy">` : '<span>Featured image unavailable</span>'}</div>
    <div class="copy">
      <p class="status">Draft · noIndex</p>
      <h2>${escapeHtml(record.title)}</h2>
      <p class="id">WordPress ID ${record.wordpressId}</p>
      <a href="${escapeHtml(record.proposedPublicUrl)}">${escapeHtml(record.proposedPublicUrl)}</a>
      <div class="warnings"><h3>Media review</h3>${warnings}</div>
    </div>
  </article>`
}).join('')

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Asanja Africa publication preview</title><style>
:root{--ink:#56565f;--green:#596c52;--sand:#b98b56;--cream:#f5f2ee;--line:#d4cec5}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Arial,sans-serif}.hero{padding:64px 24px;text-align:center}.hero h1{margin:0 0 14px;font:400 clamp(36px,6vw,72px)/1 Georgia,serif}.hero p{max-width:760px;margin:8px auto}.stats{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:25px}.stats span{padding:9px 13px;background:#fff;border:1px solid var(--line);font-size:13px}.toolbar{position:sticky;top:0;z-index:2;padding:14px 20px;background:rgba(245,242,238,.95);border-block:1px solid var(--line);text-align:center}.toolbar button{padding:9px 15px;border:1px solid var(--green);background:#fff;color:var(--green);cursor:pointer}.grid{width:min(1280px,calc(100% - 32px));margin:35px auto 70px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}.card{overflow:hidden;background:#fff}.media{display:grid;place-items:center;aspect-ratio:4/3;background:#e7e1d9;color:#7d7975;font-size:13px}.media img{width:100%;height:100%;object-fit:cover}.copy{padding:22px}.status{margin:0;color:var(--sand);font-size:11px;letter-spacing:.13em;text-transform:uppercase}.copy h2{margin:9px 0;font:400 26px/1.15 Georgia,serif;color:#2f382e}.id{font-size:12px}.copy>a{font-size:12px;color:var(--green);word-break:break-all}.warnings{margin-top:18px;padding-top:15px;border-top:1px solid var(--line)}.warnings h3{margin:0 0 7px;font-size:12px;text-transform:uppercase}.warnings ul{margin:0;padding-left:18px;color:#9c4e3b;font-size:13px}.clear{margin:0;color:var(--green);font-size:13px}.hidden{display:none}@media(max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.grid{grid-template-columns:1fr}.hero{padding:45px 18px}}
</style></head><body><header class="hero"><p>ASANJA AFRICA CMS</p><h1>Article publication preview</h1><p>Review titles, proposed public URLs, featured images and missing-media warnings. Nothing in this preview is published.</p><div class="stats"><span>${summary.totalArticles} drafts</span><span>${summary.withFeaturedImage} featured images available</span><span>${summary.missingOrUnresolvedFeaturedImage} featured images missing/unresolved</span><span>0 published</span></div></header><div class="toolbar"><button type="button" id="toggle">Show only media warnings</button></div><main class="grid">${cards}</main><script>const button=document.getElementById('toggle');let warningsOnly=false;button.addEventListener('click',()=>{warningsOnly=!warningsOnly;document.querySelectorAll('.card').forEach(card=>card.classList.toggle('hidden',warningsOnly&&card.dataset.warning==='no'));button.textContent=warningsOnly?'Show all articles':'Show only media warnings'});</script></body></html>`

await writeFile(htmlFile, html)
console.log(JSON.stringify({summary, markdownFile, htmlFile, jsonFile}, null, 2))

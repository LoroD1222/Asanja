import {readdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {parse} from 'csv-parse/sync'
import {migrationRoot, readJson, writeJson} from './lib.mjs'

const projectRoot = path.dirname(migrationRoot)
const reportsDirectory = path.join(migrationRoot, 'reports')
const plan = await readJson(path.join(migrationRoot, 'transformed', 'sanity-import-plan.json'))
const redirectRows = parse(
  await readFile(path.join(projectRoot, 'wordpress-url-redirect-map.csv'), 'utf8'),
  {columns: true, skip_empty_lines: true},
)

const internalHosts = new Set([
  'asanjaafrica.com',
  'www.asanjaafrica.com',
  'blog.asanjaafrica.com',
  'demo.asanjaafrica.com',
])

function normalizePathname(value) {
  const pathname = value.replace(/\/+/g, '/').replace(/\/index\.html$/, '/')
  return pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`
}

function routeKey(url) {
  const pathname = normalizePathname(url.pathname)
  const query = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return query ? `${pathname}?${query}` : pathname
}

function parseHref(href) {
  if (!href || /^(#|mailto:|tel:|sms:|javascript:)/i.test(href)) return null
  try {
    const url = new URL(href, 'https://asanjaafrica.com/')
    return {url, internal: internalHosts.has(url.hostname.toLowerCase())}
  } catch {
    return {invalid: true}
  }
}

async function collectLegacyRoutes(directory, relative = '') {
  const routes = []
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const childRelative = path.join(relative, entry.name)
    const childPath = path.join(directory, entry.name)
    if (entry.isDirectory()) routes.push(...(await collectLegacyRoutes(childPath, childRelative)))
    if (entry.isFile() && entry.name === 'index.html') {
      const routeDirectory = path.dirname(childRelative)
      routes.push(normalizePathname(`/${routeDirectory === '.' ? '' : routeDirectory}`))
    }
  }
  return routes
}

function collectLinks(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectLinks(item, output)
    return output
  }
  if (!value || typeof value !== 'object') return output
  for (const [key, nested] of Object.entries(value)) {
    if ((key === 'href' || key === 'linkHref') && typeof nested === 'string' && nested.trim()) {
      output.push(nested.trim())
    } else {
      collectLinks(nested, output)
    }
  }
  return output
}

const knownRoutes = new Set(await collectLegacyRoutes(path.join(projectRoot, 'public', 'legacy')))
for (const row of redirectRows) {
  if (row.source) {
    const parsed = new URL(row.source, 'https://asanjaafrica.com/')
    knownRoutes.add(routeKey(parsed))
  }
  if (row.target) knownRoutes.add(routeKey(new URL(row.target, 'https://asanjaafrica.com/')))
}

for (const item of plan.articles) {
  const document = item.document
  knownRoutes.add(normalizePathname(`/blogs/${document.slug.current}`))
  knownRoutes.add(normalizePathname(`/blog/${document.slug.current}`))
  if (document.migration?.wordpressUrl) {
    knownRoutes.add(routeKey(new URL(document.migration.wordpressUrl)))
  }
  if (document.migration?.wordpressId) knownRoutes.add(`/?p=${document.migration.wordpressId}`)
}

const occurrences = []
for (const item of plan.articles) {
  const document = item.document
  for (const href of collectLinks(document.body)) {
    const parsed = parseHref(href)
    const base = {
      wordpressId: document.migration.wordpressId,
      articleTitle: document.title,
      articleSlug: document.slug.current,
      href,
    }
    if (!parsed) continue
    if (parsed.invalid) {
      occurrences.push({...base, state: 'invalid-url'})
      continue
    }
    if (!parsed.internal) {
      occurrences.push({...base, state: 'external'})
      continue
    }

    const key = routeKey(parsed.url)
    const isMedia = parsed.url.pathname.includes('/wp-content/')
    occurrences.push({
      ...base,
      state: isMedia ? 'legacy-media-link' : knownRoutes.has(key) ? 'resolved-internal' : 'unmapped-internal',
      normalizedRoute: key,
    })
  }
}

const group = (state) => occurrences.filter((item) => item.state === state)
const unmapped = group('unmapped-internal')
const invalid = group('invalid-url')
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    linkOccurrences: occurrences.length,
    resolvedInternalOccurrences: group('resolved-internal').length,
    externalOccurrences: group('external').length,
    legacyMediaLinkOccurrences: group('legacy-media-link').length,
    unmappedInternalOccurrences: unmapped.length,
    invalidUrlOccurrences: invalid.length,
    affectedArticles: new Set([...unmapped, ...invalid].map((item) => item.wordpressId)).size,
  },
  unmappedInternal: unmapped,
  invalidUrls: invalid,
}

const jsonFile = path.join(reportsDirectory, 'article-link-audit.json')
const markdownFile = path.join(projectRoot, 'ARTICLE-LINK-AUDIT.md')
await writeJson(jsonFile, report)

const rows = [...unmapped, ...invalid].map((item) =>
  `| ${item.wordpressId} | ${String(item.articleTitle).replaceAll('|', '\\|')} | ${item.state} | ${String(item.href).replaceAll('|', '\\|')} |`,
)
const markdown = `# Asanja Africa Article Link Audit

Generated: ${report.generatedAt}

## Summary

| Measure | Count |
|---|---:|
| Link occurrences checked | ${report.summary.linkOccurrences} |
| Resolved internal links | ${report.summary.resolvedInternalOccurrences} |
| External links preserved | ${report.summary.externalOccurrences} |
| Legacy media links | ${report.summary.legacyMediaLinkOccurrences} |
| Unmapped internal links | ${report.summary.unmappedInternalOccurrences} |
| Invalid URL values | ${report.summary.invalidUrlOccurrences} |
| Articles requiring link review | ${report.summary.affectedArticles} |

Internal links are considered resolved when they match an existing legacy page, a configured redirect, an imported article's original WordPress URL, or the proposed \`/blogs/<slug>/\` route. External destinations were syntax-checked but were not modified.

## Links requiring review

| WP ID | Article | State | Link |
|---:|---|---|---|
${rows.length ? rows.join('\n') : '| — | None | — | — |'}
`

await writeFile(markdownFile, markdown)
console.log(JSON.stringify({...report.summary, markdownFile, jsonFile}, null, 2))

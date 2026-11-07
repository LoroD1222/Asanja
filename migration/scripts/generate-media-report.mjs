import path from 'node:path'
import {migrationRoot, readJson, writeText} from './lib.mjs'

const report = await readJson(path.join(migrationRoot, 'reports', 'media-recovery.json'))
const outputFile = path.resolve(migrationRoot, '..', 'media-recovery-report.md')
const escape = (value) => String(value || '—').replaceAll('|', '\\|').replaceAll('\n', ' ')
const shortPath = (value) => value ? path.relative(path.resolve(migrationRoot, '..'), value) : '—'
const grouped = new Map()
for (const occurrence of report.occurrences || []) {
  const key = occurrence.sourceUrl || '__missing_source_url__'
  if (!grouped.has(key)) grouped.set(key, {sourceUrl: occurrence.sourceUrl, occurrences: [], resolution: occurrence.resolution})
  grouped.get(key).occurrences.push(occurrence)
}

const recoveredRows = (report.recoveries || []).map((item) => {
  const affected = (grouped.get(item.sourceUrl)?.occurrences || []).map((entry) => `${entry.title} (WP ${entry.wordpressId})`).join('; ')
  return `| ${escape(affected)} | ${escape(item.sourceUrl)} | ${escape(item.method)} | ${escape(item.recoveredFrom)} | \`${escape(shortPath(item.sourcePath))}\` |`
}).join('\n')

const unresolvedRows = [...grouped.values()]
  .filter((item) => item.occurrences.some((entry) => entry.status !== 'recovered'))
  .map((item) => {
    const affected = item.occurrences.map((entry) => `${entry.title} (WP ${entry.wordpressId}, ${entry.kind})`).join('; ')
    const proposed = item.sourceUrl
      ? 'Keep the source reference unresolved; owner may provide the exact original file or an older verified WordPress backup. Do not substitute.'
      : 'Recover WordPress attachment ID 52 for “Fly Camping Serengeti” from an older database/media backup or supply the verified original.'
    return `| ${escape(affected)} | ${escape(item.sourceUrl || '(source URL absent)')} | ${escape(proposed)} |`
  })
  .join('\n')

const markdown = `# Asanja Africa Media Recovery Report

Generated: ${report.generatedAt}  
Scope: unresolved media from the 169 WordPress draft article plans  
Method: exact local-path matching, exact source downloads, and exact Internet Archive captures only

No visually similar or unrelated images were substituted.

## Summary

| Measure | Count |
|---|---:|
| Unresolved media occurrences before recovery | ${report.counts.unresolvedOccurrencesBeforeRecovery} |
| Unique source URLs investigated | ${report.counts.uniqueSourceUrls} |
| Unique images recovered | ${report.counts.recoveredUniqueImages} |
| Recovered occurrences | ${report.counts.recoveredOccurrences} |
| Unique image URLs still unresolved | ${report.counts.unresolvedUniqueUrls} |
| Unresolved occurrences, including the missing featured source | ${report.counts.unresolvedOccurrences} |
| Occurrences with no source URL | ${report.counts.missingSourceUrlOccurrences} |

The unresolved occurrence total is 76: 75 inline image occurrences across 31 articles and one featured image occurrence. The featured-image issue is WordPress post 172, “Fly Camping Serengeti”: its \`_thumbnail_id\` is 52, but attachment 52 is absent from the restored database and the export provides no featured-image URL.

## Images successfully recovered

| Article(s) | Original image URL | Recovery method | Verified recovery source | Local recovered file |
|---|---|---|---|---|
${recoveredRows || '| — | — | — | — | — |'}

Every recovered file passed an image signature check and is addressed by SHA-256 in \`wordpress-source/uploads/sanity-recovered/\`. The transform step maps only the exact original source URL to that recovered binary.

## Images still missing

| Article(s) affected | Original image URL | Proposed resolution |
|---|---|---|
${unresolvedRows || '| — | — | — |'}

## Recovery evidence and limits

- The current WordPress upload tree, extracted WPress archive, legacy public assets, project media, and additional local archives were searched.
- Exact unresolved basenames were not present in the available local backups.
- Archive lookups were grouped by the original WordPress upload directories and accepted only exact URL captures or the verified original for a known resized/thumbnail URL.
- Missing media is retained as a visible migration quality flag. Article text and structure are not discarded because an image is unavailable.
`

await writeText(outputFile, markdown)
console.log(JSON.stringify({outputFile, recovered: report.counts.recoveredUniqueImages, unresolved: report.counts.unresolvedUniqueUrls}, null, 2))

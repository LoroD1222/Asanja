import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {parse} from 'csv-parse/sync'
import {migrationRoot, writeText} from './lib.mjs'

const repositoryRoot = path.resolve(migrationRoot, '..')
const inventoryFile = path.join(repositoryRoot, 'wordpress-to-nextjs-route-mapping.csv')
const outputFile = path.join(repositoryRoot, 'wordpress-url-redirect-map.csv')

const postIdRedirects = new Map([
  ['31', '/about/'],
  ['33', '/contact/'],
  ['414', '/privacy-policy/'],
  ['433', '/contact/thank-you/'],
  ['1074', '/camps-and-lodges/'],
  ['1076', '/safaris/'],
  ['1078', '/make-a-booking/'],
  ['1757', '/asanja-moru/'],
  ['2601', '/asanja-sri-bustani/'],
  ['2627', '/asanja-nyasirori/'],
  ['2671', '/asanja-ruaha/'],
  ['2692', '/asanja-under-the-stars/'],
  ['2745', '/experiences/'],
  ['2747', '/faqs/'],
  ['2749', '/plan-my-stay/'],
  ['3057', '/asanja-reviews/'],
  ['37072', '/blogs/'],
  ['37383', '/terms/'],
])

const safariLegacyPaths = [
  'tanzania-safaris',
  'tanzania-safaris/tanzania-southern-circuit-safaris',
  'tanzania-safaris/honeymoon-safari-tanzania',
  'tanzania-safaris/asanja-7-nights-8-days-serengeti-safari',
  'tanzania-safaris/asanja-8-nights-9-days-serengeti-safari',
  'tanzania-safaris/asanja-6-nights-7-days-serengeti-safari',
  'tanzania-safaris/asanja-4-nights-5-days-serengeti-safari',
  'tanzania-safaris/serengeti-national-park-safaris',
  'tanzania-safaris/asanja-7-nights-8-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/3-nights-4-days-serengeti-safari-moru',
  'tanzania-safaris/asanja-3-nights-4-days-serengeti-safari-grumeti',
  'tanzania-safaris/asanja-5-nights-6-days-serengeti-safari',
  'tanzania-safaris/asanja-6-nights-7-days-ruaha-national-park-safari',
  'tanzania-safaris/asanja-5-nights-6-days-ruaha-national-park-safari',
  'tanzania-safaris/asanja-6-nights-7-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/asanja-5-nights-6-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/asanja-4-nights-5-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/asanja-9-nights-10-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/tanzania-northern-circuit-safaris',
]

const exactPaths = [
  ...safariLegacyPaths.map((source) => [source, '/safaris/']),
  ['my-account', '/'],
  ['checkout', '/'],
  ['video-gallery', '/'],
  ['contact-us', '/contact/'],
  ['flights', '/plan-my-stay/'],
  ['asanja-camps/asanja-nyasirori-camp', '/asanja-nyasirori/'],
  ['asanja-camps/asanja-moru-camp', '/asanja-moru/'],
  ['asanja-camps/asanja-ruaha-lodge', '/asanja-ruaha/'],
  ['asanja-camps/asanja-grumeti-camp', '/asanja-sri-bustani/'],
  ['asanja-camps', '/camps-and-lodges/'],
]

const inventory = parse(await readFile(inventoryFile, 'utf8'), {
  columns: true,
  skip_empty_lines: true,
  bom: true,
})

const rows = []
for (const [sourceId, target] of postIdRedirects) {
  rows.push({
    source: `/?p=${sourceId}`,
    target,
    statusCode: '301',
    state: 'implemented-and-verified',
    sourceRecord: `WordPress ID ${sourceId}`,
    notes: 'Handled by the Next.js legacy query redirect map.',
  })
}
for (const [source, target] of exactPaths) {
  rows.push({
    source: `/${source}/`,
    target,
    statusCode: '301',
    state: 'implemented-and-verified',
    sourceRecord: 'Rank Math exact redirect',
    notes: 'Verified against the isolated production build.',
  })
}
for (const record of inventory.filter((item) => item.source_type === 'post')) {
  const isDraft = record.source_status === 'draft'
  rows.push({
    source: record.source_url || `WordPress ID ${record.source_id}`,
    target: '',
    statusCode: '',
    state: isDraft ? 'pending-owner-url-policy-unpublished' : record.migration_status,
    sourceRecord: `WordPress ${record.source_status} post ${record.source_id}`,
    notes: isDraft
      ? 'No public redirect or route is created while this article remains a draft.'
      : record.notes || 'No redirect created.',
  })
}

function csv(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const headers = ['source', 'target', 'status_code', 'state', 'source_record', 'notes']
const lines = [
  headers.join(','),
  ...rows.map((row) =>
    [row.source, row.target, row.statusCode, row.state, row.sourceRecord, row.notes].map(csv).join(','),
  ),
]
await writeText(outputFile, lines.join('\n'))

console.log(
  JSON.stringify(
    {
      outputFile,
      implementedQueryRedirects: postIdRedirects.size,
      implementedExactRedirects: exactPaths.length,
      unresolvedPostRecords: rows.length - postIdRedirects.size - exactPaths.length,
      totalRows: rows.length,
    },
    null,
    2,
  ),
)

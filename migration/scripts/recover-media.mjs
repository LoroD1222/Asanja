import {execFile} from 'node:child_process'
import {createHash, randomUUID} from 'node:crypto'
import {access, mkdir, readFile, unlink, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {promisify} from 'node:util'
import {migrationRoot, readJson, writeJson} from './lib.mjs'

const execFileAsync = promisify(execFile)

const planFile = path.join(migrationRoot, 'transformed', 'sanity-import-plan.json')
const reportFile = path.join(migrationRoot, 'reports', 'media-recovery.json')
const recoveryRoot = path.resolve(migrationRoot, '..', 'wordpress-source', 'uploads', 'sanity-recovered')
const plan = await readJson(planFile)

function unresolvedRequests() {
  const requests = []
  for (const item of plan.articles) {
    const article = item.document
    const base = {wordpressId: article.migration.wordpressId, title: article.title}
    if (article.featuredImage && !article.featuredImage.sourcePath) {
      requests.push({
        ...base,
        kind: 'featured',
        sourceUrl: article.featuredImage.sourceUrl || '',
        wordpressAttachmentId: article.featuredImage.wordpressAttachmentId,
      })
    }
    for (const block of article.body || []) {
      if (block._type === 'articleImage' && !block.sourcePath) {
        requests.push({
          ...base,
          kind: 'inline',
          sourceUrl: block.sourceUrl || '',
          wordpressAttachmentId: block.wordpressAttachmentId,
        })
      }
    }
  }
  return requests
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function imageFormat(buffer, contentType = '') {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return {extension: 'jpg', mimeType: 'image/jpeg'}
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return {extension: 'png', mimeType: 'image/png'}
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return {extension: 'webp', mimeType: 'image/webp'}
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString())) return {extension: 'gif', mimeType: 'image/gif'}
  if (buffer.length >= 12 && buffer.subarray(4, 12).toString().startsWith('ftyp')) return {extension: 'avif', mimeType: 'image/avif'}
  if (contentType.toLowerCase().includes('svg') && buffer.subarray(0, 1024).toString('utf8').includes('<svg')) return {extension: 'svg', mimeType: 'image/svg+xml'}
  return undefined
}

async function fetchImage(url, timeoutMs = 30000) {
  const temporaryFile = path.join('/tmp', `asanja-media-${randomUUID()}`)
  try {
    const {stdout} = await execFileAsync(
      'curl',
      [
        '--location',
        '--silent',
        '--show-error',
        '--max-time',
        String(Math.ceil(timeoutMs / 1000)),
        '--user-agent',
        'Asanja-Sanity-Migration/1.0 (+https://asanjaafrica.com)',
        '--output',
        temporaryFile,
        '--write-out',
        '%{http_code}\n%{content_type}\n%{url_effective}',
        url,
      ],
      {encoding: 'utf8', maxBuffer: 1024 * 1024},
    )
    const [statusText, contentType = '', finalUrl = url] = stdout.split('\n')
    const status = Number(statusText)
    if (status < 200 || status >= 300) return {ok: false, status, finalUrl}
    const buffer = await readFile(temporaryFile)
    if (buffer.length > 25 * 1024 * 1024) return {ok: false, status, reason: 'image-over-25mb', finalUrl}
    const format = imageFormat(buffer, contentType)
    if (!format) return {ok: false, status, reason: 'response-was-not-a-supported-image', finalUrl}
    return {ok: true, status, finalUrl, buffer, ...format}
  } catch (error) {
    return {ok: false, reason: String(error.message || error).includes('timed out') ? 'request-timeout' : String(error.message || error)}
  } finally {
    await unlink(temporaryFile).catch(() => {})
  }
}

function wordpressOriginalUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl)
    const original = url.pathname.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '')
    if (original === url.pathname) return undefined
    url.pathname = original
    return url.toString()
  } catch {
    return undefined
  }
}

function wikimediaOriginalUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl)
    if (url.hostname !== 'upload.wikimedia.org') return undefined
    const match = url.pathname.match(/^\/wikipedia\/commons\/thumb\/([^/]+\/[^/]+)\/([^/]+)\/[^/]+$/)
    return match ? `https://upload.wikimedia.org/wikipedia/commons/${match[1]}/${match[2]}` : undefined
  } catch {
    return undefined
  }
}

function isLegacyAsanjaHost(sourceUrl) {
  try {
    return ['blog.asanjaafrica.com', 'demo.asanjaafrica.com'].includes(new URL(sourceUrl).hostname)
  } catch {
    return false
  }
}

function archiveDirectoryKey(sourceUrl) {
  try {
    const url = new URL(sourceUrl)
    if (!isLegacyAsanjaHost(sourceUrl)) return undefined
    const directory = url.pathname.slice(0, url.pathname.lastIndexOf('/') + 1)
    return `${url.hostname}${directory}`
  } catch {
    return undefined
  }
}

async function cdxDirectory(directory) {
  try {
    const {stdout} = await execFileAsync(
      'curl',
      [
        '--silent',
        '--show-error',
        '--max-time',
        '45',
        '--get',
        'https://web.archive.org/cdx/search/cdx',
        '--data-urlencode',
        `url=${directory}*`,
        '--data-urlencode',
        'output=json',
        '--data-urlencode',
        'filter=statuscode:200',
        '--data-urlencode',
        'filter=mimetype:image/.*',
        '--data-urlencode',
        'fl=timestamp,original,statuscode,mimetype,digest',
        '--data-urlencode',
        'collapse=urlkey',
        '--data-urlencode',
        'limit=5000',
      ],
      {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024},
    )
    const rows = JSON.parse(stdout)
    if (!Array.isArray(rows) || rows.length < 2) return []
    const [header, ...values] = rows
    return values.map((row) => Object.fromEntries(header.map((name, index) => [name, row[index]])))
  } catch {
    return []
  }
}

function comparablePath(sourceUrl) {
  try {
    return decodeURIComponent(new URL(sourceUrl).pathname).toLowerCase()
  } catch {
    return ''
  }
}

const requests = unresolvedRequests()
const requestUrls = [...new Set(requests.map((item) => item.sourceUrl).filter(Boolean))]
const archiveDirectories = [...new Set(requestUrls.map(archiveDirectoryKey).filter(Boolean))]
const archiveRows = []

for (let index = 0; index < archiveDirectories.length; index += 3) {
  const batch = archiveDirectories.slice(index, index + 3)
  const results = await Promise.all(batch.map(cdxDirectory))
  archiveRows.push(...results.flat())
}

const archiveByPath = new Map()
for (const row of archiveRows) {
  const pathname = comparablePath(row.original)
  if (pathname && !archiveByPath.has(pathname)) archiveByPath.set(pathname, row)
}

await mkdir(recoveryRoot, {recursive: true})
const recoveries = []
const unresolved = []

for (const sourceUrl of requestUrls) {
  const candidates = []
  const sourcePathname = comparablePath(sourceUrl)
  const exactArchive = archiveByPath.get(sourcePathname)
  if (exactArchive) {
    candidates.push({
      url: `https://web.archive.org/web/${exactArchive.timestamp}id_/${exactArchive.original}`,
      method: 'internet-archive-exact-url',
      archiveTimestamp: exactArchive.timestamp,
      archivedOriginalUrl: exactArchive.original,
    })
  }

  const wordpressOriginal = wordpressOriginalUrl(sourceUrl)
  const originalArchive = wordpressOriginal ? archiveByPath.get(comparablePath(wordpressOriginal)) : undefined
  if (originalArchive) {
    candidates.push({
      url: `https://web.archive.org/web/${originalArchive.timestamp}id_/${originalArchive.original}`,
      method: 'internet-archive-wordpress-original-for-resized-url',
      archiveTimestamp: originalArchive.timestamp,
      archivedOriginalUrl: originalArchive.original,
    })
  }

  const wikimediaOriginal = wikimediaOriginalUrl(sourceUrl)
  if (wikimediaOriginal) candidates.push({url: wikimediaOriginal, method: 'wikimedia-original-for-thumbnail-url'})
  if (!isLegacyAsanjaHost(sourceUrl)) candidates.push({url: sourceUrl, method: 'exact-live-source-url'})

  let recovered
  const attempts = []
  for (const candidate of candidates) {
    const result = await fetchImage(candidate.url)
    attempts.push({url: candidate.url, method: candidate.method, status: result.status, reason: result.reason})
    if (!result.ok) continue
    const digest = sha256(result.buffer)
    const filePath = path.join(recoveryRoot, `${digest}.${result.extension}`)
    await access(filePath).catch(() => writeFile(filePath, result.buffer))
    recovered = {
      sourceUrl,
      sourcePath: filePath,
      method: candidate.method,
      recoveredFrom: candidate.url,
      archiveTimestamp: candidate.archiveTimestamp,
      archivedOriginalUrl: candidate.archivedOriginalUrl,
      finalUrl: result.finalUrl,
      sha256: digest,
      mimeType: result.mimeType,
      bytes: result.buffer.length,
    }
    recoveries.push(recovered)
    break
  }

  if (!recovered) {
    unresolved.push({
      sourceUrl,
      reason: isLegacyAsanjaHost(sourceUrl)
        ? 'Not present in local backups and no exact image snapshot was found in the queried archive index.'
        : 'The exact source and verified source-specific fallback did not return a supported image.',
      attempts,
    })
  }
}

const emptySourceRequests = requests.filter((item) => !item.sourceUrl)
const recoveryByUrl = new Map(recoveries.map((item) => [item.sourceUrl, item]))
const occurrences = requests.map((item) => ({
  ...item,
  ...(item.sourceUrl ? recoveryByUrl.get(item.sourceUrl) : undefined),
  status: item.sourceUrl && recoveryByUrl.has(item.sourceUrl) ? 'recovered' : 'unresolved',
  resolution: item.sourceUrl
    ? recoveryByUrl.has(item.sourceUrl)
      ? 'Use recovered original image file during the Sanity asset upload pass.'
      : 'Keep the article content and record a migration note until the exact original image is supplied.'
    : 'Attachment metadata is missing. Owner must identify or supply the original featured image; do not infer it from inline images.',
}))

await writeJson(reportFile, {
  generatedAt: new Date().toISOString(),
  sourcePlan: planFile,
  recoveryRoot,
  counts: {
    unresolvedOccurrencesBeforeRecovery: requests.length,
    uniqueSourceUrls: requestUrls.length,
    recoveredUniqueImages: recoveries.length,
    recoveredOccurrences: occurrences.filter((item) => item.status === 'recovered').length,
    unresolvedUniqueUrls: unresolved.length,
    unresolvedOccurrences: occurrences.filter((item) => item.status === 'unresolved').length,
    missingSourceUrlOccurrences: emptySourceRequests.length,
    archiveDirectoriesQueried: archiveDirectories.length,
  },
  recoveries,
  unresolved,
  occurrences,
})

console.log(JSON.stringify({reportFile, ...((await readJson(reportFile)).counts)}, null, 2))

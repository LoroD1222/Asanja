import {createHash} from 'node:crypto'
import path from 'node:path'
import {htmlToBlocks} from '@portabletext/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'
import {
  decodeHtmlEntities,
  migrationRoot,
  mysqlDateToIso,
  readJson,
  slugify,
  stableKey,
  writeJson,
} from './lib.mjs'

const inputFile = path.join(migrationRoot, 'extracted', 'wordpress.json')
const outputFile = path.join(migrationRoot, 'transformed', 'sanity-import-plan.json')
const snapshot = await readJson(inputFile)
const mediaRecoveryFile = path.join(migrationRoot, 'reports', 'media-recovery.json')
const mediaRecovery = await readJson(mediaRecoveryFile).catch(() => ({recoveries: []}))
const recoveredBySourceUrl = new Map(
  (mediaRecovery.recoveries || []).map((item) => [item.sourceUrl, item]),
)

const migrationSchema = Schema.compile({
  name: 'wordpressMigration',
  types: [
    {
      name: 'blockContent',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Paragraph', value: 'normal'},
            {title: 'Heading 2', value: 'h2'},
            {title: 'Heading 3', value: 'h3'},
            {title: 'Heading 4', value: 'h4'},
            {title: 'Heading 5', value: 'h5'},
            {title: 'Heading 6', value: 'h6'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                fields: [
                  {name: 'href', type: 'string'},
                  {name: 'blank', type: 'boolean'},
                ],
              },
            ],
          },
        },
        {type: 'articleImage'},
        {type: 'articleTable'},
        {type: 'legacyShortcode'},
        {type: 'migrationNote'},
      ],
    },
    {
      name: 'articleImage',
      type: 'object',
      fields: [
        {name: 'sourceUrl', type: 'string'},
        {name: 'sourcePath', type: 'string'},
        {name: 'alt', type: 'string'},
        {name: 'caption', type: 'string'},
        {name: 'credit', type: 'string'},
        {name: 'linkHref', type: 'string'},
        {name: 'wordpressAttachmentId', type: 'number'},
      ],
    },
    {
      name: 'articleTable',
      type: 'object',
      fields: [
        {name: 'caption', type: 'string'},
        {name: 'hasHeaderRow', type: 'boolean'},
        {name: 'rows', type: 'array', of: [{type: 'tableRow'}]},
      ],
    },
    {name: 'tableRow', type: 'object', fields: [{name: 'cells', type: 'array', of: [{type: 'string'}]}]},
    {
      name: 'legacyShortcode',
      type: 'object',
      fields: [
        {name: 'name', type: 'string'},
        {name: 'raw', type: 'text'},
        {name: 'note', type: 'string'},
      ],
    },
    {
      name: 'migrationNote',
      type: 'object',
      fields: [
        {name: 'reason', type: 'string'},
        {name: 'sourceHtml', type: 'text'},
      ],
    },
  ],
})
const blockContentType = migrationSchema.get('blockContent')

const postMeta = new Map()
for (const row of snapshot.postMeta) {
  const id = Number(row.postId)
  if (!postMeta.has(id)) postMeta.set(id, new Map())
  postMeta.get(id).set(row.key, row.value)
}

const relationships = new Map()
for (const row of snapshot.relationships) {
  const id = Number(row.postId)
  if (!relationships.has(id)) relationships.set(id, {category: [], post_tag: []})
  relationships.get(id)[row.taxonomy].push(Number(row.termId))
}

const attachmentById = new Map(snapshot.attachments.map((item) => [Number(item.id), item]))
const exportById = new Map(snapshot.exportRecords.map((item) => [Number(item.id), item]))
const fileByRelativePath = new Map(
  snapshot.uploadFiles.map((file) => [String(file.relativePath).replace(/^\/+/, '').toLowerCase(), file]),
)
const fileByBasename = new Map()
for (const file of snapshot.uploadFiles) {
  const basename = path.posix.basename(file.relativePath).toLowerCase()
  if (!fileByBasename.has(basename)) fileByBasename.set(basename, [])
  fileByBasename.get(basename).push(file)
}

function uploadRelativePath(sourceUrl) {
  if (!sourceUrl) return undefined
  try {
    const parsed = new URL(sourceUrl, snapshot.source.options.home || 'https://asanjaafrica.com')
    const marker = '/wp-content/uploads/'
    const index = parsed.pathname.toLowerCase().indexOf(marker)
    return index >= 0 ? decodeURIComponent(parsed.pathname.slice(index + marker.length)) : undefined
  } catch {
    const normalized = String(sourceUrl).replace(/\\/g, '/')
    const marker = '/wp-content/uploads/'
    const index = normalized.toLowerCase().indexOf(marker)
    return index >= 0 ? normalized.slice(index + marker.length) : undefined
  }
}

function resolveUpload(sourceUrl, attachment) {
  const recovered = recoveredBySourceUrl.get(sourceUrl)
  if (recovered?.sourcePath) {
    return {
      absolutePath: recovered.sourcePath,
      relativePath: path.relative(snapshot.source.uploadsDir, recovered.sourcePath).split(path.sep).join('/'),
      bytes: recovered.bytes,
      recoveredBy: recovered.method,
    }
  }

  const candidates = [attachment?.attachedFile, uploadRelativePath(sourceUrl)].filter(Boolean)
  for (const candidate of candidates) {
    const normalized = String(candidate).replace(/^\/+/, '').toLowerCase()
    const direct = fileByRelativePath.get(normalized)
    if (direct) return direct
  }

  const basename = candidates.map((value) => path.posix.basename(value).toLowerCase()).find(Boolean)
  const matches = basename ? fileByBasename.get(basename) || [] : []
  return matches.length === 1 ? matches[0] : undefined
}

function findAttachmentForImage(element, sourceUrl) {
  const className = element.getAttribute('class') || ''
  const match = className.match(/wp-image-(\d+)/)
  if (match) return attachmentById.get(Number(match[1]))

  const relative = uploadRelativePath(sourceUrl)?.toLowerCase()
  if (!relative) return undefined
  return snapshot.attachments.find(
    (attachment) => String(attachment.attachedFile || '').toLowerCase() === relative,
  )
}

const preservedShortcodeNames = new Set(['embed', 'video', 'caption', 'contact-form-7', 'button_gradient'])
const inlineHtmlTags = new Set(['a', 'b', 'code', 'del', 'em', 'i', 'ins', 'mark', 's', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'u'])

function replaceShortcodes(html) {
  return String(html || '').replace(/\[(\/?)([a-zA-Z][\w-]*)([^\]]*)\]/g, (raw, closing, name) => {
    if (!preservedShortcodeNames.has(name) && !name.startsWith('vc_') && !name.startsWith('dfd_')) return raw
    const payload = Buffer.from(raw, 'utf8').toString('base64')
    return `<wp-shortcode data-name="${closing ? `/${name}` : name}" data-raw="${payload}"></wp-shortcode>`
  })
}

function parseHtmlPreservingInlineWhitespace(html) {
  const dom = new JSDOM(html)
  const document = dom.window.document
  const walker = document.createTreeWalker(document.body, dom.window.NodeFilter.SHOW_TEXT)
  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)
  const isInlineElement = (node) => node?.nodeType === 1 && inlineHtmlTags.has(node.tagName.toLowerCase())
  for (const node of textNodes) {
    if (/\s$/.test(node.data) && isInlineElement(node.nextSibling)) node.data = node.data.replace(/\s+$/, '\u00a0')
    if (/^\s/.test(node.data) && isInlineElement(node.previousSibling)) node.data = node.data.replace(/^\s+/, '\u00a0')
  }
  return document
}

function deterministicKeys(value, seed) {
  if (!Array.isArray(value)) return value
  return value.map((item, index) => {
    const next = {...item, _key: stableKey(`${seed}:${index}:${item._type}:${JSON.stringify(item)}`, 'b')}
    const markKeyMap = new Map()
    if (Array.isArray(next.markDefs)) {
      next.markDefs = next.markDefs.map((mark, markIndex) => {
        const nextKey = stableKey(`${seed}:${index}:mark:${markIndex}:${mark.href || mark._type}`, 'm')
        if (mark._key) markKeyMap.set(mark._key, nextKey)
        return {...mark, _key: nextKey}
      })
    }
    if (Array.isArray(next.children)) {
      next.children = next.children.map((child, childIndex) => ({
        ...child,
        marks: Array.isArray(child.marks)
          ? child.marks.map((mark) => markKeyMap.get(mark) || mark).filter(Boolean)
          : [],
        _key: stableKey(`${seed}:${index}:child:${childIndex}:${child.text || child._type}`, 's'),
      }))
    }
    return next
  })
}

function convertBody(post, qualityFlags, assetRequests) {
  const prepared = replaceShortcodes(post.content).replace(/<h1(\s|>)/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>')
  if (/<h1[\s>]/i.test(post.content)) qualityFlags.push('body-h1-converted-to-h2')
  let generatedKeyIndex = 0
  const keyGenerator = () => stableKey(`${post.id}:html:${generatedKeyIndex++}`, 'g')

  const blocks = htmlToBlocks(prepared, blockContentType, {
    keyGenerator,
    unstable_whitespaceOnPasteMode: 'preserve',
    parseHtml: parseHtmlPreservingInlineWhitespace,
    rules: [
      {
        deserialize(element, next, block) {
          const tagName = element.tagName?.toLowerCase()
          if (tagName === 'wp-shortcode') {
            const raw = Buffer.from(element.getAttribute('data-raw') || '', 'base64').toString('utf8')
            const name = element.getAttribute('data-name') || 'unknown'
            qualityFlags.push(`legacy-shortcode:${name.replace(/^\//, '')}`)
            return block({
              _type: 'legacyShortcode',
              name,
              raw,
              note: 'Preserved from WordPress and requires editorial review before publication.',
            })
          }
          if (tagName === 'table') {
            const rows = [...element.querySelectorAll('tr')].map((row, rowIndex) => ({
              _type: 'tableRow',
              _key: stableKey(`${post.id}:table:${assetRequests.length}:${rowIndex}`, 'r'),
              cells: [...row.querySelectorAll(':scope > th, :scope > td')].map((cell) =>
                String(cell.textContent || '').replace(/\s+/g, ' ').trim(),
              ),
            }))
            return block({
              _type: 'articleTable',
              caption: element.querySelector('caption')?.textContent?.trim() || undefined,
              hasHeaderRow: Boolean(element.querySelector('thead, tr:first-child th')),
              rows,
            })
          }
          if (tagName === 'img') {
            const sourceUrl = element.getAttribute('src') || element.getAttribute('data-src') || ''
            if (!sourceUrl) {
              qualityFlags.push('inline-image-without-source')
              return block({
                _type: 'migrationNote',
                reason: 'Inline image had no source URL.',
                sourceHtml: element.outerHTML,
              })
            }
            const attachment = findAttachmentForImage(element, sourceUrl)
            const file = resolveUpload(sourceUrl, attachment)
            const alt = element.getAttribute('alt') || attachment?.alt || ''
            const caption = element.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || attachment?.caption || ''
            const linkHref = element.closest('a')?.getAttribute('href') || undefined
            if (!file) qualityFlags.push(`unresolved-inline-image:${sourceUrl}`)
            if (!alt) qualityFlags.push(`missing-inline-image-alt:${sourceUrl}`)
            const asset = {
              role: 'inline',
              sourceUrl,
              sourcePath: file?.absolutePath,
              relativePath: file?.relativePath,
              wordpressAttachmentId: attachment ? Number(attachment.id) : undefined,
              alt,
              caption,
              linkHref,
            }
            assetRequests.push(asset)
            return block({_type: 'articleImage', ...asset})
          }
          if (tagName === 'a') {
            const href = element.getAttribute('href')
            if (!href) return undefined
            return {
              _type: '__annotation',
              markDef: {
                _key: keyGenerator(),
                _type: 'link',
                href,
                blank: element.getAttribute('target') === '_blank',
              },
              children: next(element.childNodes),
            }
          }
          return undefined
        },
      },
    ],
  })

  return deterministicKeys(blocks, `post:${post.id}`)
}

const categoryPlans = snapshot.taxonomies
  .filter((term) => term.taxonomy === 'category')
  .map((term) => ({
    sourceKey: `category:${term.termId}`,
    document: {
      _type: 'category',
      title: decodeHtmlEntities(term.name),
      slug: {_type: 'slug', current: term.slug || slugify(term.name)},
      description: term.description || undefined,
      wordpressId: Number(term.termId),
    },
  }))

const tagPlans = snapshot.taxonomies
  .filter((term) => term.taxonomy === 'post_tag')
  .map((term) => ({
    sourceKey: `tag:${term.termId}`,
    document: {
      _type: 'tag',
      title: decodeHtmlEntities(term.name),
      slug: {_type: 'slug', current: term.slug || slugify(term.name)},
      description: term.description || undefined,
      wordpressId: Number(term.termId),
    },
  }))

const authorIds = [...new Set(snapshot.posts.filter((post) => post.status === 'draft').map((post) => Number(post.authorId)))]
const authorPlans = authorIds.map((wordpressId) => {
  const databaseAuthor = snapshot.authors.find((author) => Number(author.wordpressId) === wordpressId)
  const exportAuthor = snapshot.exportRecords.find((record) => Number(record.authorId) === wordpressId)
  const fullName = `${exportAuthor?.authorFirstName || ''} ${exportAuthor?.authorLastName || ''}`.trim()
  const sourceName = fullName || databaseAuthor?.displayName || exportAuthor?.authorUsername || databaseAuthor?.login
  const name = sourceName || `WordPress author ${wordpressId}`
  return {
    sourceKey: `author:${wordpressId}`,
    requiresOwnerApproval: true,
    document: {
      _type: 'author',
      name,
      slug: {_type: 'slug', current: slugify(name) || `author-${wordpressId}`},
      wordpressId,
      identityApproved: false,
    },
  }
})

const articlePlans = []
for (const post of snapshot.posts.filter((item) => item.status === 'draft')) {
  const id = Number(post.id)
  const meta = postMeta.get(id) || new Map()
  const supplemental = exportById.get(id)
  const qualityFlags = []
  const assetRequests = []
  const originalSlug = post.slug || supplemental?.slug || ''
  const slug = originalSlug || slugify(post.title)
  if (!originalSlug) qualityFlags.push(`generated-slug-requires-owner-approval:${slug}`)

  const thumbnailId = Number(meta.get('_thumbnail_id')) || undefined
  const thumbnail = thumbnailId ? attachmentById.get(thumbnailId) : undefined
  let featuredImage
  if (thumbnailId) {
    const sourceUrl = thumbnail?.guid || supplemental?.featuredImageUrl || ''
    const file = resolveUpload(sourceUrl, thumbnail)
    if (!file) qualityFlags.push(`unresolved-featured-image:${thumbnailId}`)
    if (!thumbnail) qualityFlags.push(`missing-featured-attachment-record:${thumbnailId}`)
    if (!thumbnail?.alt && !supplemental?.featuredImageAlt) qualityFlags.push('missing-featured-image-alt')
    featuredImage = {
      role: 'featured',
      sourceUrl,
      sourcePath: file?.absolutePath,
      relativePath: file?.relativePath,
      wordpressAttachmentId: thumbnailId,
      alt: thumbnail?.alt || supplemental?.featuredImageAlt || '',
      caption: thumbnail?.caption || '',
    }
    assetRequests.push(featuredImage)
  } else {
    qualityFlags.push('missing-featured-image')
  }

  const body = convertBody(post, qualityFlags, assetRequests)
  const relation = relationships.get(id) || {category: [], post_tag: []}
  const readingTime = Number(meta.get('_yoast_wpseo_estimated-reading-time-minutes')) || undefined
  const sourcePublishedAt = mysqlDateToIso(post.dateGmt) || mysqlDateToIso(post.dateLocal)
  const sourceUpdatedAt = mysqlDateToIso(post.modifiedGmt) || mysqlDateToIso(post.modifiedLocal)
  const wordpressUrl = supplemental?.permalink || post.guid || undefined
  let sourcePath
  if (wordpressUrl) {
    try {
      const pathname = new URL(wordpressUrl).pathname
      sourcePath = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`
    } catch {
      qualityFlags.push('invalid-wordpress-url')
    }
  }
  const uniqueQualityFlags = [...new Set(qualityFlags)]

  articlePlans.push({
    sourceKey: `article:${id}`,
    referenceSourceKeys: {
      author: `author:${Number(post.authorId)}`,
      categories: relation.category.map((termId) => `category:${termId}`),
      tags: relation.post_tag.map((termId) => `tag:${termId}`),
    },
    assetRequests,
    document: {
      _type: 'article',
      title: decodeHtmlEntities(post.title),
      slug: {_type: 'slug', current: slug},
      excerpt: post.excerpt || undefined,
      body,
      featuredImage,
      editorialStatus: 'draft',
      originalPublishedAt: sourcePublishedAt,
      sourceUpdatedAt,
      readingTimeMinutes: readingTime,
      seo: {
        title: meta.get('_yoast_wpseo_title') || supplemental?.seoTitle || undefined,
        description: meta.get('_yoast_wpseo_metadesc') || supplemental?.seoDescription || undefined,
        focusKeyword: meta.get('_yoast_wpseo_focuskw') || supplemental?.focusKeyword || undefined,
        noIndex: true,
      },
      migration: {
        wordpressId: id,
        wordpressType: post.postType,
        wordpressStatus: post.status,
        wordpressUrl,
        sourcePath,
        sourceModifiedAt: sourceUpdatedAt,
        sourceContentSha256: createHash('sha256').update(post.content || '', 'utf8').digest('hex'),
        transformedAt: new Date().toISOString(),
        qualityFlags: uniqueQualityFlags,
      },
    },
  })
}

await writeJson(outputFile, {
  generatedAt: new Date().toISOString(),
  mode: 'dry-run-import-plan',
  safety: {
    externalWritesPerformed: false,
    documentsPublished: false,
    importRequiresOwnerApprovedSanityConfiguration: true,
    referenceStrategy:
      'Resolve sourceKey by querying explicit WordPress ID fields, then create or patch generated Sanity document IDs.',
  },
  counts: {
    articles: articlePlans.length,
    authors: authorPlans.length,
    categories: categoryPlans.length,
    tags: tagPlans.length,
    quarantinedCsvOnlyRecords: snapshot.csvOnlyRecords.length,
  },
  authors: authorPlans,
  categories: categoryPlans,
  tags: tagPlans,
  articles: articlePlans,
  quarantinedCsvOnlyRecords: snapshot.csvOnlyRecords,
})

console.log(JSON.stringify({outputFile, articles: articlePlans.length, authors: authorPlans.length, categories: categoryPlans.length, tags: tagPlans.length}, null, 2))

import {execFileSync} from 'node:child_process'
import {readdir, stat, readFile} from 'node:fs/promises'
import path from 'node:path'
import {parse} from 'csv-parse/sync'
import {
  ensureDirectory,
  migrationRoot,
  pathExists,
  resolveFromMigration,
  writeJson,
} from './lib.mjs'

const socket = process.env.WP_DB_SOCKET || '/tmp/asanja-mariadb.sock'
const database = process.env.WP_DB_NAME || 'asanja'
const databaseUser = process.env.WP_DB_USER || 'root'
const uploadsDir = resolveFromMigration(process.env.WP_UPLOADS_DIR, '../wordpress-source/uploads')
const exportFile = resolveFromMigration(
  process.env.WP_POST_EXPORT,
  '../wordpress-source/uploads/wpallexport/exports/cadda307cd642ea6514414db76a089bc/current-Posts-Export-2026-June-10-0513.csv',
)
const outputFile = path.join(migrationRoot, 'extracted', 'wordpress.json')

function queryJsonRows(select) {
  const output = execFileSync(
    'mariadb',
    [
      '--no-defaults',
      '--protocol=SOCKET',
      `--socket=${socket}`,
      `--user=${databaseUser}`,
      '--batch',
      '--raw',
      '--skip-column-names',
      database,
      '--execute',
      select,
    ],
    {encoding: 'utf8', maxBuffer: 512 * 1024 * 1024},
  )

  return output
    .split('\n')
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line)
      } catch (error) {
        throw new Error(`Database JSON parse failed at result row ${index + 1}: ${error.message}`)
      }
    })
}

async function walkFiles(directory, base = directory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const files = []

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolute, base)))
    } else if (entry.isFile()) {
      const info = await stat(absolute)
      files.push({
        relativePath: path.relative(base, absolute).split(path.sep).join('/'),
        absolutePath: absolute,
        bytes: info.size,
      })
    }
  }

  return files
}

function selectedCsvRecord(row) {
  return {
    id: Number(row.ID),
    title: row.Title || '',
    content: row.Content || '',
    excerpt: row.Excerpt || '',
    permalink: row.Permalink || '',
    status: row.Status || '',
    slug: row.Slug || '',
    postType: row['Post Type'] || '',
    authorId: Number(row['Author ID']) || undefined,
    authorUsername: row['Author Username'] || '',
    authorFirstName: row['Author First Name'] || '',
    authorLastName: row['Author Last Name'] || '',
    modifiedAt: row['Post Modified Date'] || '',
    seoTitle: row._yoast_wpseo_title || '',
    seoDescription: row._yoast_wpseo_metadesc || '',
    focusKeyword: row._yoast_wpseo_focuskw || '',
    featuredImageUrl: row['Image URL'] || '',
    featuredImageAlt: row['Image Alt Text'] || '',
  }
}

if (!(await pathExists(socket))) {
  throw new Error(
    `WordPress database socket not found at ${socket}. Start the restored read-only MariaDB instance before extraction.`,
  )
}
if (!(await pathExists(uploadsDir))) throw new Error(`Uploads directory not found: ${uploadsDir}`)
if (!(await pathExists(exportFile))) throw new Error(`WP All Export CSV not found: ${exportFile}`)

const posts = queryJsonRows(`
  SELECT JSON_OBJECT(
    'id', ID,
    'authorId', post_author,
    'dateLocal', DATE_FORMAT(post_date, '%Y-%m-%d %H:%i:%s'),
    'dateGmt', DATE_FORMAT(post_date_gmt, '%Y-%m-%d %H:%i:%s'),
    'modifiedLocal', DATE_FORMAT(post_modified, '%Y-%m-%d %H:%i:%s'),
    'modifiedGmt', DATE_FORMAT(post_modified_gmt, '%Y-%m-%d %H:%i:%s'),
    'content', post_content,
    'title', post_title,
    'excerpt', post_excerpt,
    'status', post_status,
    'slug', post_name,
    'parentId', post_parent,
    'guid', guid,
    'postType', post_type,
    'mimeType', post_mime_type
  )
  FROM wp_posts
  WHERE post_type = 'post' AND post_status IN ('draft', 'auto-draft')
  ORDER BY ID;
`)

const postMeta = queryJsonRows(`
  SELECT JSON_OBJECT('postId', pm.post_id, 'key', pm.meta_key, 'value', pm.meta_value)
  FROM wp_postmeta pm
  INNER JOIN wp_posts p ON p.ID = pm.post_id
  WHERE p.post_type = 'post'
    AND p.post_status IN ('draft', 'auto-draft')
    AND pm.meta_key IN (
      '_thumbnail_id', '_yoast_wpseo_title', '_yoast_wpseo_metadesc',
      '_yoast_wpseo_focuskw', '_yoast_wpseo_estimated-reading-time-minutes',
      '_yoast_wpseo_primary_category', '_elementor_data', '_elementor_edit_mode',
      '_wp_old_slug'
    )
  ORDER BY pm.post_id, pm.meta_id;
`)

const taxonomies = queryJsonRows(`
  SELECT JSON_OBJECT(
    'termId', t.term_id,
    'taxonomyId', tt.term_taxonomy_id,
    'taxonomy', tt.taxonomy,
    'name', t.name,
    'slug', t.slug,
    'description', tt.description
  )
  FROM wp_terms t
  INNER JOIN wp_term_taxonomy tt ON tt.term_id = t.term_id
  WHERE tt.taxonomy IN ('category', 'post_tag')
  ORDER BY tt.taxonomy, t.term_id;
`)

const relationships = queryJsonRows(`
  SELECT JSON_OBJECT(
    'postId', tr.object_id,
    'termId', tt.term_id,
    'taxonomyId', tt.term_taxonomy_id,
    'taxonomy', tt.taxonomy,
    'termOrder', tr.term_order
  )
  FROM wp_term_relationships tr
  INNER JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
  INNER JOIN wp_posts p ON p.ID = tr.object_id
  WHERE p.post_type = 'post'
    AND p.post_status IN ('draft', 'auto-draft')
    AND tt.taxonomy IN ('category', 'post_tag')
  ORDER BY tr.object_id, tt.taxonomy, tr.term_order, tt.term_id;
`)

const attachments = queryJsonRows(`
  SELECT JSON_OBJECT(
    'id', p.ID,
    'parentId', p.post_parent,
    'title', p.post_title,
    'caption', p.post_excerpt,
    'description', p.post_content,
    'guid', p.guid,
    'mimeType', p.post_mime_type,
    'attachedFile', MAX(CASE WHEN pm.meta_key = '_wp_attached_file' THEN pm.meta_value END),
    'alt', MAX(CASE WHEN pm.meta_key = '_wp_attachment_image_alt' THEN pm.meta_value END),
    'metadata', MAX(CASE WHEN pm.meta_key = '_wp_attachment_metadata' THEN pm.meta_value END)
  )
  FROM wp_posts p
  LEFT JOIN wp_postmeta pm ON pm.post_id = p.ID
    AND pm.meta_key IN ('_wp_attached_file', '_wp_attachment_image_alt', '_wp_attachment_metadata')
  WHERE p.post_type = 'attachment'
  GROUP BY p.ID
  ORDER BY p.ID;
`)

const authors = queryJsonRows(`
  SELECT JSON_OBJECT(
    'wordpressId', source.post_author,
    'login', COALESCE(u.user_login, ''),
    'displayName', COALESCE(u.display_name, '')
  )
  FROM (
    SELECT DISTINCT post_author
    FROM wp_posts
    WHERE post_type = 'post' AND post_status IN ('draft', 'auto-draft')
  ) source
  LEFT JOIN wp_users u ON u.ID = source.post_author
  ORDER BY source.post_author;
`)

const options = Object.fromEntries(
  queryJsonRows(`
    SELECT JSON_OBJECT('name', option_name, 'value', option_value)
    FROM wp_options
    WHERE option_name IN ('home', 'siteurl', 'timezone_string', 'gmt_offset')
    ORDER BY option_name;
  `).map(({name, value}) => [name, value]),
)

const csvText = (await readFile(exportFile, 'utf8')).replace(/^\uFEFF/, '')
const csvRows = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  relax_quotes: true,
  bom: true,
})
const exportRecords = csvRows.map(selectedCsvRecord).filter((record) => Number.isFinite(record.id))
const databaseIds = new Set(posts.map((post) => Number(post.id)))
const csvOnlyRecords = exportRecords.filter((record) => !databaseIds.has(record.id))
const uploadFiles = await walkFiles(uploadsDir)

await ensureDirectory(path.dirname(outputFile))
await writeJson(outputFile, {
  generatedAt: new Date().toISOString(),
  source: {
    database,
    socket,
    exportFile,
    uploadsDir,
    options,
  },
  counts: {
    posts: posts.length,
    drafts: posts.filter((post) => post.status === 'draft').length,
    autoDrafts: posts.filter((post) => post.status === 'auto-draft').length,
    postMeta: postMeta.length,
    taxonomies: taxonomies.length,
    relationships: relationships.length,
    attachments: attachments.length,
    exportRecords: exportRecords.length,
    csvOnlyRecords: csvOnlyRecords.length,
    uploadFiles: uploadFiles.length,
  },
  posts,
  postMeta,
  taxonomies,
  relationships,
  attachments,
  authors,
  exportRecords,
  csvOnlyRecords,
  uploadFiles,
})

console.log(
  JSON.stringify(
    {
      outputFile,
      posts: posts.length,
      drafts: posts.filter((post) => post.status === 'draft').length,
      autoDrafts: posts.filter((post) => post.status === 'auto-draft').length,
      csvOnlyRecords: csvOnlyRecords.map(({id, title}) => ({id, title})),
      uploadFiles: uploadFiles.length,
    },
    null,
    2,
  ),
)

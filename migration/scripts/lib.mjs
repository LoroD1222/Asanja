import {createHash} from 'node:crypto'
import {access, mkdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

export const migrationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const repositoryRoot = path.resolve(migrationRoot, '..')

export function resolveFromMigration(value, fallback) {
  return path.resolve(migrationRoot, value || fallback)
}

export async function ensureDirectory(directory) {
  await mkdir(directory, {recursive: true})
}

export async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

export async function writeJson(file, value) {
  await ensureDirectory(path.dirname(file))
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export async function writeText(file, value) {
  await ensureDirectory(path.dirname(file))
  await writeFile(file, value.endsWith('\n') ? value : `${value}\n`, 'utf8')
}

export async function pathExists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

export function stableKey(value, prefix = 'k') {
  return `${prefix}${createHash('sha1').update(String(value)).digest('hex').slice(0, 11)}`
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

export function mysqlDateToIso(value) {
  if (!value || value === '0000-00-00 00:00:00') return undefined
  const date = new Date(`${String(value).replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

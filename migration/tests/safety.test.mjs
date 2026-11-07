import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import {migrationRoot, readJson, repositoryRoot} from '../scripts/lib.mjs'

test('all article plans remain unique drafts with noIndex enabled', async () => {
  const plan = await readJson(path.join(migrationRoot, 'transformed', 'sanity-import-plan.json'))
  assert.equal(plan.articles.length, 169)
  assert.equal(new Set(plan.articles.map((item) => item.sourceKey)).size, 169)
  assert.equal(new Set(plan.articles.map((item) => item.document.migration.wordpressId)).size, 169)
  assert.equal(new Set(plan.articles.map((item) => item.document.slug.current)).size, 169)
  assert.ok(plan.articles.every((item) => item.document.editorialStatus === 'draft'))
  assert.ok(plan.articles.every((item) => item.document.seo.noIndex === true))
  assert.ok(plan.articles.every((item) => !Object.hasOwn(item.document, '_id')))
  assert.deepEqual(plan.quarantinedCsvOnlyRecords.map((item) => Number(item.id)), [37587])
})

test('public article queries explicitly exclude draft document IDs', async () => {
  const queries = await readFile(path.join(repositoryRoot, 'sanity', 'queries.ts'), 'utf8')
  const client = await readFile(path.join(repositoryRoot, 'sanity', 'client.ts'), 'utf8')
  assert.match(queries, /!\(_id in path\("drafts\.\*\*"\)\)/)
  assert.match(client, /perspective: 'published'/)
})

test('importer requires an explicit drafts-only execution gate', async () => {
  const importer = await readFile(path.join(migrationRoot, 'scripts', 'import-to-sanity.mjs'), 'utf8')
  assert.match(importer, /process\.argv\.includes\('--execute'\)/)
  assert.match(importer, /process\.argv\.includes\('--confirm-drafts-only'\)/)
  assert.match(importer, /return `drafts\.\$\{randomUUID\(\)\}`/)
  assert.match(importer, /Safety stop before writes/)
  assert.match(importer, /publications: 0/)
})

test('final per-article migration validation passed', async () => {
  const report = await readJson(path.join(migrationRoot, 'reports', 'final-validation.json'))
  assert.equal(report.result, 'passed')
  assert.equal(report.metrics.passedArticles, 169)
  assert.equal(report.metrics.failedArticles, 0)
  assert.equal(report.metrics.sourceLinks, report.metrics.preservedLinks)
})

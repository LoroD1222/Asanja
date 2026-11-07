import test from 'node:test'
import assert from 'node:assert/strict'
import {mysqlDateToIso, slugify, stableKey} from '../scripts/lib.mjs'

test('slugify produces stable URL-safe article slugs', () => {
  assert.equal(slugify('Open Hearts & Wild Spirits!'), 'open-hearts-and-wild-spirits')
  assert.equal(slugify('  Swahili  '), 'swahili')
})

test('stableKey is deterministic and prefix-aware', () => {
  assert.equal(stableKey('same', 'x'), stableKey('same', 'x'))
  assert.match(stableKey('same', 'x'), /^x[a-f0-9]{11}$/)
})

test('mysqlDateToIso rejects WordPress zero dates', () => {
  assert.equal(mysqlDateToIso('0000-00-00 00:00:00'), undefined)
  assert.equal(mysqlDateToIso('2026-11-06 12:30:00'), '2026-11-06T12:30:00.000Z')
})

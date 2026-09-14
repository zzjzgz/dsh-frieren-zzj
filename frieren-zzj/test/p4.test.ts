/**
 * P4 unit tests, run with the Node built-in runner:
 *
 *   node --test
 *
 * Covers the pure logic shipped in P4: the wallpaper-gallery parsing and
 * rotation math behind the carousel. No external test dependencies.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  clampInterval, encodeWallpaperList, nextWallpaperIndex,
  parseWallpaperList, resolveWallpaperList,
} from '../src/client/wallpaper-list.ts'
import {
  isWallpaperRotation, resolveSettings,
  DEFAULT_CAROUSEL_INTERVAL, MAX_CAROUSEL_INTERVAL, MAX_WALLPAPERS, MIN_CAROUSEL_INTERVAL,
} from '../src/frieren-settings.ts'

const URL_A = 'data:image/jpeg;base64,AAA'
const URL_B = 'data:image/jpeg;base64,BBB'
const URL_C = 'data:image/jpeg;base64,CCC'

// ---------------------------------------------------------------------------
// parseWallpaperList
// ---------------------------------------------------------------------------

test('a stored list parses into its images', () => {
  assert.deepEqual(parseWallpaperList(JSON.stringify([URL_A, URL_B])), [URL_A, URL_B])
})

test('an absent or empty list parses to nothing', () => {
  assert.deepEqual(parseWallpaperList(''), [])
  assert.deepEqual(parseWallpaperList('[]'), [])
})

test('non-string and empty entries are dropped', () => {
  assert.deepEqual(parseWallpaperList(JSON.stringify([URL_A, '', 3, null, URL_B])), [URL_A, URL_B])
})

test('a malformed or non-array document parses to nothing', () => {
  assert.deepEqual(parseWallpaperList('not json'), [])
  assert.deepEqual(parseWallpaperList('{"a":1}'), [])
  assert.deepEqual(parseWallpaperList('42'), [])
})

test('the list is capped at the storage limit', () => {
  const many = Array.from({ length: MAX_WALLPAPERS + 4 }, (_, i) => `url-${i}`)
  const parsed = parseWallpaperList(JSON.stringify(many))
  assert.equal(parsed.length, MAX_WALLPAPERS)
  assert.deepEqual(parsed, many.slice(0, MAX_WALLPAPERS))
})

// ---------------------------------------------------------------------------
// resolveWallpaperList
// ---------------------------------------------------------------------------

test('the legacy single wallpaper stands alone while the list is empty', () => {
  assert.deepEqual(resolveWallpaperList(URL_A, ''), [URL_A])
})

test('the rotation list wins over the legacy single field', () => {
  assert.deepEqual(resolveWallpaperList(URL_A, JSON.stringify([URL_B, URL_C])), [URL_B, URL_C])
})

test('no wallpaper anywhere resolves to an empty gallery', () => {
  assert.deepEqual(resolveWallpaperList('', ''), [])
})

// ---------------------------------------------------------------------------
// encodeWallpaperList
// ---------------------------------------------------------------------------

test('a gallery round-trips through storage', () => {
  const list = [URL_A, URL_B]
  assert.deepEqual(parseWallpaperList(encodeWallpaperList(list)), list)
})

test('an empty gallery encodes to the empty string', () => {
  assert.equal(encodeWallpaperList([]), '')
})

// ---------------------------------------------------------------------------
// nextWallpaperIndex
// ---------------------------------------------------------------------------

test('sequential rotation advances and wraps', () => {
  assert.equal(nextWallpaperIndex(0, 3, 'sequential'), 1)
  assert.equal(nextWallpaperIndex(1, 3, 'sequential'), 2)
  assert.equal(nextWallpaperIndex(2, 3, 'sequential'), 0)
})

test('an out-of-range index is normalized before advancing', () => {
  assert.equal(nextWallpaperIndex(5, 3, 'sequential'), 0)
  assert.equal(nextWallpaperIndex(-1, 3, 'sequential'), 0)
})

test('shuffle picks through the rng', () => {
  assert.equal(nextWallpaperIndex(1, 3, 'shuffle', () => 0), 0)
  assert.equal(nextWallpaperIndex(1, 3, 'shuffle', () => 0.99), 2)
})

test('shuffle never re-serves the current image', () => {
  // rng lands on the current index, so the rotation must step past it.
  assert.equal(nextWallpaperIndex(0, 3, 'shuffle', () => 0), 1)
  assert.equal(nextWallpaperIndex(2, 3, 'shuffle', () => 0.99), 0)
})

test('a gallery of fewer than two images stays on index 0', () => {
  assert.equal(nextWallpaperIndex(0, 1, 'sequential'), 0)
  assert.equal(nextWallpaperIndex(0, 1, 'shuffle'), 0)
  assert.equal(nextWallpaperIndex(0, 0, 'shuffle'), 0)
})

// ---------------------------------------------------------------------------
// clampInterval / isWallpaperRotation
// ---------------------------------------------------------------------------

test('the interval clamps into the slider range', () => {
  assert.equal(clampInterval(30), 30)
  assert.equal(clampInterval(0), MIN_CAROUSEL_INTERVAL)
  assert.equal(clampInterval(99_999), MAX_CAROUSEL_INTERVAL)
})

test('a non-numeric interval falls back to the default', () => {
  assert.equal(clampInterval(Number.NaN), DEFAULT_CAROUSEL_INTERVAL)
  assert.equal(clampInterval(Number.POSITIVE_INFINITY), DEFAULT_CAROUSEL_INTERVAL)
})

test('only the built-in rotation orders are accepted', () => {
  assert.equal(isWallpaperRotation('sequential'), true)
  assert.equal(isWallpaperRotation('shuffle'), true)
  assert.equal(isWallpaperRotation('random'), false)
  assert.equal(isWallpaperRotation(3), false)
})

// ---------------------------------------------------------------------------
// resolveSettings — the gallery fields
// ---------------------------------------------------------------------------

test('missing settings resolve the gallery to a single-image default', () => {
  const resolved = resolveSettings(undefined)
  assert.equal(resolved.customWallpapers, '')
  assert.equal(resolved.carouselInterval, DEFAULT_CAROUSEL_INTERVAL)
  assert.equal(resolved.carouselMode, 'sequential')
})

test('stored gallery settings resolve through unchanged', () => {
  const resolved = resolveSettings({
    customWallpapers: JSON.stringify([URL_A]),
    carouselInterval: 120,
    carouselMode: 'shuffle',
  })
  assert.equal(resolved.customWallpapers, JSON.stringify([URL_A]))
  assert.equal(resolved.carouselInterval, 120)
  assert.equal(resolved.carouselMode, 'shuffle')
})

test('a stale gallery value falls back to the defaults', () => {
  const stale = {
    customWallpapers: 7,
    carouselInterval: 'soon',
    carouselMode: 'sideways',
  } as unknown as Partial<Parameters<typeof resolveSettings>[0]>
  const resolved = resolveSettings(stale)
  assert.equal(resolved.customWallpapers, '')
  assert.equal(resolved.carouselInterval, DEFAULT_CAROUSEL_INTERVAL)
  assert.equal(resolved.carouselMode, 'sequential')
})

/**
 * Wallpaper upload-flow unit tests, run with the Node built-in runner:
 *
 *   node --test
 *
 * The rules under test are about ORDER: a refused add must not touch the file
 * store, and an upload that a concurrent edit refuses must not leave its file
 * behind. No external test dependencies.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { addWallpaper, type WallpaperAddPorts } from '../src/client/wallpaper-add.ts'
import { WALLPAPER_ROUTE_PREFIX } from '../src/routes.ts'
import { MAX_WALLPAPERS } from '../src/frieren-settings.ts'

const NAME = `${'a'.repeat(32)}.jpg`
const STORE_URL = `${WALLPAPER_ROUTE_PREFIX}/${NAME}`
const DATA_URL = 'data:image/jpeg;base64,AAAA'
const OTHER_STORE_URL = `${WALLPAPER_ROUTE_PREFIX}/${'b'.repeat(32)}.jpg`

/** A recording port set, with only the behaviour a test cares about. */
function ports(overrides: Partial<WallpaperAddPorts> & { gallery?: readonly string[] } = {}) {
  const calls = { encode: 0, store: 0, commit: [] as (readonly string[])[], forget: [] as (readonly string[])[] }
  const gallery = overrides.gallery ?? []
  const base: WallpaperAddPorts = {
    encode: async () => {
      calls.encode += 1
      return DATA_URL
    },
    store: async () => {
      calls.store += 1
      return STORE_URL
    },
    readGallery: () => gallery,
    commit: (next) => { calls.commit.push(next) },
    forget: (names) => { calls.forget.push(names) },
  }
  return { calls, ports: { ...base, ...overrides, ...(overrides.gallery === undefined ? {} : { readGallery: () => gallery }) } }
}

/** A gallery of `count` distinct store-backed entries. */
function galleryOf(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${WALLPAPER_ROUTE_PREFIX}/${String(i).repeat(32).slice(0, 32)}.jpg`)
}

test('a full gallery refuses the pick before anything is uploaded', async () => {
  // The reported bug: the capacity check used to run AFTER the upload, so the
  // refused image's file was already on disk with no gallery entry referencing
  // it — invisible in the UI and impossible to delete from it.
  const { calls, ports: p } = ports({ gallery: galleryOf(MAX_WALLPAPERS) })
  const result = await addWallpaper(p)
  assert.equal(result, 'full')
  assert.equal(calls.store, 0, 'the file store must not be touched when the gallery is full')
  assert.equal(calls.encode, 0, 'the image must not even be decoded when the gallery is full')
  assert.deepEqual(calls.commit, [])
  assert.deepEqual(calls.forget, [])
})

test('a gallery with one free slot accepts the pick', async () => {
  const { calls, ports: p } = ports({ gallery: galleryOf(MAX_WALLPAPERS - 1) })
  const result = await addWallpaper(p)
  assert.equal(result, 'added')
  assert.equal(calls.encode, 1)
  assert.equal(calls.store, 1)
  assert.equal(calls.commit.length, 1)
  assert.equal(calls.commit[0]?.length, MAX_WALLPAPERS)
  assert.equal(calls.commit[0]?.at(-1), STORE_URL)
  assert.deepEqual(calls.forget, [], 'a successful add orphans nothing')
})

test('an inline fallback is appended just like a stored URL', async () => {
  const { calls, ports: p } = ports({ store: async () => DATA_URL })
  const result = await addWallpaper(p)
  assert.equal(result, 'added')
  assert.equal(calls.commit[0]?.at(-1), DATA_URL)
  assert.deepEqual(calls.forget, [])
})

test('an upload the gallery filled mid-flight is cleaned up and refused', async () => {
  // A fresh read happens after the upload: if another tab (or a slow write)
  // filled the last slot meanwhile, the file this pick just created must not
  // survive as an orphan.
  let reads = 0
  const empty: string[] = []
  const full = galleryOf(MAX_WALLPAPERS)
  const { calls, ports: p } = ports({
    readGallery: () => {
      reads += 1
      return reads === 1 ? empty : full
    },
  })
  const result = await addWallpaper(p)
  assert.equal(result, 'full')
  assert.equal(calls.store, 1, 'the upload had already happened')
  assert.deepEqual(calls.commit, [], 'the gallery must not be written')
  assert.deepEqual(calls.forget, [[NAME]], 'the file this pick created must be deleted')
})

test('the cleanup of a mid-flight fill deletes nothing it did not create', async () => {
  let reads = 0
  const full = galleryOf(MAX_WALLPAPERS)
  const { calls, ports: p } = ports({
    readGallery: () => {
      reads += 1
      return reads === 1 ? full.slice(0, 1) : full
    },
  })
  const result = await addWallpaper(p)
  assert.equal(result, 'full')
  // The gallery already held entry 0..5; only the newly stored file is dropped.
  assert.deepEqual(calls.forget, [[NAME]])
  assert.ok(!calls.forget[0]?.includes(full[0]?.split('/').at(-1) ?? 'x'))
})

test('a failed upload leaves the gallery untouched', async () => {
  const { calls, ports: p } = ports({ store: async () => { throw new Error('store down') } })
  const result = await addWallpaper(p)
  assert.equal(result, 'failed')
  assert.deepEqual(calls.commit, [])
  assert.deepEqual(calls.forget, [])
})

test('a failed decode leaves the gallery untouched', async () => {
  const { calls, ports: p } = ports({ encode: async () => { throw new Error('unsupported image') } })
  const result = await addWallpaper(p)
  assert.equal(result, 'failed')
  assert.equal(calls.store, 0)
  assert.deepEqual(calls.commit, [])
})

test('a failed commit is reported instead of throwing', async () => {
  const { ports: p } = ports({ commit: () => { throw new Error('bridge down') } })
  const result = await addWallpaper(p)
  assert.equal(result, 'failed')
})

test('a lower capacity is honoured', async () => {
  const { calls, ports: p } = ports({ gallery: [OTHER_STORE_URL], max: 1 })
  const result = await addWallpaper(p)
  assert.equal(result, 'full')
  assert.equal(calls.store, 0)
})

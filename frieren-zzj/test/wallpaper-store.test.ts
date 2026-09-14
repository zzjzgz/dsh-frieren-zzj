/**
 * Wallpaper file-store unit tests, run with the Node built-in runner:
 *
 *   node --test
 *
 * Covers the content-addressing, request parsing, upload decoding, prune rule,
 * and the browser-side fallback ladder behind the optional file store. No
 * external test dependencies.
 */
import assert from 'node:assert/strict'
import { mkdtemp, readdir, stat, utimes } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  MAX_WALLPAPER_BYTES, PRUNE_GRACE_MS, decodeWallpaperUpload,
  loadWallpaper, pruneableWallpaper, referencedWallpaperNames,
  removeWallpaper, storeWallpaper, wallpaperFileName, wallpaperId,
} from '../src/wallpaper-store.ts'
import {
  isWallpaperFileName, parseWallpaperRequest, wallpaperDeleteUrl,
  wallpaperFilesToDelete, wallpaperNameFromUrl,
} from '../src/wallpaper-names.ts'
import { MAX_BRIDGE_BODY_BYTES, WALLPAPER_ROUTE_PREFIX } from '../src/routes.ts'
import { persistWallpaper, forgetWallpapers, type FetchLike } from '../src/client/persist-wallpaper.ts'

const VALID_ID = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
const VALID_NAME = `${VALID_ID}.jpg`

/** Build a data URL for the given bytes and media type. */
function dataUrlFor(bytes: Uint8Array, media = 'image/jpeg'): string {
  return `data:${media};base64,${Buffer.from(bytes).toString('base64')}`
}

// ---------------------------------------------------------------------------
// content addressing
// ---------------------------------------------------------------------------

test('the same bytes always address the same wallpaper', () => {
  const bytes = new Uint8Array([1, 2, 3, 4, 5])
  assert.equal(wallpaperId(bytes), wallpaperId(bytes))
})

test('different bytes address different wallpapers', () => {
  assert.notEqual(wallpaperId(new Uint8Array([1, 2, 3])), wallpaperId(new Uint8Array([1, 2, 4])))
})

test('an id is 32 lowercase hex characters', () => {
  assert.match(wallpaperId(new Uint8Array([9, 9, 9])), /^[0-9a-f]{32}$/)
})

test('a file name is the id plus the jpg extension', () => {
  assert.equal(wallpaperFileName(VALID_ID), VALID_NAME)
})

// ---------------------------------------------------------------------------
// request parsing / file-name validation
// ---------------------------------------------------------------------------

test('a well-formed wallpaper file name is accepted', () => {
  assert.equal(isWallpaperFileName(VALID_NAME), true)
})

test('anything else is refused as a file name', () => {
  for (const name of [
    `${VALID_ID}.png`,
    `${VALID_ID.toUpperCase()}.jpg`,
    `${'a'.repeat(31)}.jpg`,
    `${'a'.repeat(33)}.jpg`,
    `${VALID_ID}.jpg.exe`,
    '../secret.jpg',
    'sub/dir.jpg',
    '',
  ]) {
    assert.equal(isWallpaperFileName(name), false, `expected ${JSON.stringify(name)} to be refused`)
  }
})

test('a GET addresses the file after the prefix', () => {
  assert.equal(parseWallpaperRequest(`${WALLPAPER_ROUTE_PREFIX}/${VALID_NAME}`), VALID_NAME)
})

test('a query string does not become part of the file name', () => {
  assert.equal(parseWallpaperRequest(`${WALLPAPER_ROUTE_PREFIX}/${VALID_NAME}?v=2`), VALID_NAME)
})

test('the prefix alone addresses no file', () => {
  assert.equal(parseWallpaperRequest(WALLPAPER_ROUTE_PREFIX), undefined)
  assert.equal(parseWallpaperRequest(`${WALLPAPER_ROUTE_PREFIX}/`), undefined)
  assert.equal(parseWallpaperRequest(undefined), undefined)
})

test('a traversal or foreign path is refused', () => {
  assert.equal(parseWallpaperRequest(`${WALLPAPER_ROUTE_PREFIX}/../settings`), undefined)
  assert.equal(parseWallpaperRequest(`${WALLPAPER_ROUTE_PREFIX}/sub/${VALID_NAME}`), undefined)
  assert.equal(parseWallpaperRequest('/plugins/other-package/wallpaper/x.jpg'), undefined)
  assert.equal(parseWallpaperRequest(`/elsewhere/${VALID_NAME}`), undefined)
})

// ---------------------------------------------------------------------------
// upload decoding
// ---------------------------------------------------------------------------

test('a base64 image data URL decodes to its exact bytes', () => {
  const bytes = new Uint8Array([255, 216, 255, 224, 0, 16])
  const decoded = decodeWallpaperUpload(dataUrlFor(bytes))
  assert.ok(decoded !== undefined)
  assert.deepEqual([...decoded], [...bytes])
})

test('png and webp uploads are accepted too', () => {
  const bytes = new Uint8Array([137, 80, 78, 71])
  assert.ok(decodeWallpaperUpload(dataUrlFor(bytes, 'image/png')) !== undefined)
  assert.ok(decodeWallpaperUpload(dataUrlFor(bytes, 'image/webp')) !== undefined)
})

test('a non-image or non-base64 body is refused', () => {
  for (const body of [
    undefined,
    null,
    42,
    '',
    'not a data url',
    'data:text/html;base64,PHNjcmlwdD4=',
    'data:image/jpeg;base64,!!!not-base64!!!',
    'data:image/svg+xml;base64,PHN2Zy8+',
  ]) {
    assert.equal(decodeWallpaperUpload(body as unknown), undefined, `expected ${String(body)} to be refused`)
  }
})

test('an oversized upload is refused', () => {
  const body = dataUrlFor(new Uint8Array(64))
  assert.ok(decodeWallpaperUpload(body, 128) !== undefined)
  assert.equal(decodeWallpaperUpload(body, 8), undefined)
})

test('the production ceiling is 3 MiB', () => {
  assert.equal(MAX_WALLPAPER_BYTES, 3 * 1024 * 1024)
})

test('the bridge body cap accommodates a maximum-size upload', () => {
  // A maximum image travels base64-inflated (4 characters per 3 bytes) inside
  // a JSON envelope; a cap that ignored that would reject exactly the uploads
  // the store advertises as acceptable.
  const worstCase = Math.ceil(MAX_WALLPAPER_BYTES / 3) * 4 + 4096
  assert.ok(
    worstCase < MAX_BRIDGE_BODY_BYTES,
    `a ${MAX_WALLPAPER_BYTES}-byte upload inflates to ~${worstCase} bytes, over the ${MAX_BRIDGE_BODY_BYTES}-byte cap`,
  )
})

// ---------------------------------------------------------------------------
// pruning
// ---------------------------------------------------------------------------

test('a referenced file is never pruned', () => {
  const now = 10 * PRUNE_GRACE_MS
  assert.equal(pruneableWallpaper(VALID_NAME, new Set([VALID_NAME]), 0, now), false)
})

test('an unreferenced file past the grace window is pruned', () => {
  const now = 10 * PRUNE_GRACE_MS
  assert.equal(pruneableWallpaper(VALID_NAME, new Set(), 0, now), true)
})

test('a fresh unreferenced file is spared so an in-flight upload survives', () => {
  const now = 10 * PRUNE_GRACE_MS
  assert.equal(pruneableWallpaper(VALID_NAME, new Set(), now - 1000, now), false)
})

test('files this store does not own are left alone', () => {
  const now = 10 * PRUNE_GRACE_MS
  assert.equal(pruneableWallpaper('notes.txt', new Set(), 0, now), false)
  assert.equal(pruneableWallpaper(`${VALID_ID}.png`, new Set(), 0, now), false)
})

// ---------------------------------------------------------------------------
// the on-disk store (real filesystem, temporary directory)
// ---------------------------------------------------------------------------

test('an image round-trips through the store directory', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  const bytes = new Uint8Array([255, 216, 255, 224, 1, 2, 3, 4])
  const name = await storeWallpaper(dir, bytes)
  assert.equal(name, wallpaperFileName(wallpaperId(bytes)))
  const read = await loadWallpaper(dir, name)
  assert.ok(read !== undefined)
  assert.deepEqual([...read], [...bytes])
})

test('storing the same image twice keeps one file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  const bytes = new Uint8Array([7, 7, 7, 7])
  const first = await storeWallpaper(dir, bytes)
  const second = await storeWallpaper(dir, bytes)
  assert.equal(first, second)
  assert.deepEqual(await readdir(dir), [first])
})

test('different images coexist', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  const a = await storeWallpaper(dir, new Uint8Array([1]))
  const b = await storeWallpaper(dir, new Uint8Array([2]))
  assert.notEqual(a, b)
  assert.equal((await readdir(dir)).length, 2)
})

test('an unknown or malformed name loads nothing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  await storeWallpaper(dir, new Uint8Array([1, 2]))
  assert.equal(await loadWallpaper(dir, wallpaperFileName('f'.repeat(32))), undefined)
  // Traversal and foreign extensions are refused before any path is built.
  assert.equal(await loadWallpaper(dir, '../settings.yaml'), undefined)
  assert.equal(await loadWallpaper(dir, `${'a'.repeat(32)}.png`), undefined)
})

test('an unreferenced file ages into pruneable', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  const name = await storeWallpaper(dir, new Uint8Array([3, 1, 4]))
  const old = new Date(Date.now() - 2 * PRUNE_GRACE_MS)
  await utimes(join(dir, name), old, old)
  const entries = await readdir(dir, { withFileTypes: true })
  const now = Date.now()
  const pruneable = [] as string[]
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const { mtimeMs } = await stat(join(dir, entry.name))
    if (pruneableWallpaper(entry.name, new Set(), mtimeMs, now)) pruneable.push(entry.name)
  }
  assert.deepEqual(pruneable, [name])
})

// ---------------------------------------------------------------------------
// referencedWallpaperNames — what a prune must protect
// ---------------------------------------------------------------------------

test('stored store URLs yield their file names', () => {
  const json = JSON.stringify([`${WALLPAPER_ROUTE_PREFIX}/${VALID_NAME}`])
  assert.deepEqual([...referencedWallpaperNames(json)], [VALID_NAME])
})

test('inline data URLs reference no file', () => {
  const json = JSON.stringify([dataUrlFor(new Uint8Array([1, 2, 3]))])
  assert.deepEqual([...referencedWallpaperNames(json)], [])
})

test('a mixed gallery protects only its store entries', () => {
  const json = JSON.stringify([
    dataUrlFor(new Uint8Array([1, 2, 3])),
    `${WALLPAPER_ROUTE_PREFIX}/${VALID_NAME}`,
  ])
  assert.deepEqual([...referencedWallpaperNames(json)], [VALID_NAME])
})

test('malformed or foreign galleries reference nothing', () => {
  for (const json of ['', 'not json', '{}', '42', 'null']) {
    assert.deepEqual([...referencedWallpaperNames(json)], [], `expected ${json} to reference nothing`)
  }
})

test('an entry that is not a well-formed wallpaper URL is ignored', () => {
  const json = JSON.stringify([
    `${WALLPAPER_ROUTE_PREFIX}/${VALID_ID}.png`,
    `${WALLPAPER_ROUTE_PREFIX}/../settings`,
    '/plugins/other-package/wallpaper/x.jpg',
    42,
    null,
  ])
  assert.deepEqual([...referencedWallpaperNames(json)], [])
})

// ---------------------------------------------------------------------------
// the browser-side fallback ladder
// ---------------------------------------------------------------------------

/** A fetch stub answering one canned response. */
function stubFetch(response: { ok: boolean; json: () => Promise<unknown> } | Error): FetchLike {
  return async () => {
    if (response instanceof Error) throw response
    return response
  }
}

const DATA_URL = dataUrlFor(new Uint8Array([1, 2, 3]))
const STORE_URL = `${WALLPAPER_ROUTE_PREFIX}/${VALID_NAME}`

test('a successful upload returns the store URL', async () => {
  const url = await persistWallpaper(DATA_URL, stubFetch({ ok: true, json: async () => ({ ok: true, url: STORE_URL }) }))
  assert.equal(url, STORE_URL)
})

test('a refused upload falls back to the data URL', async () => {
  const url = await persistWallpaper(DATA_URL, stubFetch({ ok: true, json: async () => ({ ok: false, error: 'nope' }) }))
  assert.equal(url, DATA_URL)
})

test('an http error falls back to the data URL', async () => {
  const url = await persistWallpaper(DATA_URL, stubFetch({ ok: false, json: async () => ({}) }))
  assert.equal(url, DATA_URL)
})

test('a missing node half falls back to the data URL', async () => {
  const url = await persistWallpaper(DATA_URL, stubFetch(new Error('fetch failed')))
  assert.equal(url, DATA_URL)
})

test('a malformed answer falls back to the data URL', async () => {
  const url = await persistWallpaper(DATA_URL, stubFetch({ ok: true, json: async () => ({ ok: true }) }))
  assert.equal(url, DATA_URL)
  const broken = await persistWallpaper(DATA_URL, stubFetch({ ok: true, json: async () => { throw new Error('bad json') } }))
  assert.equal(broken, DATA_URL)
})

test('an empty store URL is not treated as success', async () => {
  const url = await persistWallpaper(DATA_URL, stubFetch({ ok: true, json: async () => ({ ok: true, url: '' }) }))
  assert.equal(url, DATA_URL)
})

// ---------------------------------------------------------------------------
// deleting what a gallery edit orphans
// ---------------------------------------------------------------------------

const OTHER_ID = 'ffffffffffffffffffffffffffffffff'
const OTHER_NAME = `${OTHER_ID}.jpg`
const URL_ONE = `${WALLPAPER_ROUTE_PREFIX}/${VALID_NAME}`
const URL_TWO = `${WALLPAPER_ROUTE_PREFIX}/${OTHER_NAME}`

test('a store URL yields its file name', () => {
  assert.equal(wallpaperNameFromUrl(URL_ONE), VALID_NAME)
})

test('an inline data URL yields no file name', () => {
  assert.equal(wallpaperNameFromUrl(dataUrlFor(new Uint8Array([1, 2, 3]))), undefined)
  assert.equal(wallpaperNameFromUrl('https://example.com/photo.jpg'), undefined)
  assert.equal(wallpaperNameFromUrl(`${WALLPAPER_ROUTE_PREFIX}/../settings`), undefined)
})

test('the delete URL addresses the stored file', () => {
  assert.equal(wallpaperDeleteUrl(VALID_NAME), URL_ONE)
})

test('removing one image orphans exactly its file', () => {
  assert.deepEqual(wallpaperFilesToDelete([URL_ONE, URL_TWO], [URL_TWO]), [VALID_NAME])
})

test('clearing the gallery orphans every stored file', () => {
  assert.deepEqual(wallpaperFilesToDelete([URL_ONE, URL_TWO], []), [VALID_NAME, OTHER_NAME])
})

test('a file another slot still references is never deleted', () => {
  // Content addressing: the same image can back two gallery entries.
  assert.deepEqual(wallpaperFilesToDelete([URL_ONE, URL_ONE], [URL_ONE]), [])
  assert.deepEqual(wallpaperFilesToDelete([URL_ONE, URL_TWO], [URL_ONE]), [OTHER_NAME])
})

test('inline images orphan nothing', () => {
  const inline = dataUrlFor(new Uint8Array([9, 9, 9]))
  assert.deepEqual(wallpaperFilesToDelete([inline], []), [])
  assert.deepEqual(wallpaperFilesToDelete([], []), [])
})

test('a file dropped from two slots is deleted once', () => {
  assert.deepEqual(wallpaperFilesToDelete([URL_ONE, URL_ONE, URL_TWO], [URL_TWO]), [VALID_NAME])
})

// ---------------------------------------------------------------------------
// the browser-side delete call
// ---------------------------------------------------------------------------

/** A fetch stub recording every call it receives. */
function recordingFetch(fail = false): { calls: { url: string; method: string | undefined }[]; request: FetchLike } {
  const calls: { url: string; method: string | undefined }[] = []
  const request: FetchLike = async (url, init) => {
    calls.push({ url, method: init?.method })
    if (fail) throw new Error('offline')
    return { ok: true, json: async () => ({ ok: true }) }
  }
  return { calls, request }
}

test('forgetting a file issues a DELETE for it', async () => {
  const { calls, request } = recordingFetch()
  await forgetWallpapers([VALID_NAME], request)
  assert.deepEqual(calls, [{ url: URL_ONE, method: 'DELETE' }])
})

test('forgetting several files issues one DELETE each', async () => {
  const { calls, request } = recordingFetch()
  await forgetWallpapers([VALID_NAME, OTHER_NAME], request)
  assert.deepEqual(calls.map(call => call.url), [URL_ONE, URL_TWO])
})

test('forgetting nothing issues no request', async () => {
  const { calls, request } = recordingFetch()
  await forgetWallpapers([], request)
  assert.deepEqual(calls, [])
})

test('a failed delete never rejects and never blocks the next one', async () => {
  const seen: string[] = []
  const request: FetchLike = async (url) => {
    seen.push(url)
    throw new Error('offline')
  }
  await forgetWallpapers([VALID_NAME, OTHER_NAME], request)
  assert.deepEqual(seen, [URL_ONE, URL_TWO])
})

// ---------------------------------------------------------------------------
// the node-side delete
// ---------------------------------------------------------------------------

test('removing a stored file deletes it', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  const name = await storeWallpaper(dir, new Uint8Array([5, 4, 3]))
  assert.deepEqual(await readdir(dir), [name])
  assert.equal(await removeWallpaper(dir, name), true)
  assert.deepEqual(await readdir(dir), [])
})

test('removing an absent file reports false without throwing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  assert.equal(await removeWallpaper(dir, wallpaperFileName('a'.repeat(32))), false)
})

test('removing a malformed name never touches the filesystem', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fri-store-'))
  await storeWallpaper(dir, new Uint8Array([1]))
  assert.equal(await removeWallpaper(dir, '../settings.yaml'), false)
  assert.equal(await removeWallpaper(dir, `${'a'.repeat(32)}.png`), false)
  assert.equal((await readdir(dir)).length, 1)
})

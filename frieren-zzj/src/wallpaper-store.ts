/**
 * Wallpaper file store: content-addressed JPEG files under the harness home,
 * so the settings document carries a short URL instead of hundreds of
 * kilobytes of base64. Node half only; the URL and file-name grammar it shares
 * with the browser half lives in ./wallpaper-names.ts (which stays free of
 * `node:` imports so the browser bundle can reach it).
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isWallpaperFileName, wallpaperNameFromUrl } from './wallpaper-names.ts'

/** Largest upload the store accepts, in bytes. */
export const MAX_WALLPAPER_BYTES = 3 * 1024 * 1024

/**
 * How long the activation sweep spares an unreferenced file, in milliseconds.
 *
 * The only thing this window protects is an upload whose file has been written
 * but whose settings write has not landed yet — a gap of well under a second
 * on a healthy bridge. Five minutes is therefore generous, while keeping
 * genuinely orphaned files (a refused or abandoned upload) from lingering for
 * hours; explicit deletes ignore the window entirely.
 */
export const PRUNE_GRACE_MS = 5 * 60 * 1000

/** Accepted upload media types. */
const DATA_URL_PATTERN = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/

/**
 * Content address of one image.
 * @param bytes - the image payload.
 * @returns the first 32 hex characters of its SHA-256 digest.
 */
export function wallpaperId(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex').slice(0, 32)
}

/**
 * File name for one content address.
 * @param id - a {@link wallpaperId} result.
 * @returns the on-disk file name.
 */
export function wallpaperFileName(id: string): string {
  return `${id}.jpg`
}

/**
 * Decode one upload body into image bytes.
 * @param body - the parsed request body's `dataUrl` value.
 * @param maxBytes - size ceiling, injectable for tests.
 * @returns the decoded bytes, or undefined when the body is not a supported
 * image data URL within the ceiling.
 */
export function decodeWallpaperUpload(body: unknown, maxBytes: number = MAX_WALLPAPER_BYTES): Uint8Array | undefined {
  if (typeof body !== 'string') return undefined
  const base64 = DATA_URL_PATTERN.exec(body)?.[1]
  if (base64 === undefined) return undefined
  const bytes = Buffer.from(base64, 'base64')
  if (bytes.length === 0 || bytes.length > maxBytes) return undefined
  return new Uint8Array(bytes)
}

/**
 * Write one image into the store directory.
 * @param directory - store directory (created when missing).
 * @param bytes - the image payload.
 * @returns the stored file name; an identical image already stored is kept.
 */
export async function storeWallpaper(directory: string, bytes: Uint8Array): Promise<string> {
  const name = wallpaperFileName(wallpaperId(bytes))
  await mkdir(directory, { recursive: true })
  // Content-addressed, so an existing file already holds these exact bytes.
  await writeFile(join(directory, name), bytes, { flag: 'wx' }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'EEXIST') throw error
  })
  return name
}

/**
 * Read one stored image.
 * @param directory - store directory.
 * @param name - requested file name (validated before any path is built).
 * @returns the bytes, or undefined when the name is not a store file or the
 * file is gone.
 */
export async function loadWallpaper(directory: string, name: string): Promise<Uint8Array | undefined> {
  // Validate before joining: a traversal segment can never reach the filesystem.
  if (!isWallpaperFileName(name)) return undefined
  return readFile(join(directory, name)).catch(() => undefined)
}

/**
 * Delete one stored image. Explicit intent, so the prune grace window does not
 * apply: a user removing an image expects the bytes gone now.
 * @param directory - store directory.
 * @param name - requested file name (validated before any path is built).
 * @returns whether a file was actually removed; an absent file is not an error.
 */
export async function removeWallpaper(directory: string, name: string): Promise<boolean> {
  // Validate before joining: a traversal segment can never reach the filesystem.
  if (!isWallpaperFileName(name)) return false
  return unlink(join(directory, name)).then(() => true).catch(() => false)
}

/**
 * Which stored files the settings still reference.
 *
 * This decides what a prune is allowed to delete, so it is strict on purpose:
 * only a `…/<name>` tail matching {@link isWallpaperFileName} counts. Legacy
 * inline data URLs — which contain slashes inside their own payload — and any
 * other stray string simply reference nothing.
 * @param customWallpapers - the stored gallery JSON (array of URLs).
 * @returns the file names in use.
 */
export function referencedWallpaperNames(customWallpapers: unknown): Set<string> {
  const names = new Set<string>()
  if (typeof customWallpapers !== 'string' || customWallpapers === '') return names
  let parsed: unknown
  try {
    parsed = JSON.parse(customWallpapers)
  } catch {
    return names
  }
  if (!Array.isArray(parsed)) return names
  for (const entry of parsed) {
    if (typeof entry !== 'string') continue
    const name = wallpaperNameFromUrl(entry)
    if (name !== undefined) names.add(name)
  }
  return names
}

/**
 * Whether a stored file may be deleted because nothing references it.
 * @param name - directory entry name.
 * @param referenced - file names the current settings still use.
 * @param mtimeMs - the file's modification time.
 * @param nowMs - the current time.
 * @returns true only for an unreferenced wallpaper file past the grace window.
 */
export function pruneableWallpaper(
  name: string,
  referenced: ReadonlySet<string>,
  mtimeMs: number,
  nowMs: number,
): boolean {
  if (!isWallpaperFileName(name)) return false
  if (referenced.has(name)) return false
  // The grace window keeps an upload that has been written but not yet stored
  // in the settings document from being swept away by a concurrent prune.
  return nowMs - mtimeMs > PRUNE_GRACE_MS
}

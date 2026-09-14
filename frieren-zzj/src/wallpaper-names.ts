/**
 * The wallpaper store's URL and file-name grammar, shared by both halves.
 *
 * This module is deliberately free of `node:` imports so the browser half can
 * import it (the store itself cannot reach the browser bundle). Everything
 * here decides which files may be deleted, so the rules are strict: only a
 * 32-hex-character name with the `.jpg` extension identifies a store file.
 */
import { WALLPAPER_ROUTE_PREFIX } from './routes.ts'

/** A stored wallpaper file name: 32 lowercase hex characters plus `.jpg`. */
const FILE_NAME_PATTERN = /^[0-9a-f]{32}\.jpg$/

/**
 * Whether a directory entry is a file this store owns.
 * @param name - directory entry name.
 * @returns true only for well-formed wallpaper file names.
 */
export function isWallpaperFileName(name: string): boolean {
  return FILE_NAME_PATTERN.test(name)
}

/**
 * The file name one gallery entry points at.
 * @param url - a gallery entry (store URL, or a legacy inline data URL).
 * @returns the file name, or undefined for anything that is not a store URL.
 */
export function wallpaperNameFromUrl(url: string): string | undefined {
  const name = url.slice(url.lastIndexOf('/') + 1)
  return isWallpaperFileName(name) ? name : undefined
}

/**
 * The URL a stored file is deleted through.
 * @param name - a validated wallpaper file name.
 * @returns the same-origin URL the browser half sends `DELETE` to.
 */
export function wallpaperDeleteUrl(name: string): string {
  return `${WALLPAPER_ROUTE_PREFIX}/${name}`
}

/**
 * Which stored files a gallery edit orphans.
 *
 * Entries are content-addressed, so the same file can back two gallery slots:
 * a file is dropped only when the new gallery references it nowhere. Inline
 * data URLs are ignored — they have no file behind them.
 * @param previous - the gallery before the edit.
 * @param next - the gallery after the edit.
 * @returns the file names to delete, deduplicated, in first-seen order.
 */
export function wallpaperFilesToDelete(previous: readonly string[], next: readonly string[]): string[] {
  const keep = new Set<string>()
  for (const entry of next) {
    const name = wallpaperNameFromUrl(entry)
    if (name !== undefined) keep.add(name)
  }
  const drop: string[] = []
  const dropped = new Set<string>()
  for (const entry of previous) {
    const name = wallpaperNameFromUrl(entry)
    if (name === undefined || keep.has(name) || dropped.has(name)) continue
    dropped.add(name)
    drop.push(name)
  }
  return drop
}

/**
 * Extract the requested file name from a route URL.
 * @param url - the raw request URL (path plus optional query).
 * @returns the file name, or undefined when the request does not address one.
 */
export function parseWallpaperRequest(url: string | undefined): string | undefined {
  if (url === undefined) return undefined
  const pathname = url.split('?')[0] ?? ''
  if (!pathname.startsWith(`${WALLPAPER_ROUTE_PREFIX}/`)) return undefined
  const name = pathname.slice(WALLPAPER_ROUTE_PREFIX.length + 1)
  return isWallpaperFileName(name) ? name : undefined
}

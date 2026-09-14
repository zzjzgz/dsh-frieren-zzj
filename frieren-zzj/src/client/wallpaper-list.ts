/**
 * Pure wallpaper-gallery logic: parsing the stored rotation list, resolving it
 * against the legacy single-wallpaper field, and choosing the next image. Kept
 * free of DOM and React imports so the math is unit-testable under
 * `node --test`.
 *
 * Storage note: rotation entries live in the settings document as data URLs
 * (one JSON array field), so the list is capped — every entry is a compressed
 * 1920px JPEG and the settings bridge refuses bodies beyond a few megabytes.
 */
import {
  MAX_WALLPAPERS,
  MIN_CAROUSEL_INTERVAL,
  MAX_CAROUSEL_INTERVAL,
  DEFAULT_CAROUSEL_INTERVAL,
  type WallpaperRotation,
} from '../frieren-settings.ts'

/**
 * Clamp a rotation interval into its slider range.
 * @param seconds - requested interval in seconds.
 * @returns the clamped interval, or the default when the value is not a number.
 */
export function clampInterval(seconds: number): number {
  if (!Number.isFinite(seconds)) return DEFAULT_CAROUSEL_INTERVAL
  return Math.max(MIN_CAROUSEL_INTERVAL, Math.min(MAX_CAROUSEL_INTERVAL, seconds))
}

/**
 * Parse the stored rotation list.
 * @param json - the stored JSON string (array of data URLs).
 * @returns the valid entries in order, capped at {@link MAX_WALLPAPERS}.
 */
export function parseWallpaperList(json: string): string[] {
  if (json === '') return []
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  const list: string[] = []
  for (const entry of parsed) {
    if (typeof entry !== 'string' || entry === '') continue
    list.push(entry)
    if (list.length === MAX_WALLPAPERS) break
  }
  return list
}

/**
 * The effective gallery for the current settings: the rotation list when it has
 * entries, otherwise the legacy single-wallpaper field.
 * @param single - the legacy `customWallpaper` data URL ('' = none).
 * @param json - the stored rotation list JSON.
 * @returns the ordered images to rotate through (empty = no wallpaper).
 */
export function resolveWallpaperList(single: string, json: string): string[] {
  const list = parseWallpaperList(json)
  if (list.length > 0) return list
  return single === '' ? [] : [single]
}

/**
 * Encode a gallery for storage.
 * @param list - the images to store.
 * @returns JSON for the settings document; '' for an empty gallery.
 */
export function encodeWallpaperList(list: readonly string[]): string {
  const clean = list.filter(entry => entry !== '').slice(0, MAX_WALLPAPERS)
  return clean.length === 0 ? '' : JSON.stringify(clean)
}

/**
 * Choose the image to show next.
 * @param current - index currently displayed (may be out of range).
 * @param length - gallery size.
 * @param rotation - rotation order.
 * @param rng - deterministic random source for tests; defaults to Math.random.
 * @returns the next index; 0 for a gallery of fewer than two images.
 */
export function nextWallpaperIndex(
  current: number,
  length: number,
  rotation: WallpaperRotation,
  rng: () => number = Math.random,
): number {
  if (length <= 1) return 0
  const normalized = Number.isFinite(current) ? Math.floor(current) : 0
  const index = ((normalized % length) + length) % length
  if (rotation === 'sequential') return (index + 1) % length
  const picked = Math.min(length - 1, Math.max(0, Math.floor(rng() * length)))
  // Shuffle may still land on the current image; step past it so the wallpaper
  // visibly changes on every rotation tick.
  return picked === index ? (index + 1) % length : picked
}

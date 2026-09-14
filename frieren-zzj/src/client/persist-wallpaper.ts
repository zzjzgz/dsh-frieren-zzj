/**
 * Browser-side wallpaper upload: hand the downscaled image to the node half's
 * file store so the settings document only carries a short URL. The store is
 * an optimization, never a requirement — every failure path falls back to the
 * inline data URL, which is exactly what older deployments already use.
 */
import { WALLPAPER_ROUTE_PREFIX } from '../routes.ts'
import { wallpaperDeleteUrl } from '../wallpaper-names.ts'

/** Minimal fetch surface, injectable so the fallbacks are unit-testable. */
export type FetchLike = (input: string, init?: {
  method?: string
  headers?: Record<string, string>
  body?: string
}) => Promise<{ ok: boolean; json: () => Promise<unknown> }>

/**
 * Delete stored images the gallery no longer references.
 *
 * Best effort by design: a delete that fails (offline, older node half) only
 * leaves a file for the next activation's sweep, so this never rejects and a
 * failure never blocks the remaining names.
 * @param names - validated store file names to delete.
 * @param request - fetch implementation (defaults to the global fetch).
 */
export async function forgetWallpapers(names: readonly string[], request: FetchLike = fetch as unknown as FetchLike): Promise<void> {
  for (const name of names) {
    try {
      await request(wallpaperDeleteUrl(name), { method: 'DELETE' })
    } catch {
      // Left for the next activation's sweep; the user's edit still stands.
    }
  }
}

/**
 * Store one wallpaper image, preferring the file store.
 * @param dataUrl - the downscaled `data:image/jpeg;base64,…` image.
 * @param request - fetch implementation (defaults to the global fetch).
 * @returns the URL to persist: a store URL on success, otherwise `dataUrl`.
 */
export async function persistWallpaper(dataUrl: string, request: FetchLike = fetch as unknown as FetchLike): Promise<string> {
  try {
    const response = await request(WALLPAPER_ROUTE_PREFIX, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    })
    if (!response.ok) return dataUrl
    const payload: unknown = await response.json()
    if (typeof payload !== 'object' || payload === null) return dataUrl
    const { ok, url } = payload as { ok?: unknown; url?: unknown }
    if (ok !== true || typeof url !== 'string' || url === '') return dataUrl
    return url
  } catch {
    // Missing node half, offline, or a broken answer: keep the inline image.
    return dataUrl
  }
}

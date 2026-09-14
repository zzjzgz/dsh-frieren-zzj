/**
 * Pure composers for the custom wallpaper layer's inline styles. Kept free of
 * DOM and React imports so the logic is unit-testable under `node --test`.
 */
import { MAX_WALLPAPER_DIM } from '../frieren-settings.ts'

/**
 * Compose the wallpaper layer's `background-image` value: the uploaded image
 * with an optional darkening gradient stacked on top for text readability.
 * The dim percentage is clamped to 0–80; 0 produces the bare `url(...)` so the
 * no-dim rendering stays byte-identical to the pre-feature behavior.
 * @param custom - the wallpaper image URL (data URL); empty yields ''.
 * @param dim - requested dim percentage (0–80, out-of-range clamped).
 * @returns the CSS `background-image` value.
 */
export function wallpaperLayerBackground(custom: string, dim: number): string {
  if (custom === '') return ''
  const clamped = Math.max(0, Math.min(MAX_WALLPAPER_DIM, dim))
  const url = `url("${custom}")`
  if (clamped <= 0) return url
  const shade = `rgba(0, 0, 0, ${clamped / 100})`
  return `linear-gradient(${shade}, ${shade}), ${url}`
}

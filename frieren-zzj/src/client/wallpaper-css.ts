/**
 * Pure composers for the custom wallpaper layers: each image layer's inline
 * styles, the veil that keeps text readable over them, and the transparency
 * sheet that lets them show through the app frame. Kept free of DOM and React
 * imports so the logic is unit-testable under `node --test`.
 *
 * A wallpaper is three fixed layers stacked behind the app frame:
 *
 * - `[data-frieren-wallpaper-layer]` ×2 — the image slots the carousel's
 *   fly-through animates (the live one, plus the incoming one flying in);
 * - `[data-frieren-wallpaper-veil]` — the palette-colored veil, on top of both,
 *   so a swap can never flash the un-veiled image and the dim slider is a plain
 *   opacity write instead of a background-string rebuild.
 *
 * Lifting the veil out of the image's own `background-image` stack is what makes
 * the two-layer animation possible: an image layer now carries nothing but the
 * picture, so it can fly, blur and fade without dragging the readability layer
 * along with it.
 */
import { MAX_WALLPAPER_DIM } from '../frieren-settings.ts'
import { WALLPAPER_REST_SCALE } from './wallpaper-transition.ts'

/**
 * Custom property carrying the veil color as an `R, G, B` triple. The veil
 * layer reads it, so a single declaration flips the veil with the palette
 * without repainting anything: the dark palette shades the wallpaper black, the
 * light palette mists it white.
 */
export const WALLPAPER_SCRIM_RGB_VARIABLE = '--fri-wallpaper-scrim-rgb'

/** Fallback `R, G, B` triple of the veil: the dark palette's black, so a veil
 * mounted before the palette attribute lands still renders the pre-fix result. */
const SCRIM_RGB_DARK = '0, 0, 0'

/** Veil color of the light palette: near-black ink needs a light veil. */
const SCRIM_RGB_LIGHT = '255, 255, 255'

/** Veil fill: whichever triple the active palette binds. */
export const WALLPAPER_VEIL_BACKGROUND = `rgb(var(${WALLPAPER_SCRIM_RGB_VARIABLE}, ${SCRIM_RGB_DARK}))`

/**
 * Inline CSS of one image layer: full-viewport, cover-fit, resting at the scale
 * the fly-through lands on so an animation can end on its own end frame without
 * a jump. No `background-attachment`, deliberately: it would anchor the
 * background to the viewport and force a re-rasterization per animation frame
 * instead of letting the layer composite. The caller adds `background-image`
 * and `z-index` per paint.
 */
export const WALLPAPER_LAYER_STYLE = `position:fixed;inset:0;overflow:hidden;pointer-events:none;background-position:center;background-size:cover;background-repeat:no-repeat;transform:scale(${WALLPAPER_REST_SCALE});transition:filter 0.3s ease;`

/** Inline CSS of the veil layer, stacked above both image layers. */
export const WALLPAPER_VEIL_STYLE = `position:fixed;inset:0;overflow:hidden;pointer-events:none;background:${WALLPAPER_VEIL_BACKGROUND};transition:opacity 0.3s ease;`

/**
 * The `background-image` value of an image layer. Only the picture: the veil is
 * its own layer (see the module doc), and the dim percentage never reaches this
 * string, so changing the dim cannot invalidate a running animation.
 * @param custom - the wallpaper image URL; empty yields '' (no paint).
 * @returns the CSS `background-image` value.
 */
export function wallpaperLayerImage(custom: string): string {
  if (custom === '') return ''
  return `url("${custom}")`
}

/**
 * Translate the stored dim percentage into the veil layer's opacity. Clamped to
 * the settings ceiling so a hand-edited document cannot veil past 80%.
 * @param dim - requested veil strength (0–80, out-of-range clamped).
 * @returns the opacity to write on the veil layer (0–0.8).
 */
export function wallpaperVeilOpacity(dim: number): number {
  return Math.max(0, Math.min(MAX_WALLPAPER_DIM, dim)) / 100
}

/**
 * Transparency sheet injected while a wallpaper is painted. The app frame
 * paints an opaque `--dsw-alias-bg-base` (and an opaque sidebar fill), which
 * would hide the layers behind it entirely, so the `data-frieren-wallpaper`
 * body attribute makes those surfaces see-through.
 *
 * Every surface that carries text keeps a palette-appropriate base instead of
 * going fully transparent:
 *
 * - the veil is white under the light palette (see
 *   {@link WALLPAPER_VEIL_BACKGROUND}), so the wallpaper is misted toward the
 *   near-black light ink rather than shaded away from it;
 * - the sidebar fill, the input card, and the message bubbles are re-bound to
 *   a strong translucent white in the light palette. Their defaults in that
 *   palette are near-white (`#f9fafb`, `#fff`, `#edf3fe`), so a fully
 *   transparent surface would drop near-black text straight onto the wallpaper
 *   and leave it unreadable on any dark image — at 62% white the text keeps
 *   its contrast even against a black one. The dark palette's values are
 *   untouched.
 */
export const WALLPAPER_TRANSPARENCY_CSS = `
body[data-frieren-wallpaper] {
  --dsw-alias-bg-base: transparent;
  --dsw-specific-sidebar-fill: transparent;
  --dsw-specific-input-major: rgba(255, 255, 255, 0.15);
  --dsw-specific-bubble: rgba(255, 255, 255, 0.12);
  ${WALLPAPER_SCRIM_RGB_VARIABLE}: ${SCRIM_RGB_DARK};
}
body[data-frieren-wallpaper]:not([data-ds-dark-theme]) {
  ${WALLPAPER_SCRIM_RGB_VARIABLE}: ${SCRIM_RGB_LIGHT};
  --dsw-specific-sidebar-fill: rgba(255, 255, 255, 0.62);
  --dsw-specific-input-major: rgba(255, 255, 255, 0.62);
  --dsw-specific-bubble: rgba(255, 255, 255, 0.62);
}
body[data-ds-dark-theme][data-frieren-wallpaper] {
  --dsw-specific-input-major: rgba(255, 255, 255, 0.06);
  --dsw-specific-bubble: rgba(255, 255, 255, 0.05);
}
`

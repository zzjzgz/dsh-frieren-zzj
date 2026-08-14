/**
 * Wallpaper tone variants and the overlay stylesheet generator.
 *
 * Tints are applied as body multi-layer backgrounds with
 * `background-blend-mode`: the tint gradient layer and the wallpaper image
 * layer live on the SAME element, so the blend is composited by the element's
 * own painting (no stacking-context / backdrop isolation issues — the
 * previous stage-div + mix-blend-mode approach could silently no-op in some
 * browsers). The overlay stylesheet only overrides `background-image` and
 * `background-blend-mode`; position/size/repeat keep the base rule's values.
 */

import type { WallpaperVariant } from '../frieren-settings.ts'

/** One tone variant: the light-scheme tint gradient and its blend mode. */
export interface WallpaperVariantDef {
  /** Light-scheme tint gradient layer; null = plain image (no overlay). */
  lightLayer: string | null
  /** Blend mode applied to the tint layer over the image. */
  blend: 'soft-light' | 'multiply' | 'overlay'
}

/** Dark-mode dim layer, mirroring the base wallpaper rule's dimming gradient. */
const DIM_LAYER = 'linear-gradient(rgba(15,16,32,0.36), rgba(15,16,32,0.36))'

/** The six built-in tone variants. */
export const WALLPAPER_VARIANT_DEFS: Record<WallpaperVariant, WallpaperVariantDef> = {
  default: { lightLayer: null, blend: 'soft-light' },
  dawn: {
    lightLayer: 'linear-gradient(160deg, rgba(244,178,138,0.30), rgba(214,168,210,0.26))',
    blend: 'soft-light',
  },
  dusk: {
    lightLayer: 'linear-gradient(165deg, rgba(214,132,66,0.34), rgba(98,74,140,0.30))',
    blend: 'soft-light',
  },
  violet: {
    lightLayer: 'linear-gradient(170deg, rgba(118,108,210,0.30), rgba(200,120,190,0.24))',
    blend: 'soft-light',
  },
  night: {
    lightLayer: 'linear-gradient(180deg, rgba(10,14,40,0.52), rgba(40,30,90,0.38))',
    blend: 'multiply',
  },
  sepia: {
    lightLayer: 'linear-gradient(90deg, rgba(150,110,70,0.30), rgba(110,80,50,0.34))',
    blend: 'multiply',
  },
}

/**
 * Generate the wallpaper overlay stylesheet for one variant + image source.
 * The image source is either the built-in `var(--fri-bg)` or a custom data
 * URL (JPEG base64 — contains no quote characters, safe inside url("…")).
 * The dark rule re-applies the dim layer ahead of the tint, so both modes
 * keep the base rule's dimming behavior.
 * @param variant - the active tone variant.
 * @param image - CSS url()/var() text for the wallpaper image layer.
 * @returns the stylesheet text; empty when no overlay is needed (default
 * variant with the built-in image).
 */
export function wallpaperOverlayCss(variant: WallpaperVariant, image: string): string {
  const def = WALLPAPER_VARIANT_DEFS[variant]
  if (def.lightLayer === null) {
    // Custom image only: replace the image layer (dim kept in dark mode).
    return `body { background-image: ${image} !important; }
@media (prefers-color-scheme: dark) {
  body { background-image: ${DIM_LAYER}, ${image} !important; }
}`
  }
  const lightLayers = `${def.lightLayer}, ${image}`
  const lightModes = `${def.blend}, normal`
  const darkLayers = `${DIM_LAYER}, ${def.lightLayer}, ${image}`
  const darkModes = `normal, ${def.blend}, normal`
  return `body { background-image: ${lightLayers} !important; background-blend-mode: ${lightModes}; }
@media (prefers-color-scheme: dark) {
  body { background-image: ${darkLayers} !important; background-blend-mode: ${darkModes}; }
}`
}

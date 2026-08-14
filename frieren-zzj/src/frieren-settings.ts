/** Durable settings owned by the Frieren theme plugin. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the plugin; persisted in the user-settings document. */
export const FRIEREN_SETTINGS_NAMESPACE = 'frieren-zzj'

/** Master wallpaper switch. */
export const WALLPAPER_FIELD = 'wallpaper'

/** Built-in wallpaper tone variant. */
export const WALLPAPER_VARIANT_FIELD = 'wallpaperVariant'

/** User-uploaded custom wallpaper, stored as a downscaled JPEG data URL. */
export const CUSTOM_WALLPAPER_FIELD = 'customWallpaper'

/** Perceived brightness (0..1) sampled from the uploaded custom wallpaper. */
export const CUSTOM_BRIGHTNESS_FIELD = 'customWallpaperBrightness'

/** How much the content area separates from the wallpaper behind it. */
export const CONTENT_BACKDROP_FIELD = 'contentBackdrop'

/** Per-element decoration switches (kept flat so each rides one settings path). */
export const DECOR_SPARKLES_FIELD = 'decorSparkles'
export const DECOR_FLOWERS_FIELD = 'decorFlowers'
export const DECOR_CIRCLE_FIELD = 'decorCircle'
export const DECOR_RIBBON_FIELD = 'decorRibbon'
export const DECOR_VIGNETTE_FIELD = 'decorVignette'

/** Quote rotation mode for the composer dock line. */
export const QUOTE_MODE_FIELD = 'quoteMode'

/**
 * Built-in wallpaper tone variants. The tint is applied through body
 * multi-layer backgrounds with `background-blend-mode` (see
 * ./client/variants.ts) — reliable across browsers, zero extra bytes.
 */
export const WALLPAPER_VARIANTS = ['default', 'dawn', 'dusk', 'violet', 'night', 'sepia'] as const
export type WallpaperVariant = typeof WALLPAPER_VARIANTS[number]

/** Quote rotation modes: one per day, random per change, or the fixed classic line. */
export const QUOTE_MODES = ['daily', 'random', 'fixed'] as const
export type QuoteMode = typeof QUOTE_MODES[number]

/** Content-backdrop separation modes. */
export const CONTENT_BACKDROP_MODES = ['auto', 'translucent', 'solid'] as const
export type ContentBackdropMode = typeof CONTENT_BACKDROP_MODES[number]

/** Defaults mirrored in the schema; reads fall back here while a settings document is absent or stale. */
export const DEFAULT_WALLPAPER_VARIANT: WallpaperVariant = 'default'
export const DEFAULT_QUOTE_MODE: QuoteMode = 'daily'
export const DEFAULT_CONTENT_BACKDROP: ContentBackdropMode = 'auto'

/**
 * Perceived-brightness threshold above which a custom wallpaper counts as
 * "bright or warm" and the auto content-backdrop mode goes solid.
 */
export const BRIGHT_CUSTOM_WALLPAPER_THRESHOLD = 0.6

/** The five toggleable decoration layers of the wallpaper stage. */
export interface DecorState {
  /** Twinkling gold / periwinkle star specks. */
  sparkles: boolean
  /** Falling blue moon weed blossoms. */
  flowers: boolean
  /** Top-right rotating magic circle. */
  circle: boolean
  /** Top tricolor ribbon. */
  ribbon: boolean
  /** Corner vignette. */
  vignette: boolean
}

/** Fully-resolved settings every consumer reads; every field is defined. */
export type ResolvedFrierenSettings = Required<FrierenSettings>

/** Durable section shared by the Host schema and the browser scope. */
export interface FrierenSettings {
  /** Show the watercolor wallpaper scene; off hides the background image and its stage decorations. */
  wallpaper: boolean
  /** Built-in wallpaper tone variant. */
  wallpaperVariant: WallpaperVariant
  /** Custom wallpaper data URL ('' = use the built-in image). */
  customWallpaper: string
  /** Perceived brightness (0..1) of the custom wallpaper, sampled at upload. */
  customWallpaperBrightness: number
  /** Content-area separation: auto solidifies for bright/warm custom wallpapers. */
  contentBackdrop: ContentBackdropMode
  /** Decoration layer switches (see {@link DecorState}). */
  decorSparkles: boolean
  decorFlowers: boolean
  decorCircle: boolean
  decorRibbon: boolean
  decorVignette: boolean
  /** Quote rotation mode for the composer dock line. */
  quoteMode: QuoteMode
}

/** Durable schema; also the wire envelope the browser scope validates against. */
export const FrierenSettingsSchema: z<FrierenSettings> = z.object({
  [WALLPAPER_FIELD]: z.boolean().default(true),
  [WALLPAPER_VARIANT_FIELD]: z.union([...WALLPAPER_VARIANTS]).default(DEFAULT_WALLPAPER_VARIANT),
  [CUSTOM_WALLPAPER_FIELD]: z.string().default(''),
  [CUSTOM_BRIGHTNESS_FIELD]: z.number().min(0).max(1).default(0),
  [CONTENT_BACKDROP_FIELD]: z.union([...CONTENT_BACKDROP_MODES]).default(DEFAULT_CONTENT_BACKDROP),
  [DECOR_SPARKLES_FIELD]: z.boolean().default(true),
  [DECOR_FLOWERS_FIELD]: z.boolean().default(true),
  [DECOR_CIRCLE_FIELD]: z.boolean().default(true),
  [DECOR_RIBBON_FIELD]: z.boolean().default(true),
  [DECOR_VIGNETTE_FIELD]: z.boolean().default(true),
  [QUOTE_MODE_FIELD]: z.union([...QUOTE_MODES]).default(DEFAULT_QUOTE_MODE),
})

/**
 * Narrow one wire value to a persistable wallpaper variant.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a built-in variant.
 */
export function isWallpaperVariant(value: unknown): value is WallpaperVariant {
  return WALLPAPER_VARIANTS.some(variant => variant === value)
}

/**
 * Narrow one wire value to a persistable quote mode.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a built-in quote mode.
 */
export function isQuoteMode(value: unknown): value is QuoteMode {
  return QUOTE_MODES.some(mode => mode === value)
}

/**
 * Narrow one wire value to a persistable content-backdrop mode.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a built-in backdrop mode.
 */
export function isContentBackdropMode(value: unknown): value is ContentBackdropMode {
  return CONTENT_BACKDROP_MODES.some(mode => mode === value)
}

/**
 * Resolve a possibly-stale or partial settings value into a complete section:
 * the wire envelope validates against the schema but returns the stored value
 * as-is (defaults are not materialized), so every consumer reads through here.
 * @param value - the scope's decoded section, or undefined before first load.
 * @returns the fully-defaulted settings object.
 */
export function resolveSettings(value: Partial<FrierenSettings> | undefined): ResolvedFrierenSettings {
  const brightness = value?.customWallpaperBrightness
  return {
    wallpaper: value?.wallpaper ?? true,
    wallpaperVariant: isWallpaperVariant(value?.wallpaperVariant) ? value.wallpaperVariant : DEFAULT_WALLPAPER_VARIANT,
    customWallpaper: value?.customWallpaper ?? '',
    customWallpaperBrightness: typeof brightness === 'number' && Number.isFinite(brightness)
      ? Math.min(1, Math.max(0, brightness))
      : 0,
    contentBackdrop: isContentBackdropMode(value?.contentBackdrop) ? value.contentBackdrop : DEFAULT_CONTENT_BACKDROP,
    decorSparkles: value?.decorSparkles ?? true,
    decorFlowers: value?.decorFlowers ?? true,
    decorCircle: value?.decorCircle ?? true,
    decorRibbon: value?.decorRibbon ?? true,
    decorVignette: value?.decorVignette ?? true,
    quoteMode: isQuoteMode(value?.quoteMode) ? value.quoteMode : DEFAULT_QUOTE_MODE,
  }
}

/**
 * Decide whether the content area should use a solid (near-opaque) backdrop
 * under the current settings.
 * @param settings - the resolved settings.
 * @returns whether the content backdrop should be solid.
 */
export function wantsSolidBackdrop(settings: ResolvedFrierenSettings): boolean {
  if (settings.contentBackdrop === 'solid') return true
  if (settings.contentBackdrop === 'translucent') return false
  return settings.customWallpaper !== '' && settings.customWallpaperBrightness > BRIGHT_CUSTOM_WALLPAPER_THRESHOLD
}

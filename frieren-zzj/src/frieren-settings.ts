/** Durable settings owned by the Frieren theme plugin. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the plugin; persisted in the user-settings document. */
export const FRIEREN_SETTINGS_NAMESPACE = 'frieren-zzj'

/** Master plugin switch: off removes every theme effect and returns the default UI. */
export const ENABLED_FIELD = 'enabled'

/** User-uploaded custom wallpaper, stored as a downscaled JPEG data URL. */
export const CUSTOM_WALLPAPER_FIELD = 'customWallpaper'

/** Wallpaper blur radius in pixels (0 = sharp, 20 = heavy blur). */
export const WALLPAPER_BLUR_FIELD = 'wallpaperBlur'

/** Blur ceiling in px: the radius the slider, the image layers, and the
 * fly-through's blur endpoints all clamp to. */
export const MAX_WALLPAPER_BLUR = 20

/** Wallpaper dim (darkening overlay) percentage: 0 = off, 80 = heaviest shade. */
export const WALLPAPER_DIM_FIELD = 'wallpaperDim'

/** Dim ceiling: the heaviest shade the slider offers (percent black overlay). */
export const MAX_WALLPAPER_DIM = 80

/** Wallpaper gallery: rotation entries as a JSON array of data URLs ('' = none). */
export const WALLPAPERS_FIELD = 'customWallpapers'

/** Rotation interval of the wallpaper gallery, in seconds. */
export const CAROUSEL_INTERVAL_FIELD = 'carouselInterval'

/** Rotation order of the wallpaper gallery. */
export const CAROUSEL_MODE_FIELD = 'carouselMode'

/** How many images the gallery may hold (every entry is a compressed JPEG). */
export const MAX_WALLPAPERS = 6

/** Rotation order identifiers for the wallpaper gallery. */
export const WALLPAPER_ROTATIONS = ['sequential', 'shuffle'] as const
/** Rotation order identifier. */
export type WallpaperRotation = typeof WALLPAPER_ROTATIONS[number]

/** Default rotation order. */
export const DEFAULT_CAROUSEL_MODE: WallpaperRotation = 'sequential'

/** Shortest rotation interval the slider offers, in seconds. */
export const MIN_CAROUSEL_INTERVAL = 5
/** Longest rotation interval the slider offers, in seconds. */
export const MAX_CAROUSEL_INTERVAL = 600
/** Interval a fresh install starts on, in seconds. */
export const DEFAULT_CAROUSEL_INTERVAL = 30

/** Input-bar material choice: frosted glass or the plain default surface. */
export const INPUT_MATERIAL_FIELD = 'inputMaterial'

/** Per-element decoration switches (kept flat so each rides one settings path). */
export const DECOR_SPARKLES_FIELD = 'decorSparkles'
export const DECOR_FLOWERS_FIELD = 'decorFlowers'
export const DECOR_CIRCLE_FIELD = 'decorCircle'
export const DECOR_RIBBON_FIELD = 'decorRibbon'
export const DECOR_VIGNETTE_FIELD = 'decorVignette'

/** Decoration tuning: element density, animation speed, magic-circle scale. */
export const DECOR_DENSITY_FIELD = 'decorDensity'
export const DECOR_SPEED_FIELD = 'decorSpeed'
export const CIRCLE_SCALE_FIELD = 'decorCircleScale'

/** Focus mode: hide the animated decorations, keep wallpaper and theme chrome. */
export const FOCUS_MODE_FIELD = 'focusMode'

/** Quote rotation mode for the composer dock line. */
export const QUOTE_MODE_FIELD = 'quoteMode'

/** Custom fixed quote text (empty = use built-in classic line). */
export const CUSTOM_QUOTE_FIELD = 'customQuote'

/** Custom random quote list (JSON string array; empty = use built-in library). */
export const CUSTOM_RANDOM_QUOTES_FIELD = 'customRandomQuotes'

/** Quote rotation modes: random per change, or the fixed line. */
export const QUOTE_MODES = ['random', 'fixed'] as const
export type QuoteMode = typeof QUOTE_MODES[number]

/** Defaults mirrored in the schema; reads fall back here while a settings document is absent or stale. */
export const DEFAULT_QUOTE_MODE: QuoteMode = 'random'

/**
 * Overall materials: `glass` applies the iOS-style frosted-glass treatment
 * to the input card, task list, goal bar, and settings panel
 * (semi-transparent background, moderate backdrop blur with saturation boost,
 * translucent white border, soft directional shadow, generous rounding —
 * light/dark variants baked in, not user-adjustable); `plain` restores the
 * default surfaces.
 */
export const INPUT_MATERIALS = ['glass', 'plain'] as const
export type InputMaterial = typeof INPUT_MATERIALS[number]

/** Default input-bar material. */
export const DEFAULT_INPUT_MATERIAL: InputMaterial = 'glass'

/** The five boolean decoration-layer keys of {@link DecorState}. */
export type DecorLayer = 'sparkles' | 'flowers' | 'circle' | 'ribbon' | 'vignette'

/** The five toggleable decoration layers of the wallpaper stage, plus their tuning. */
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
  /** Element density multiplier (0.25–2; 1 = the full set). */
  density: number
  /** Animation speed multiplier (2 = twice as fast). */
  speed: number
  /** Magic-circle scale multiplier. */
  circleScale: number
}

/** One custom quote entry for the random quote table. */
export interface CustomQuoteEntry {
  /** Quote text (the line shown in the dock). */
  text: string
  /** Speaker attribution (shown after the dash). */
  speaker: string
  /** Optional tooltip gloss. */
  gloss: string
}

/** Fully-resolved settings every consumer reads; every field is defined. */
export type ResolvedFrierenSettings = Required<FrierenSettings>

/** Durable section shared by the Host schema and the browser scope. */
export interface FrierenSettings {
  /** Master switch: off disables every theme effect (wallpaper, decorations, fonts, glass, quotes). */
  enabled: boolean
  /** Custom wallpaper data URL ('' = no wallpaper). */
  customWallpaper: string
  /** Wallpaper blur radius in px (0-20, 0 = no blur). */
  wallpaperBlur: number
  /** Wallpaper dim (darkening overlay) percentage (0-80, 0 = no shading). */
  wallpaperDim: number
  /** Wallpaper gallery rotation entries (JSON array of data URLs; '' = single wallpaper only). */
  customWallpapers: string
  /** Rotation interval of the gallery, in seconds (5-600). */
  carouselInterval: number
  /** Rotation order of the gallery. */
  carouselMode: WallpaperRotation
  /** Input-bar material: frosted glass or plain. */
  inputMaterial: InputMaterial
  /** Decoration layer switches (see {@link DecorState}). */
  decorSparkles: boolean
  decorFlowers: boolean
  decorCircle: boolean
  decorRibbon: boolean
  decorVignette: boolean
  /** Decoration tuning: element density (0.25–2), animation speed (0.25–4), magic-circle scale (0.5–2). */
  decorDensity: number
  decorSpeed: number
  decorCircleScale: number
  /** Focus mode: decorations off, wallpaper and theme chrome kept. */
  focusMode: boolean
  /** Quote rotation mode for the composer dock line. */
  quoteMode: QuoteMode
  /** Custom fixed quote text (empty = use built-in classic Himmel line). */
  customQuote: string
  /** Custom random quote list as JSON string array (empty = use built-in library). */
  customRandomQuotes: string
}

/** The full default section: what a fresh install and the "restore defaults" action produce. */
export const DEFAULT_FRIEREN_SETTINGS: ResolvedFrierenSettings = {
  [ENABLED_FIELD]: true,
  [CUSTOM_WALLPAPER_FIELD]: '',
  [WALLPAPER_BLUR_FIELD]: 0,
  [WALLPAPER_DIM_FIELD]: 0,
  [WALLPAPERS_FIELD]: '',
  [CAROUSEL_INTERVAL_FIELD]: DEFAULT_CAROUSEL_INTERVAL,
  [CAROUSEL_MODE_FIELD]: DEFAULT_CAROUSEL_MODE,
  [INPUT_MATERIAL_FIELD]: DEFAULT_INPUT_MATERIAL,
  [DECOR_SPARKLES_FIELD]: true,
  [DECOR_FLOWERS_FIELD]: true,
  [DECOR_CIRCLE_FIELD]: true,
  [DECOR_RIBBON_FIELD]: true,
  [DECOR_VIGNETTE_FIELD]: true,
  [DECOR_DENSITY_FIELD]: 1,
  [DECOR_SPEED_FIELD]: 1,
  [CIRCLE_SCALE_FIELD]: 1,
  [FOCUS_MODE_FIELD]: false,
  [QUOTE_MODE_FIELD]: DEFAULT_QUOTE_MODE,
  [CUSTOM_QUOTE_FIELD]: '',
  [CUSTOM_RANDOM_QUOTES_FIELD]: '',
}

/**
 * Durable schema; also the wire envelope the browser scope validates against.
 *
 * DSH 0.2 owns plugin settings as the owning Loader entry's `config`, so this
 * schema is exported as the node half's `Config` and every field is marked
 * volatile: volatile nodes are the ones the settings service may rewrite live
 * (`SettingsForms.update/replace/mutate`) without remounting the plugin, and an
 * entry whose schema exposes no volatile field is not described at all.
 *
 * No explicit `z<FrierenSettings>` annotation: a volatile schema's inferred
 * output is `Volatile<FrierenSettings>` at the type level, while every consumer
 * reads the plain section through {@link FrierenSettings} / {@link resolveSettings}.
 */
export const FrierenSettingsSchema = z.object({
  [ENABLED_FIELD]: z.boolean().default(true).volatile(),
  [CUSTOM_WALLPAPER_FIELD]: z.string().default('').volatile(),
  [WALLPAPER_BLUR_FIELD]: z.number().default(0).volatile(),
  [WALLPAPER_DIM_FIELD]: z.number().default(0).volatile(),
  [WALLPAPERS_FIELD]: z.string().default('').volatile(),
  [CAROUSEL_INTERVAL_FIELD]: z.number().default(DEFAULT_CAROUSEL_INTERVAL).volatile(),
  [CAROUSEL_MODE_FIELD]: z.union([...WALLPAPER_ROTATIONS]).default(DEFAULT_CAROUSEL_MODE).volatile(),
  [INPUT_MATERIAL_FIELD]: z.union([...INPUT_MATERIALS]).default(DEFAULT_INPUT_MATERIAL).volatile(),
  [DECOR_SPARKLES_FIELD]: z.boolean().default(true).volatile(),
  [DECOR_FLOWERS_FIELD]: z.boolean().default(true).volatile(),
  [DECOR_CIRCLE_FIELD]: z.boolean().default(true).volatile(),
  [DECOR_RIBBON_FIELD]: z.boolean().default(true).volatile(),
  [DECOR_VIGNETTE_FIELD]: z.boolean().default(true).volatile(),
  [DECOR_DENSITY_FIELD]: z.number().default(1).volatile(),
  [DECOR_SPEED_FIELD]: z.number().default(1).volatile(),
  [CIRCLE_SCALE_FIELD]: z.number().default(1).volatile(),
  [FOCUS_MODE_FIELD]: z.boolean().default(false).volatile(),
  [QUOTE_MODE_FIELD]: z.union([...QUOTE_MODES]).default(DEFAULT_QUOTE_MODE).volatile(),
  [CUSTOM_QUOTE_FIELD]: z.string().default('').volatile(),
  [CUSTOM_RANDOM_QUOTES_FIELD]: z.string().default('').volatile(),
})

/**
 * Narrow one wire value to a persistable quote mode.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a built-in quote mode.
 */
export function isQuoteMode(value: unknown): value is QuoteMode {
  return QUOTE_MODES.some(mode => mode === value)
}

/**
 * Narrow one wire value to a persistable input material.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a built-in material.
 */
export function isInputMaterial(value: unknown): value is InputMaterial {
  return INPUT_MATERIALS.some(material => material === value)
}

/**
 * Narrow one wire value to a persistable wallpaper rotation order.
 * @param value - value crossing the settings boundary.
 * @returns whether the value is a built-in rotation order.
 */
export function isWallpaperRotation(value: unknown): value is WallpaperRotation {
  return WALLPAPER_ROTATIONS.some(rotation => rotation === value)
}

/**
 * Parse the custom random quotes JSON string into an array of entries.
 * Returns an empty array on any parse failure or invalid shape.
 * @param json - the stored JSON string (array of {text, speaker, gloss?}).
 * @returns the parsed quote entries, or empty on failure.
 */
export function parseCustomQuotes(json: string): CustomQuoteEntry[] {
  if (json === '') return []
  try {
    const parsed: unknown = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    const result: CustomQuoteEntry[] = []
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue
      const obj = item as Record<string, unknown>
      if (typeof obj.text !== 'string' || typeof obj.speaker !== 'string') continue
      result.push({
        text: obj.text,
        speaker: obj.speaker,
        gloss: typeof obj.gloss === 'string' ? obj.gloss : '',
      })
    }
    return result
  } catch {
    return []
  }
}

/**
 * Resolve a possibly-stale or partial settings value into a complete section:
 * the wire envelope validates against the schema but returns the stored value
 * as-is (defaults are not materialized), so every consumer reads through here.
 * @param value - the scope's decoded section, or undefined before first load.
 * @returns the fully-defaulted settings object.
 */
export function resolveSettings(value: Partial<FrierenSettings> | undefined): ResolvedFrierenSettings {
  return {
    enabled: value?.enabled ?? true,
    customWallpaper: value?.customWallpaper ?? '',
    wallpaperBlur: typeof value?.wallpaperBlur === 'number' ? value.wallpaperBlur : 0,
    wallpaperDim: typeof value?.wallpaperDim === 'number' ? value.wallpaperDim : 0,
    customWallpapers: typeof value?.customWallpapers === 'string' ? value.customWallpapers : '',
    carouselInterval: typeof value?.carouselInterval === 'number' ? value.carouselInterval : DEFAULT_CAROUSEL_INTERVAL,
    carouselMode: isWallpaperRotation(value?.carouselMode) ? value.carouselMode : DEFAULT_CAROUSEL_MODE,
    inputMaterial: isInputMaterial(value?.inputMaterial) ? value.inputMaterial : DEFAULT_INPUT_MATERIAL,
    decorSparkles: value?.decorSparkles ?? true,
    decorFlowers: value?.decorFlowers ?? true,
    decorCircle: value?.decorCircle ?? true,
    decorRibbon: value?.decorRibbon ?? true,
    decorVignette: value?.decorVignette ?? true,
    decorDensity: typeof value?.decorDensity === 'number' ? value.decorDensity : 1,
    decorSpeed: typeof value?.decorSpeed === 'number' ? value.decorSpeed : 1,
    decorCircleScale: typeof value?.decorCircleScale === 'number' ? value.decorCircleScale : 1,
    focusMode: value?.focusMode ?? false,
    quoteMode: isQuoteMode(value?.quoteMode) ? value.quoteMode : DEFAULT_QUOTE_MODE,
    customQuote: value?.customQuote ?? '',
    customRandomQuotes: value?.customRandomQuotes ?? '',
  }
}

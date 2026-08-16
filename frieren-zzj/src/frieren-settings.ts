/** Durable settings owned by the Frieren theme plugin. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the plugin; persisted in the user-settings document. */
export const FRIEREN_SETTINGS_NAMESPACE = 'frieren-zzj'

/** Master wallpaper switch. */
export const WALLPAPER_FIELD = 'wallpaper'

/** User-uploaded custom wallpaper, stored as a downscaled JPEG data URL. */
export const CUSTOM_WALLPAPER_FIELD = 'customWallpaper'

/** Input-bar material choice: frosted glass or the plain default surface. */
export const INPUT_MATERIAL_FIELD = 'inputMaterial'

/** Per-element decoration switches (kept flat so each rides one settings path). */
export const DECOR_SPARKLES_FIELD = 'decorSparkles'
export const DECOR_FLOWERS_FIELD = 'decorFlowers'
export const DECOR_CIRCLE_FIELD = 'decorCircle'
export const DECOR_RIBBON_FIELD = 'decorRibbon'
export const DECOR_VIGNETTE_FIELD = 'decorVignette'

/** Quote rotation mode for the composer dock line. */
export const QUOTE_MODE_FIELD = 'quoteMode'

/** Quote rotation modes: one per day, random per change, or the fixed classic line. */
export const QUOTE_MODES = ['daily', 'random', 'fixed'] as const
export type QuoteMode = typeof QUOTE_MODES[number]

/** Defaults mirrored in the schema; reads fall back here while a settings document is absent or stale. */
export const DEFAULT_QUOTE_MODE: QuoteMode = 'daily'

/**
 * Input-bar materials: `glass` applies the fixed frosted-glass treatment
 * (article method: low-alpha background, strong backdrop blur, low-opacity
 * white border, layered shadow — light/dark variants baked in, not
 * user-adjustable); `plain` restores the default input-card surface.
 */
export const INPUT_MATERIALS = ['glass', 'plain'] as const
export type InputMaterial = typeof INPUT_MATERIALS[number]

/** Default input-bar material. */
export const DEFAULT_INPUT_MATERIAL: InputMaterial = 'glass'

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
  /** Custom wallpaper data URL ('' = use the built-in image). */
  customWallpaper: string
  /** Input-bar material: frosted glass or plain. */
  inputMaterial: InputMaterial
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
  [CUSTOM_WALLPAPER_FIELD]: z.string().default(''),
  [INPUT_MATERIAL_FIELD]: z.union([...INPUT_MATERIALS]).default(DEFAULT_INPUT_MATERIAL),
  [DECOR_SPARKLES_FIELD]: z.boolean().default(true),
  [DECOR_FLOWERS_FIELD]: z.boolean().default(true),
  [DECOR_CIRCLE_FIELD]: z.boolean().default(true),
  [DECOR_RIBBON_FIELD]: z.boolean().default(true),
  [DECOR_VIGNETTE_FIELD]: z.boolean().default(true),
  [QUOTE_MODE_FIELD]: z.union([...QUOTE_MODES]).default(DEFAULT_QUOTE_MODE),
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
 * Resolve a possibly-stale or partial settings value into a complete section:
 * the wire envelope validates against the schema but returns the stored value
 * as-is (defaults are not materialized), so every consumer reads through here.
 * @param value - the scope's decoded section, or undefined before first load.
 * @returns the fully-defaulted settings object.
 */
export function resolveSettings(value: Partial<FrierenSettings> | undefined): ResolvedFrierenSettings {
  return {
    wallpaper: value?.wallpaper ?? true,
    customWallpaper: value?.customWallpaper ?? '',
    inputMaterial: isInputMaterial(value?.inputMaterial) ? value.inputMaterial : DEFAULT_INPUT_MATERIAL,
    decorSparkles: value?.decorSparkles ?? true,
    decorFlowers: value?.decorFlowers ?? true,
    decorCircle: value?.decorCircle ?? true,
    decorRibbon: value?.decorRibbon ?? true,
    decorVignette: value?.decorVignette ?? true,
    quoteMode: isQuoteMode(value?.quoteMode) ? value.quoteMode : DEFAULT_QUOTE_MODE,
  }
}

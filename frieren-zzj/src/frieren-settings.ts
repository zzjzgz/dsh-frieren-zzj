/** Durable settings owned by the Frieren theme plugin. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the plugin; persisted in the user-settings document. */
export const FRIEREN_SETTINGS_NAMESPACE = 'frieren-zzj'

/** Master plugin switch: off removes every theme effect and returns the default UI. */
export const ENABLED_FIELD = 'enabled'

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
  /** Custom fixed quote text (empty = use built-in classic Himmel line). */
  customQuote: string
  /** Custom random quote list as JSON string array (empty = use built-in library). */
  customRandomQuotes: string
}

/** The full default section: what a fresh install and the "restore defaults" action produce. */
export const DEFAULT_FRIEREN_SETTINGS: ResolvedFrierenSettings = {
  [ENABLED_FIELD]: true,
  [CUSTOM_WALLPAPER_FIELD]: '',
  [INPUT_MATERIAL_FIELD]: DEFAULT_INPUT_MATERIAL,
  [DECOR_SPARKLES_FIELD]: true,
  [DECOR_FLOWERS_FIELD]: true,
  [DECOR_CIRCLE_FIELD]: true,
  [DECOR_RIBBON_FIELD]: true,
  [DECOR_VIGNETTE_FIELD]: true,
  [QUOTE_MODE_FIELD]: DEFAULT_QUOTE_MODE,
  [CUSTOM_QUOTE_FIELD]: '',
  [CUSTOM_RANDOM_QUOTES_FIELD]: '',
}

/** Durable schema; also the wire envelope the browser scope validates against. */
export const FrierenSettingsSchema: z<FrierenSettings> = z.object({
  [ENABLED_FIELD]: z.boolean().default(true),
  [CUSTOM_WALLPAPER_FIELD]: z.string().default(''),
  [INPUT_MATERIAL_FIELD]: z.union([...INPUT_MATERIALS]).default(DEFAULT_INPUT_MATERIAL),
  [DECOR_SPARKLES_FIELD]: z.boolean().default(true),
  [DECOR_FLOWERS_FIELD]: z.boolean().default(true),
  [DECOR_CIRCLE_FIELD]: z.boolean().default(true),
  [DECOR_RIBBON_FIELD]: z.boolean().default(true),
  [DECOR_VIGNETTE_FIELD]: z.boolean().default(true),
  [QUOTE_MODE_FIELD]: z.union([...QUOTE_MODES]).default(DEFAULT_QUOTE_MODE),
  [CUSTOM_QUOTE_FIELD]: z.string().default(''),
  [CUSTOM_RANDOM_QUOTES_FIELD]: z.string().default(''),
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
    inputMaterial: isInputMaterial(value?.inputMaterial) ? value.inputMaterial : DEFAULT_INPUT_MATERIAL,
    decorSparkles: value?.decorSparkles ?? true,
    decorFlowers: value?.decorFlowers ?? true,
    decorCircle: value?.decorCircle ?? true,
    decorRibbon: value?.decorRibbon ?? true,
    decorVignette: value?.decorVignette ?? true,
    quoteMode: isQuoteMode(value?.quoteMode) ? value.quoteMode : DEFAULT_QUOTE_MODE,
    customQuote: value?.customQuote ?? '',
    customRandomQuotes: value?.customRandomQuotes ?? '',
  }
}

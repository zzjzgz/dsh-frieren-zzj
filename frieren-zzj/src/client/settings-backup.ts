/**
 * Pure (de)serialization for the theme-settings backup file: export writes a
 * stable JSON document, import validates one field at a time so a hand-edited
 * or stale file can never crash the settings section. Free of DOM and React
 * imports so the validation is unit-testable under `node --test`.
 */
import {
  isInputMaterial, isQuoteMode, isWallpaperRotation,
  type FrierenSettings, type ResolvedFrierenSettings,
} from '../frieren-settings.ts'

/** Validation kind of one known settings field. */
type FieldKind = 'boolean' | 'string' | 'number' | 'inputMaterial' | 'quoteMode' | 'wallpaperRotation'

/**
 * Every recognized backup field and the kind its stored value must have.
 * A field absent from this table is dropped as unknown, which is what keeps
 * files written by older or newer plugin versions importable.
 */
const FIELD_KINDS: Readonly<Record<keyof FrierenSettings, FieldKind>> = Object.freeze({
  enabled: 'boolean',
  customWallpaper: 'string',
  wallpaperBlur: 'number',
  wallpaperDim: 'number',
  customWallpapers: 'string',
  carouselInterval: 'number',
  carouselMode: 'wallpaperRotation',
  inputMaterial: 'inputMaterial',
  decorSparkles: 'boolean',
  decorFlowers: 'boolean',
  decorCircle: 'boolean',
  decorRibbon: 'boolean',
  decorVignette: 'boolean',
  decorDensity: 'number',
  decorSpeed: 'number',
  decorCircleScale: 'number',
  focusMode: 'boolean',
  quoteMode: 'quoteMode',
  customQuote: 'string',
  customRandomQuotes: 'string',
})

/** Import outcome: the fields to apply plus the keys that were left out. */
export interface SettingsImportOk {
  ok: true
  /** Validated fields, ready to merge over the current settings. */
  value: Partial<FrierenSettings>
  /** Keys dropped because they are unknown or carry the wrong type. */
  skipped: string[]
}

/** Why a backup document could not be applied (localized by the row). */
export type SettingsImportErrorCode = 'invalid-json' | 'not-an-object' | 'no-fields'

/** Import failure: nothing to apply. */
export interface SettingsImportError {
  ok: false
  /** Machine-readable reason; the row localizes it. */
  error: SettingsImportErrorCode
}

/** Whether one wire value matches its field's expected kind. */
function matchesKind(value: unknown, kind: FieldKind): boolean {
  switch (kind) {
    case 'boolean': return typeof value === 'boolean'
    case 'string': return typeof value === 'string'
    case 'number': return typeof value === 'number' && Number.isFinite(value)
    case 'inputMaterial': return isInputMaterial(value)
    case 'quoteMode': return isQuoteMode(value)
    case 'wallpaperRotation': return isWallpaperRotation(value)
  }
  return false
}

/**
 * Serialize the current settings into the backup document.
 * @param settings - the fully-resolved settings section.
 * @returns pretty-printed JSON, stable in key order.
 */
export function serializeSettingsBackup(settings: ResolvedFrierenSettings): string {
  const ordered: Record<string, unknown> = {}
  for (const key of Object.keys(FIELD_KINDS) as (keyof FrierenSettings)[]) ordered[key] = settings[key]
  return `${JSON.stringify(ordered, null, 2)}\n`
}

/**
 * Parse and validate a backup document.
 * @param json - the file's text.
 * @returns either the validated fields (with the dropped keys) or an error.
 */
export function parseSettingsBackup(json: string): SettingsImportOk | SettingsImportError {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return { ok: false, error: 'invalid-json' }
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, error: 'not-an-object' }
  }
  const kinds: Record<string, FieldKind | undefined> = FIELD_KINDS
  const value: Record<string, unknown> = {}
  const skipped: string[] = []
  for (const [key, entry] of Object.entries(raw)) {
    const kind = kinds[key]
    if (kind === undefined || !matchesKind(entry, kind)) {
      skipped.push(key)
      continue
    }
    value[key] = entry
  }
  if (Object.keys(value).length === 0) {
    return { ok: false, error: 'no-fields' }
  }
  return { ok: true, value: value as Partial<FrierenSettings>, skipped }
}

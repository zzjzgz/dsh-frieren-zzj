/** Durable settings owned by the Frieren theme plugin. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the plugin; persisted in the user-settings document. */
export const FRIEREN_SETTINGS_NAMESPACE = 'frieren-zzj'

/** Field carrying the wallpaper switch. */
export const WALLPAPER_FIELD = 'wallpaper'

/** Durable section shared by the Host schema and the browser scope. */
export interface FrierenSettings {
  /** Show the watercolor wallpaper scene; off hides the background image and its stage decorations. */
  wallpaper: boolean
}

/** Durable schema; also the wire envelope the browser scope validates against. */
export const FrierenSettingsSchema: z<FrierenSettings> = z.object({
  [WALLPAPER_FIELD]: z.boolean().default(true),
})

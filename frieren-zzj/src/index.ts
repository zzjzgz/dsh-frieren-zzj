/**
 * Frieren × Himmel web theme, node half.
 *
 * The node half owns the plugin's user-facing settings: it registers the
 * `frieren-zzj` settings namespace (the wallpaper switch) so the value is
 * served to the browser half and persisted in the user-settings document.
 * Everything visual lives in the browser half.
 */
import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { FRIEREN_SETTINGS_NAMESPACE, FrierenSettingsSchema } from './frieren-settings.ts'

/** Host plugin body — register the wallpaper switch's durable section. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(settingsNamespace(FRIEREN_SETTINGS_NAMESPACE), FrierenSettingsSchema)
  })
}

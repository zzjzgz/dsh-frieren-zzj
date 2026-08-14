/**
 * Wallpaper switch row registered into the Frieren theme settings section:
 * title + description and a toggle that writes the durable `frieren-zzj`
 * settings section. The row reads the same observable the wallpaper
 * presentation is gated on, so its state always mirrors what the page
 * currently shows.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the settings SlotMap merge ('settings.general.item') into
// this program. Cross-plugin collaboration goes through the service, never a
// value import (client bundle purity gate).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './WallpaperRow.module.css'

/** Registrant-private business face: the durable write plus the enabled observable. */
export interface WallpaperRowInjected {
  /** Persist the wallpaper switch through the settings scope. */
  setWallpaper: (enabled: boolean) => void
  /** Bare observable the renderer binds as useWallpaperEnabled. */
  hooks: {
    wallpaperEnabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type WallpaperRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<WallpaperRowInjected>

/**
 * Render the wallpaper switch row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperRow({ t, setWallpaper, useWallpaperEnabled }: WallpaperRowProps) {
  const enabled = useWallpaperEnabled(value => value) ?? true
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('wallpaper.title')}</div>
        <div className={css.description}>{t('wallpaper.description')}</div>
      </div>
      <button
        type="button"
        className={css.switch}
        aria-pressed={enabled}
        aria-label={t('wallpaper.title')}
        onClick={() => { setWallpaper(!enabled) }}
      >
        <span className={css.track}><span className={css.knob} /></span>
        <span className={css.label}>{t(enabled ? 'wallpaper.on' : 'wallpaper.off')}</span>
      </button>
    </div>
  )
}

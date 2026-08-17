/**
 * Plugin master switch row, registered at the top of the Frieren theme
 * section: turning it off removes EVERY theme effect (token layer, chrome
 * stylesheet, wallpaper, stage, glass, seal, badge, quotes) so the app falls
 * back to its default look, while this row stays reachable to re-enable.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './WallpaperRow.module.css'

/** Registrant-private business face: the master write plus its observable. */
export interface EnableRowInjected {
  /** Persist the plugin master switch. */
  setEnabled: (enabled: boolean) => void
  /** Bare observable of the master switch state. */
  hooks: {
    enabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type EnableRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<EnableRowInjected>

/**
 * Render the plugin master switch row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function EnableRow({ t, setEnabled, useEnabled }: EnableRowProps) {
  const enabled = useEnabled(value => value) ?? true
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('enable.title')}</div>
        <div className={css.description}>{t('enable.description')}</div>
      </div>
      <button
        type="button"
        className={css.switch}
        aria-pressed={enabled}
        aria-label={t('enable.title')}
        onClick={() => { setEnabled(!enabled) }}
      >
        <span className={css.track}><span className={css.knob} /></span>
        <span className={css.label}>{t(enabled ? 'enable.on' : 'enable.off')}</span>
      </button>
    </div>
  )
}

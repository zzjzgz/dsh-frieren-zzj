/**
 * Focus-mode row in the Frieren theme section: one switch that hides the
 * animated decorations while keeping the wallpaper, palette, fonts, seal,
 * badge, and quote. The golden ring in the sidebar footer toggles the same
 * setting, so the row is the discoverable half of that shortcut.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './fri-rows.module.css'

/** Registrant-private business face: the focus write plus its observables. */
export interface FocusRowInjected {
  /** Persist the focus-mode switch. */
  setFocusMode: (focusMode: boolean) => void
  /** Bare observables of focus mode and the master switch. */
  hooks: {
    focus: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
    enabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type FocusRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<FocusRowInjected>

/**
 * Render the focus-mode row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function FocusRow({ t, setFocusMode, useFocus, useEnabled }: FocusRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const focus = useFocus(value => value) ?? false
  if (pluginEnabled === false) return null
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('focus.title')}</div>
        <div className={css.description}>{t('focus.description')}</div>
      </div>
      <button
        type="button"
        className={css.switch}
        aria-pressed={focus}
        aria-label={t('focus.title')}
        onClick={() => { setFocusMode(!focus) }}
      >
        <span className={css.track}><span className={css.knob} /></span>
        <span className={css.label}>{t(focus ? 'focus.on' : 'focus.off')}</span>
      </button>
    </div>
  )
}

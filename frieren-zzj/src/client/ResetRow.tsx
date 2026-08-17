/**
 * Restore-defaults row at the bottom of the Frieren theme section: one click
 * replaces the whole `frieren-zzj` section with the default values (which
 * also re-enables the plugin and drops stale fields from older versions).
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './fri-rows.module.css'

/** Registrant-private business face: the wholesale reset action. */
export interface ResetRowInjected {
  /** Replace the whole settings section with the defaults. */
  resetDefaults: () => void
}

/** Full component props: runtime share + locale seat + the injected face. */
export type ResetRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<ResetRowInjected>

/**
 * Render the restore-defaults row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function ResetRow({ t, resetDefaults }: ResetRowProps) {
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('reset.title')}</div>
        <div className={css.description}>{t('reset.description')}</div>
      </div>
      <button type="button" className={css.resetBtn} onClick={() => { resetDefaults() }}>
        {t('reset.button')}
      </button>
    </div>
  )
}

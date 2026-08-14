/**
 * Appearance row in the Frieren theme section: light / dark / system
 * segmented control. Writes through the theme service's own durable
 * `ui-theme` preference namespace, so it stays in sync with the built-in
 * Appearance row in the General section (same source of truth).
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ThemePreference } from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: the theme preference write plus the live preference observable. */
export interface SchemeRowInjected {
  /** Switch the app theme preference (persisted by the theme service). */
  setScheme: (preference: ThemePreference) => void
  /** Bare observable of the current theme preference. */
  hooks: {
    scheme: {
      getSnapshot(): ThemePreference
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type SchemeRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<SchemeRowInjected>

/** Segmented options in display order. */
const SCHEMES: readonly { id: ThemePreference; labelKey: FrierenLocaleKey }[] = [
  { id: 'light', labelKey: 'scheme.light' },
  { id: 'dark', labelKey: 'scheme.dark' },
  { id: 'system', labelKey: 'scheme.system' },
]

/**
 * Render the appearance segmented row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function SchemeRow({ t, setScheme, useScheme }: SchemeRowProps) {
  const preference = useScheme(value => value)
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('scheme.title')}</div>
        <div className={css.description}>{t('scheme.description')}</div>
      </div>
      <div className={css.segmented}>
        {SCHEMES.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={css.segBtn}
            aria-pressed={preference === id}
            onClick={() => { setScheme(id) }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}

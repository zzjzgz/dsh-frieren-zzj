/**
 * Content-backdrop row in the Frieren theme section: auto / translucent /
 * solid segmented control deciding how much the content area separates from
 * the wallpaper behind it. In auto mode a bright or warm custom wallpaper
 * (perceived brightness above threshold, sampled at upload) automatically
 * solidifies the content backdrop.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ContentBackdropMode } from '../frieren-settings.ts'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: the backdrop write plus its observable. */
export interface BackdropRowInjected {
  /** Persist the content-backdrop separation mode. */
  setBackdrop: (mode: ContentBackdropMode) => void
  /** Bare observable of the current backdrop mode. */
  hooks: {
    backdrop: {
      getSnapshot(): ContentBackdropMode
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type BackdropRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<BackdropRowInjected>

/** Segmented options in display order. */
const BACKDROP_MODES: readonly { id: ContentBackdropMode; labelKey: FrierenLocaleKey }[] = [
  { id: 'auto', labelKey: 'backdrop.auto' },
  { id: 'translucent', labelKey: 'backdrop.translucent' },
  { id: 'solid', labelKey: 'backdrop.solid' },
]

/**
 * Render the content-backdrop segmented row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function BackdropRow({ t, setBackdrop, useBackdrop }: BackdropRowProps) {
  const mode = useBackdrop(value => value) ?? 'auto'
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('backdrop.title')}</div>
        <div className={css.description}>{t('backdrop.description')}</div>
      </div>
      <div className={css.segmented}>
        {BACKDROP_MODES.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={css.segBtn}
            aria-pressed={mode === id}
            onClick={() => { setBackdrop(id) }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}

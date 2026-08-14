/**
 * Decoration toggle row in the Frieren theme section: one chip per stage
 * layer (sparkles, blossoms, magic circle, ribbon, vignette), each writing a
 * flat boolean field of the durable `frieren-zzj` settings section.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { DecorState } from '../frieren-settings.ts'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: per-layer writes plus the live decor state. */
export interface DecorRowInjected {
  /** Persist one decoration layer switch. */
  setDecor: (field: keyof DecorState, enabled: boolean) => void
  /** Bare observable of the full decoration state. */
  hooks: {
    decor: {
      getSnapshot(): DecorState
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type DecorRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<DecorRowInjected>

/** Chip list in display order. */
const DECOR_ITEMS: readonly { field: keyof DecorState; labelKey: FrierenLocaleKey }[] = [
  { field: 'sparkles', labelKey: 'decor.sparkles' },
  { field: 'flowers', labelKey: 'decor.flowers' },
  { field: 'circle', labelKey: 'decor.circle' },
  { field: 'ribbon', labelKey: 'decor.ribbon' },
  { field: 'vignette', labelKey: 'decor.vignette' },
]

/**
 * Render the decoration toggle row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function DecorRow({ t, setDecor, useDecor }: DecorRowProps) {
  const decor = useDecor(value => value)
  return (
    <div className={css.groupColumn}>
      <div className={css.copy}>
        <div className={css.title}>{t('decor.title')}</div>
        <div className={css.description}>{t('decor.description')}</div>
      </div>
      <div className={css.chipGrid}>
        {DECOR_ITEMS.map(({ field, labelKey }) => {
          const enabled = decor?.[field] ?? true
          return (
            <button
              key={field}
              type="button"
              className={css.chip}
              aria-pressed={enabled}
              onClick={() => { setDecor(field, !enabled) }}
            >
              {t(labelKey)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

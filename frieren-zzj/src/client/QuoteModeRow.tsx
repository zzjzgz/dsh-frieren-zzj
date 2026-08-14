/**
 * Quote mode row in the Frieren theme section: daily / random / fixed
 * segmented control for the composer dock line, writing the durable
 * `frieren-zzj` settings section.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { FrierenLocaleKey, } from './locales.ts'
import type { QuoteMode } from '../frieren-settings.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: the quote mode write plus its observable. */
export interface QuoteModeRowInjected {
  /** Persist the quote rotation mode. */
  setQuoteMode: (mode: QuoteMode) => void
  /** Bare observable of the current quote mode. */
  hooks: {
    quoteMode: {
      getSnapshot(): QuoteMode
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type QuoteModeRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<QuoteModeRowInjected>

/** Segmented options in display order. */
const QUOTE_MODES: readonly { id: QuoteMode; labelKey: FrierenLocaleKey }[] = [
  { id: 'daily', labelKey: 'quote.daily' },
  { id: 'random', labelKey: 'quote.random' },
  { id: 'fixed', labelKey: 'quote.fixed' },
]

/**
 * Render the quote mode segmented row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function QuoteModeRow({ t, setQuoteMode, useQuoteMode }: QuoteModeRowProps) {
  const mode = useQuoteMode(value => value) ?? 'daily'
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('quote.title')}</div>
        <div className={css.description}>{t('quote.description')}</div>
      </div>
      <div className={css.segmented}>
        {QUOTE_MODES.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={css.segBtn}
            aria-pressed={mode === id}
            onClick={() => { setQuoteMode(id) }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}

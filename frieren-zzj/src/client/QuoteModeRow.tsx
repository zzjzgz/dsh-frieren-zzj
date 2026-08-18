/**
 * Quote mode row in the Frieren theme section: random / fixed segmented
 * control for the composer dock line, plus a custom fixed-quote input and
 * a custom random-quote table editor. Writes the durable `frieren-zzj`
 * settings section.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { FrierenLocaleKey, } from './locales.ts'
import type { QuoteMode, CustomQuoteEntry } from '../frieren-settings.ts'
import { parseCustomQuotes } from '../frieren-settings.ts'
import * as React from 'react'
import css from './fri-rows.module.css'

/** Registrant-private business face: the quote mode write plus its observable. */
export interface QuoteModeRowInjected {
  /** Persist the quote rotation mode. */
  setQuoteMode: (mode: QuoteMode) => void
  /** Persist the custom fixed quote text. */
  setCustomQuote: (text: string) => void
  /** Persist the custom random quotes as a JSON string. */
  setCustomRandomQuotes: (json: string) => void
  /** Bare observable of the current quote mode. */
  hooks: {
    quoteMode: {
      getSnapshot(): QuoteMode
      subscribe(fn: () => void): () => void
    }
    customQuote: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    customRandomQuotes: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    enabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type QuoteModeRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<QuoteModeRowInjected>

/** Segmented options in display order. */
const QUOTE_MODES: readonly { id: QuoteMode; labelKey: FrierenLocaleKey }[] = [
  { id: 'random', labelKey: 'quote.random' },
  { id: 'fixed', labelKey: 'quote.fixed' },
]

/**
 * Render the quote mode segmented row with custom quote editors.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function QuoteModeRow({ t, setQuoteMode, setCustomQuote, setCustomRandomQuotes, useQuoteMode, useCustomQuote, useCustomRandomQuotes, useEnabled }: QuoteModeRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const mode = useQuoteMode(value => value) ?? 'random'
  const customQuote = useCustomQuote(value => value) ?? ''
  const customRandomQuotesJson = useCustomRandomQuotes(value => value) ?? ''
  if (pluginEnabled === false) return null

  // Parse the stored JSON into an editable array; keep a local state for the
  // table editing, syncing back to the settings scope on commit.
  const entries = React.useMemo(() => parseCustomQuotes(customRandomQuotesJson), [customRandomQuotesJson])
  const [tableRows, setTableRows] = React.useState<CustomQuoteEntry[]>(entries)
  const [dirty, setDirty] = React.useState(false)

  // Re-sync local state when the settings revision changes externally
  React.useEffect(() => {
    if (!dirty) {
      setTableRows(entries)
    }
  }, [entries, dirty])

  const commit = (rows: CustomQuoteEntry[]): void => {
    setTableRows(rows)
    setDirty(true)
    const json = rows.length > 0 ? JSON.stringify(rows) : ''
    setCustomRandomQuotes(json)
  }

  const addRow = (): void => {
    commit([...tableRows, { text: '', speaker: '', gloss: '' }])
  }

  const updateRow = (index: number, field: keyof CustomQuoteEntry, value: string): void => {
    const next = tableRows.map((row, i) => i === index ? { ...row, [field]: value } : row)
    commit(next)
  }

  const deleteRow = (index: number): void => {
    commit(tableRows.filter((_, i) => i !== index))
  }

  return (
    <div className={css.groupColumn}>
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

      {/* Custom fixed quote input — shown when mode is 'fixed' */}
      {mode === 'fixed' && (
        <div className={css.groupColumn} style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className={css.copy}>
            <div className={css.title}>{t('quote.custom.title')}</div>
            <div className={css.description}>{t('quote.custom.description')}</div>
          </div>
          <input
            type="text"
            className={css.textInput}
            value={customQuote}
            placeholder={t('quote.custom.placeholder')}
            onChange={(e) => { setCustomQuote(e.target.value) }}
          />
        </div>
      )}

      {/* Custom random quote table — shown when mode is 'random' */}
      {mode === 'random' && (
        <div className={css.groupColumn} style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className={css.copy}>
            <div className={css.title}>{t('quote.randomTable.title')}</div>
            <div className={css.description}>{t('quote.randomTable.description')}</div>
          </div>
          {tableRows.length === 0 ? (
            <div className={css.description}>{t('quote.randomTable.empty')}</div>
          ) : (
            <div className={css.quoteTable}>
              <div className={css.quoteTableHeader}>
                <span>{t('quote.randomTable.textHeader')}</span>
                <span>{t('quote.randomTable.speakerHeader')}</span>
                <span>{t('quote.randomTable.glossHeader')}</span>
                <span></span>
              </div>
              {tableRows.map((row, i) => (
                <div key={i} className={css.quoteTableRow}>
                  <input
                    type="text"
                    className={css.textInput}
                    value={row.text}
                    onChange={(e) => { updateRow(i, 'text', e.target.value) }}
                  />
                  <input
                    type="text"
                    className={css.textInput}
                    value={row.speaker}
                    onChange={(e) => { updateRow(i, 'speaker', e.target.value) }}
                  />
                  <input
                    type="text"
                    className={css.textInput}
                    value={row.gloss}
                    onChange={(e) => { updateRow(i, 'gloss', e.target.value) }}
                  />
                  <button
                    type="button"
                    className={css.clearBtn}
                    onClick={() => { deleteRow(i) }}
                  >
                    {t('quote.randomTable.deleteRow')}
                  </button>
                </div>
              ))}
            </div>
          )}
          <button type="button" className={css.uploadBtn} onClick={addRow}>
            {t('quote.randomTable.addRow')}
          </button>
        </div>
      )}
    </div>
  )
}

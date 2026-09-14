/**
 * Settings backup row in the Frieren theme section: export the whole theme
 * configuration as a JSON file, or import one back. Import validates each
 * field (see ../settings-backup.ts) and merges the recognized ones over the
 * current settings, so a partial or hand-edited file can never wipe unrelated
 * choices — that is what the restore-defaults row is for.
 */
import { useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { FrierenSettings, ResolvedFrierenSettings } from '../frieren-settings.ts'
import { parseSettingsBackup, serializeSettingsBackup, type SettingsImportErrorCode } from './settings-backup.ts'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** File name offered for the exported backup. */
const BACKUP_FILE = 'frieren-theme-settings.json'

/** Locale key of each import failure code. */
const ERROR_KEYS: Readonly<Record<SettingsImportErrorCode, FrierenLocaleKey>> = {
  'invalid-json': 'backup.error.invalidJson',
  'not-an-object': 'backup.error.notAnObject',
  'no-fields': 'backup.error.noFields',
}

/** Registrant-private business face: settings read/write for the backup row. */
export interface BackupRowInjected {
  /** Read the current resolved settings at click time (never a stale prop). */
  readSettings: () => ResolvedFrierenSettings
  /** Merge validated fields over the current settings. */
  importSettings: (value: Partial<FrierenSettings>) => void
  /** Bare observable of the master switch. */
  hooks: {
    enabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type BackupRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<BackupRowInjected>

/** Row-local status line. */
type Status =
  | { kind: 'idle' }
  | { kind: 'imported'; skipped: readonly string[] }
  | { kind: 'failed'; code: SettingsImportErrorCode }

/**
 * Render the export/import row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function BackupRow({ t, readSettings, importSettings, useEnabled }: BackupRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  if (pluginEnabled === false) return null

  const onExport = (): void => {
    const blob = new Blob([serializeSettingsBackup(readSettings())], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = BACKUP_FILE
    anchor.click()
    // Release the blob only after the download has been handed off: revoking
    // synchronously here cancels it in Firefox and Safari.
    setTimeout(() => { URL.revokeObjectURL(url) }, 1000)
  }

  const onImport = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    const parsed = parseSettingsBackup(await file.text())
    if (!parsed.ok) {
      setStatus({ kind: 'failed', code: parsed.error })
      return
    }
    importSettings(parsed.value)
    setStatus({ kind: 'imported', skipped: parsed.skipped })
  }

  return (
    <div className={css.groupColumn}>
      <div className={css.copy}>
        <div className={css.title}>{t('backup.title')}</div>
        <div className={css.description}>{t('backup.description')}</div>
      </div>
      <div className={css.uploadRow}>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(event) => {
            void onImport(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <button type="button" className={css.uploadBtn} onClick={onExport}>
          {t('backup.export')}
        </button>
        <button
          type="button"
          className={css.clearBtn}
          onClick={() => { inputRef.current?.click() }}
        >
          {t('backup.import')}
        </button>
      </div>
      {status.kind === 'imported' && (
        <div className={css.description}>
          {status.skipped.length === 0
            ? t('backup.imported')
            : `${t('backup.imported')} · ${t('backup.skippedLabel')}: ${status.skipped.join(', ')}`}
        </div>
      )}
      {status.kind === 'failed' && (
        <div className={css.error}>{`${t('backup.failedLabel')}: ${t(ERROR_KEYS[status.code])}`}</div>
      )}
    </div>
  )
}

/**
 * Custom wallpaper row in the Frieren theme section: upload a local image as
 * the wallpaper (stored as a downscaled JPEG data URL in the durable
 * `frieren-zzj` settings section), with a preview thumbnail and a
 * restore-built-in action.
 */
import { useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './fri-rows.module.css'

/** Registrant-private business face: the custom-wallpaper write plus its observable. */
export interface WallpaperUploadRowInjected {
  /** Persist an uploaded image as the custom wallpaper (downscaled data URL). */
  setCustomWallpaper: (dataUrl: string) => void
  /** Clear the custom wallpaper and return to the built-in image. */
  clearCustomWallpaper: () => void
  /** Bare observable of the custom wallpaper data URL. */
  hooks: {
    customWallpaper: {
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
export type WallpaperUploadRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<WallpaperUploadRowInjected>

/** Longest edge kept when downscaling an upload (keeps the stored value small). */
const MAX_EDGE = 1600

/** JPEG quality for the downscaled upload. */
const JPEG_QUALITY = 0.85

/**
 * Load an image file and return a downscaled JPEG data URL. Non-JPEG sources
 * (including transparent PNGs) are flattened onto the JPEG canvas.
 * @param file - the picked image file.
 * @returns a `data:image/jpeg;base64,…` URL.
 */
async function fileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = document.createElement('img')
      el.onload = () => { resolve(el) }
      el.onerror = () => { reject(new Error('image decode failed')) }
      el.src = objectUrl
    })
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (context === null) throw new Error('canvas 2d context unavailable')
    context.drawImage(image, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Render the custom wallpaper row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperUploadRow({ t, setCustomWallpaper, clearCustomWallpaper, useCustomWallpaper, useEnabled }: WallpaperUploadRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const custom = useCustomWallpaper(value => value) ?? ''
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  if (pluginEnabled === false) return null

  const onFile = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    setBusy(true)
    setFailed(false)
    try {
      setCustomWallpaper(await fileToDataUrl(file))
    } catch (_decodeFailure) {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={css.groupColumn}>
      <div className={css.copy}>
        <div className={css.title}>{t('wallpaper.upload.title')}</div>
        <div className={css.description}>{t('wallpaper.upload.description')}</div>
      </div>
      <div className={css.uploadRow}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(event) => {
            void onFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <button
          type="button"
          className={css.uploadBtn}
          disabled={busy}
          onClick={() => { inputRef.current?.click() }}
        >
          {t(busy ? 'wallpaper.upload.busy' : 'wallpaper.upload.button')}
        </button>
        {custom !== '' && (
          <button type="button" className={css.clearBtn} onClick={() => { clearCustomWallpaper() }}>
            {t('wallpaper.upload.clear')}
          </button>
        )}
        {custom !== '' && <img className={css.preview} src={custom} alt="" aria-hidden="true" />}
      </div>
      {failed && <div className={css.error}>{t('wallpaper.upload.error')}</div>}
    </div>
  )
}

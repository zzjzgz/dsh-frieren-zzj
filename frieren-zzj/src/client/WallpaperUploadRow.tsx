/**
 * Custom wallpaper row in the Frieren theme section: upload a local image as
 * the wallpaper (stored as a downscaled JPEG data URL in the durable
 * `frieren-zzj` settings section), with a preview thumbnail, a remove action,
 * and an opacity slider.
 */
import { useEffect, useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './fri-rows.module.css'

/** Registrant-private business face: the custom-wallpaper write plus its observable. */
export interface WallpaperUploadRowInjected {
  /** Persist an uploaded image as the custom wallpaper (downscaled data URL). */
  setCustomWallpaper: (dataUrl: string) => void
  /** Clear the custom wallpaper. */
  clearCustomWallpaper: () => void
  /** Persist the wallpaper opacity (0-100). */
  setWallpaperOpacity: (opacity: number) => void
  /** Bare observable of the custom wallpaper data URL. */
  hooks: {
    customWallpaper: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    wallpaperOpacity: {
      getSnapshot(): number
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
const MAX_EDGE = 1920

/** JPEG quality for the downscaled upload. */
const JPEG_QUALITY = 0.88

/**
 * Load an image file and return a downscaled JPEG data URL. Non-JPEG sources
 * (including transparent PNGs) are flattened onto the JPEG canvas.
 * @param file - the picked image file.
 * @returns a `data:image/jpeg;base64,...` URL.
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
 * Render the custom wallpaper row with upload, preview, remove, and opacity.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperUploadRow({ t, setCustomWallpaper, clearCustomWallpaper, setWallpaperOpacity, useCustomWallpaper, useWallpaperOpacity, useEnabled }: WallpaperUploadRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const custom = useCustomWallpaper(value => value) ?? ''
  const persistedOpacity = useWallpaperOpacity(value => value) ?? 100
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  // Local state for the slider: tracks the drag in real time so the UI is
  // responsive. The persisted value syncs back when settings load/confirm.
  const [dragOpacity, setDragOpacity] = useState(persistedOpacity)
  const inputRef = useRef<HTMLInputElement>(null)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when the persisted value changes externally (e.g. after
  // a confirmed write or a reset-to-defaults).
  useEffect(() => { setDragOpacity(persistedOpacity) }, [persistedOpacity])

  // Clean up the debounce timer on unmount.
  useEffect(() => {
    return () => { if (persistTimer.current !== null) clearTimeout(persistTimer.current) }
  }, [])

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

      {/* Opacity slider — only visible when a wallpaper is set.
           The slider uses local state for instant visual feedback; the DOM
           wallpaper layer's opacity is updated directly on input, while the
           persisted write is debounced so dragging doesn't flood the settings
           bridge with HTTP requests (the root cause of the laggy slider). */}
      {custom !== '' && (
        <div className={css.groupColumn} style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, borderBottom: 'none' }}>
          <div className={css.copy}>
            <div className={css.title}>{t('wallpaper.opacity.title')}</div>
            <div className={css.description}>{t('wallpaper.opacity.description')}</div>
          </div>
          <div className={css.sliderRow}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={dragOpacity}
              className={css.slider}
              onInput={(e) => {
                const v = Number(e.target.value)
                // 1. Instant local state (updates the % label).
                setDragOpacity(v)
                // 2. Directly poke the wallpaper layer's opacity (instant visual
                //    feedback — no round-trip through settings → HTTP → re-render).
                const layer = document.querySelector('[data-frieren-wallpaper-layer]')
                if (layer instanceof HTMLElement) {
                  layer.style.opacity = String(Math.max(0, Math.min(100, v)) / 100)
                }
                // 3. Debounce the persisted write so rapid drags don't spam
                //    the settings bridge with PUT requests.
                if (persistTimer.current !== null) clearTimeout(persistTimer.current)
                persistTimer.current = setTimeout(() => { setWallpaperOpacity(v) }, 400)
              }}
              onChange={(e) => {
                // Final commit on release (fires after the last onInput).
                const v = Number(e.target.value)
                setDragOpacity(v)
                if (persistTimer.current !== null) clearTimeout(persistTimer.current)
                setWallpaperOpacity(v)
              }}
            />
            <span className={css.sliderValue}>{dragOpacity}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

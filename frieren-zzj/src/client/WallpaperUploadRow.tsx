/**
 * Custom wallpaper row in the Frieren theme section: upload a local image as
 * the wallpaper (stored as a downscaled JPEG data URL in the durable
 * `frieren-zzj` settings section), with a preview thumbnail, a remove action,
 * and a blur slider with preset buttons.
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
  /** Persist the wallpaper blur radius in px (0-20). */
  setWallpaperBlur: (blur: number) => void
  /** Bare observable of the custom wallpaper data URL. */
  hooks: {
    customWallpaper: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    wallpaperBlur: {
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

/** Blur preset values. */
const BLUR_PRESETS: { value: number; labelKey: 'wallpaper.blur.none' | 'wallpaper.blur.light' | 'wallpaper.blur.medium' | 'wallpaper.blur.heavy' }[] = [
  { value: 0, labelKey: 'wallpaper.blur.none' },
  { value: 3, labelKey: 'wallpaper.blur.light' },
  { value: 8, labelKey: 'wallpaper.blur.medium' },
  { value: 15, labelKey: 'wallpaper.blur.heavy' },
]

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
 * Apply the blur filter directly to the wallpaper DOM layer for instant
 * visual feedback (no round-trip through settings → HTTP → re-render).
 * @param blurPx - the blur radius in pixels.
 */
function pokeLayerBlur(blurPx: number): void {
  const layer = document.querySelector('[data-frieren-wallpaper-layer]')
  if (layer instanceof HTMLElement) {
    const clamped = Math.max(0, Math.min(20, blurPx))
    layer.style.filter = clamped > 0 ? `blur(${clamped}px)` : 'none'
  }
}

/**
 * Render the custom wallpaper row with upload, preview, remove, and blur
 * slider with preset buttons.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperUploadRow({ t, setCustomWallpaper, clearCustomWallpaper, setWallpaperBlur, useCustomWallpaper, useWallpaperBlur, useEnabled }: WallpaperUploadRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const custom = useCustomWallpaper(value => value) ?? ''
  const persistedBlur = useWallpaperBlur(value => value) ?? 0
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  // Local state for the slider: tracks the drag in real time so the UI is
  // responsive. The persisted value syncs back when settings load/confirm.
  const [dragBlur, setDragBlur] = useState(persistedBlur)
  const inputRef = useRef<HTMLInputElement>(null)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when the persisted value changes externally (e.g. after
  // a confirmed write, a preset click, or a reset-to-defaults).
  useEffect(() => { setDragBlur(persistedBlur) }, [persistedBlur])

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

  /** Commit a blur value: update local state, poke the DOM layer, debounce the persisted write. */
  const commitBlur = (v: number, immediate = false): void => {
    const clamped = Math.max(0, Math.min(20, v))
    setDragBlur(clamped)
    pokeLayerBlur(clamped)
    if (persistTimer.current !== null) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => { setWallpaperBlur(clamped) }, immediate ? 0 : 400)
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

      {/* Blur slider + preset buttons — only visible when a wallpaper is set.
           The slider uses local state for instant visual feedback; the DOM
           wallpaper layer's filter is updated directly on input, while the
           persisted write is debounced so dragging doesn't flood the settings
           bridge with HTTP requests. Preset buttons commit immediately. */}
      {custom !== '' && (
        <div className={css.groupColumn} style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, borderBottom: 'none' }}>
          <div className={css.copy}>
            <div className={css.title}>{t('wallpaper.blur.title')}</div>
            <div className={css.description}>{t('wallpaper.blur.description')}</div>
          </div>
          <div className={css.sliderRow}>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={dragBlur}
              className={css.slider}
              onInput={(e) => {
                const v = Number((e.target as HTMLInputElement).value)
                commitBlur(v)
              }}
              onChange={(e) => {
                // Final commit on release (fires after the last onInput).
                const v = Number((e.target as HTMLInputElement).value)
                commitBlur(v, true)
              }}
            />
            <span className={css.sliderValue}>{dragBlur.toFixed(1)}px</span>
          </div>
          {/* Preset buttons */}
          <div className={css.presetRow}>
            {BLUR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={css.presetBtn}
                aria-pressed={Math.abs(dragBlur - preset.value) < 0.01}
                onClick={() => { commitBlur(preset.value, true) }}
              >
                {t(preset.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

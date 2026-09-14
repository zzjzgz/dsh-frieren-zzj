/**
 * Wallpaper gallery row in the Frieren theme section: upload local images into
 * a rotation gallery (each stored as a downscaled JPEG data URL in the durable
 * `frieren-zzj` settings section), remove them one by one or all at once, and
 * tune the blur and dim of whichever image is showing.
 *
 * The gallery supersedes the legacy single `customWallpaper` field: the first
 * edit folds that image into the list and clears it, and the resolver keeps
 * reading the legacy field until then, so an existing wallpaper survives the
 * upgrade untouched.
 */
import { useEffect, useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { MAX_WALLPAPERS, MAX_WALLPAPER_BLUR, MAX_WALLPAPER_DIM } from '../frieren-settings.ts'
import { wallpaperVeilOpacity } from './wallpaper-css.ts'
import { persistWallpaper, forgetWallpapers } from './persist-wallpaper.ts'
import { addWallpaper } from './wallpaper-add.ts'
import { wallpaperFilesToDelete } from '../wallpaper-names.ts'
import { resolveWallpaperList } from './wallpaper-list.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: the gallery writes plus their observables. */
export interface WallpaperUploadRowInjected {
  /** Persist the whole gallery (replaces the list and clears the legacy field). */
  setGallery: (list: readonly string[]) => void
  /** Clear the gallery and the legacy single-wallpaper field. */
  clearGallery: () => void
  /** Persist the wallpaper blur radius in px (0-20). */
  setWallpaperBlur: (blur: number) => void
  /** Persist the wallpaper dim percentage (0-80). */
  setWallpaperDim: (dim: number) => void
  /**
   * The gallery as it stands right now, read from the settings bridge rather
   * than a render snapshot: the capacity check runs while an upload is in
   * flight, where a stale length would let the gallery overflow.
   */
  readGallery: () => string[]
  /** Bare observables of the gallery, the legacy image, and the master switch. */
  hooks: {
    customWallpaper: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    customWallpapers: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    wallpaperBlur: {
      getSnapshot(): number
      subscribe(fn: () => void): () => void
    }
    wallpaperDim: {
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

/** Dim preset values, as a percentage of black overlay. */
const DIM_PRESETS: { value: number; labelKey: 'wallpaper.dim.none' | 'wallpaper.dim.light' | 'wallpaper.dim.medium' | 'wallpaper.dim.heavy' }[] = [
  { value: 0, labelKey: 'wallpaper.dim.none' },
  { value: 20, labelKey: 'wallpaper.dim.light' },
  { value: 40, labelKey: 'wallpaper.dim.medium' },
  { value: 60, labelKey: 'wallpaper.dim.heavy' },
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
 * Apply the blur filter directly to the wallpaper image layers for instant
 * visual feedback (no round-trip through settings → HTTP → re-render). Both
 * slots are written: whichever one the next fly-through uses must already rest
 * at the same blur, or the incoming image would snap into focus at the end.
 * @param blurPx - the blur radius in pixels.
 */
function pokeLayerBlur(blurPx: number): void {
  const clamped = Math.max(0, Math.min(MAX_WALLPAPER_BLUR, blurPx))
  const filter = clamped > 0 ? `blur(${clamped}px)` : 'none'
  for (const layer of document.querySelectorAll('[data-frieren-wallpaper-layer]')) {
    if (layer instanceof HTMLElement) layer.style.filter = filter
  }
}

/**
 * Apply the veil strength directly to the veil layer for instant visual
 * feedback. The veil is its own full-viewport layer above both image layers, so
 * this is a single opacity write — it cannot disturb a swap in flight, and the
 * dim percentage no longer has to be parsed back out of a background string.
 * @param dim - the dim percentage.
 */
function pokeLayerDim(dim: number): void {
  const veil = document.querySelector('[data-frieren-wallpaper-veil]')
  if (veil instanceof HTMLElement) veil.style.opacity = String(wallpaperVeilOpacity(dim))
}

/**
 * Render the wallpaper gallery row with upload, thumbnails, per-image removal,
 * clear-all, and the blur and dim sliders.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperUploadRow({ t, setGallery, clearGallery, setWallpaperBlur, setWallpaperDim, readGallery, useCustomWallpaper, useCustomWallpapers, useWallpaperBlur, useWallpaperDim, useEnabled }: WallpaperUploadRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const legacySingle = useCustomWallpaper(value => value) ?? ''
  const galleryJson = useCustomWallpapers(value => value) ?? ''
  const persistedBlur = useWallpaperBlur(value => value) ?? 0
  const persistedDim = useWallpaperDim(value => value) ?? 0
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [full, setFull] = useState(false)
  // Local state for the sliders: tracks the drag in real time so the UI is
  // responsive. The persisted value syncs back when settings load/confirm.
  const [dragBlur, setDragBlur] = useState(persistedBlur)
  const [dragDim, setDragDim] = useState(persistedDim)
  const inputRef = useRef<HTMLInputElement>(null)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dimTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const list = resolveWallpaperList(legacySingle, galleryJson)

  // Sync local state when the persisted value changes externally (e.g. after
  // a confirmed write, a preset click, or a reset-to-defaults).
  useEffect(() => { setDragBlur(persistedBlur) }, [persistedBlur])
  useEffect(() => { setDragDim(persistedDim) }, [persistedDim])

  // Clean up the debounce timers on unmount.
  useEffect(() => {
    return () => {
      if (persistTimer.current !== null) clearTimeout(persistTimer.current)
      if (dimTimer.current !== null) clearTimeout(dimTimer.current)
    }
  }, [])

  if (pluginEnabled === false) return null

  const onFile = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    setBusy(true)
    setFailed(false)
    setFull(false)
    try {
      // The flow and its ordering rules live in ./wallpaper-add.ts: capacity is
      // checked BEFORE anything is uploaded, so a refused pick never leaves a
      // file behind that no gallery entry references.
      const outcome = await addWallpaper({
        encode: () => fileToDataUrl(file),
        store: (dataUrl) => persistWallpaper(dataUrl),
        readGallery,
        commit: (next) => { setGallery(next) },
        forget: (names) => { void forgetWallpapers(names) },
      })
      if (outcome === 'full') setFull(true)
      else if (outcome === 'failed') setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  /**
   * Remove one gallery entry, and delete the file behind it when the edit
   * orphans that file. Entries are content-addressed, so a file another slot
   * still references is kept — the diff answers that, not the entry itself.
   * @param index - the entry to drop.
   */
  const removeAt = (index: number): void => {
    const next = list.filter((_, i) => i !== index)
    setGallery(next)
    void forgetWallpapers(wallpaperFilesToDelete(list, next))
  }

  /** Clear the whole gallery, deleting every file it was holding. */
  const clearAll = (): void => {
    clearGallery()
    void forgetWallpapers(wallpaperFilesToDelete(list, []))
  }

  /** Commit a blur value: update local state, poke the DOM layer, debounce the persisted write. */
  const commitBlur = (v: number, immediate = false): void => {
    const clamped = Math.max(0, Math.min(MAX_WALLPAPER_BLUR, v))
    setDragBlur(clamped)
    pokeLayerBlur(clamped)
    if (persistTimer.current !== null) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => { setWallpaperBlur(clamped) }, immediate ? 0 : 400)
  }

  /** Commit a dim value: update local state, poke the veil layer, debounce the persisted write. */
  const commitDim = (v: number, immediate = false): void => {
    const clamped = Math.max(0, Math.min(MAX_WALLPAPER_DIM, v))
    setDragDim(clamped)
    pokeLayerDim(clamped)
    if (dimTimer.current !== null) clearTimeout(dimTimer.current)
    dimTimer.current = setTimeout(() => { setWallpaperDim(clamped) }, immediate ? 0 : 400)
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
        {list.length > 0 && (
          <button type="button" className={css.clearBtn} onClick={() => { clearAll() }}>
            {t('wallpaper.upload.clear')}
          </button>
        )}
        {list.length > 0 && <span className={css.label}>{`${list.length}/${MAX_WALLPAPERS}`}</span>}
      </div>
      {failed && <div className={css.error}>{t('wallpaper.upload.error')}</div>}
      {full && <div className={css.error}>{t('wallpaper.gallery.full')}</div>}

      {/* Thumbnail strip: one entry per gallery image, each removable. The
           gallery rotates on its own row once it holds two or more. */}
      {list.length > 0 && (
        <div className={css.galleryRow}>
          {list.map((url, index) => (
            <span key={index} className={css.galleryItem}>
              <img className={css.preview} src={url} alt="" aria-hidden="true" />
              <button
                type="button"
                className={css.galleryRemove}
                aria-label={t('wallpaper.gallery.remove')}
                onClick={() => { removeAt(index) }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Blur slider + preset buttons — only visible when a wallpaper is set.
           The slider uses local state for instant visual feedback; the DOM
           wallpaper layer's filter is updated directly on input, while the
           persisted write is debounced so dragging doesn't flood the settings
           bridge with HTTP requests. Preset buttons commit immediately. */}
      {list.length > 0 && (
        <div className={css.groupColumn} style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, borderBottom: 'none' }}>
          <div className={css.copy}>
            <div className={css.title}>{t('wallpaper.blur.title')}</div>
            <div className={css.description}>{t('wallpaper.blur.description')}</div>
          </div>
          <div className={css.sliderRow}>
            <input
              type="range"
              min="0"
              max={MAX_WALLPAPER_BLUR}
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

      {/* Dim slider + preset buttons — darkens the wallpaper so text stays
           readable over busy images. Same instant-feedback strategy as blur:
           the DOM layer is re-composited on input, the persisted write is
           debounced, and presets commit immediately. */}
      {list.length > 0 && (
        <div className={css.groupColumn} style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0, borderBottom: 'none' }}>
          <div className={css.copy}>
            <div className={css.title}>{t('wallpaper.dim.title')}</div>
            <div className={css.description}>{t('wallpaper.dim.description')}</div>
          </div>
          <div className={css.sliderRow}>
            <input
              type="range"
              min="0"
              max={MAX_WALLPAPER_DIM}
              step="1"
              value={dragDim}
              className={css.slider}
              aria-label={t('wallpaper.dim.title')}
              onInput={(e) => {
                const v = Number((e.target as HTMLInputElement).value)
                commitDim(v)
              }}
              onChange={(e) => {
                // Final commit on release (fires after the last onInput).
                const v = Number((e.target as HTMLInputElement).value)
                commitDim(v, true)
              }}
            />
            <span className={css.sliderValue}>{dragDim}%</span>
          </div>
          {/* Preset buttons */}
          <div className={css.presetRow}>
            {DIM_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={css.presetBtn}
                aria-pressed={Math.abs(dragDim - preset.value) < 0.01}
                onClick={() => { commitDim(preset.value, true) }}
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

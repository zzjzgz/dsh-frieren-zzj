/**
 * Wallpaper tone row in the Frieren theme section: built-in tone chips
 * (day sky / dawn / dusk / violet / starry night / sepia) plus a local-image
 * upload that stores a downscaled JPEG data URL and its sampled perceived
 * brightness in the durable `frieren-zzj` settings section.
 */
import { useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { WallpaperVariant } from '../frieren-settings.ts'
import { WALLPAPER_VARIANTS } from '../frieren-settings.ts'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: tone/custom writes plus their observables. */
export interface VariantRowInjected {
  /** Persist the built-in tone variant. */
  setVariant: (variant: WallpaperVariant) => void
  /** Persist an uploaded image as the custom wallpaper (downscaled data URL). */
  setCustomWallpaper: (dataUrl: string) => void
  /** Persist the perceived brightness (0..1) sampled from the uploaded image. */
  setCustomBrightness: (brightness: number) => void
  /** Clear the custom wallpaper and return to the built-in image. */
  clearCustomWallpaper: () => void
  /** Bare observables of the tone variant and the custom wallpaper data URL. */
  hooks: {
    variant: {
      getSnapshot(): WallpaperVariant
      subscribe(fn: () => void): () => void
    }
    customWallpaper: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type VariantRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<VariantRowInjected>

/** Longest edge kept when downscaling an upload (keeps the stored value small). */
const MAX_EDGE = 1600

/** JPEG quality for the downscaled upload. */
const JPEG_QUALITY = 0.85

/** Probe canvas edge for the perceived-brightness sample. */
const PROBE_EDGE = 32

/**
 * Downscaled JPEG data URL plus perceived brightness (0..1) of an image
 * file. Non-JPEG sources (including transparent PNGs) are flattened onto the
 * JPEG canvas; brightness is sampled on a tiny probe canvas, so uploads of
 * any size cost one cheap getImageData read.
 */
export interface ProcessedUpload {
  /** `data:image/jpeg;base64,…` URL of the downscaled image. */
  dataUrl: string
  /** Perceived brightness in [0, 1] (Rec. 601 luma weights). */
  brightness: number
}

/**
 * Load an image file and produce the downscaled JPEG + brightness sample.
 * @param file - the picked image file.
 * @returns the processed upload.
 */
export async function fileToProcessedUpload(file: File): Promise<ProcessedUpload> {
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
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)

    // Perceived brightness from a 32×32 probe: Rec. 601 luma weights.
    const probe = document.createElement('canvas')
    probe.width = PROBE_EDGE
    probe.height = PROBE_EDGE
    const probeContext = probe.getContext('2d')
    if (probeContext === null) throw new Error('canvas 2d context unavailable')
    probeContext.drawImage(image, 0, 0, PROBE_EDGE, PROBE_EDGE)
    const pixels = probeContext.getImageData(0, 0, PROBE_EDGE, PROBE_EDGE).data
    let luma = 0
    for (let i = 0; i < pixels.length; i += 4) {
      luma += 0.299 * (pixels[i] ?? 0) + 0.587 * (pixels[i + 1] ?? 0) + 0.114 * (pixels[i + 2] ?? 0)
    }
    const brightness = luma / (pixels.length / 4) / 255
    return { dataUrl, brightness }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Render the wallpaper tone row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function VariantRow({
  t, setVariant, setCustomWallpaper, setCustomBrightness, clearCustomWallpaper, useVariant, useCustomWallpaper,
}: VariantRowProps) {
  const variant = useVariant(value => value) ?? 'default'
  const custom = useCustomWallpaper(value => value) ?? ''
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onFile = async (file: File | undefined): Promise<void> => {
    if (file === undefined) return
    setBusy(true)
    setFailed(false)
    try {
      const processed = await fileToProcessedUpload(file)
      setCustomWallpaper(processed.dataUrl)
      setCustomBrightness(processed.brightness)
    } catch (_decodeFailure) {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={css.groupColumn}>
      <div className={css.copy}>
        <div className={css.title}>{t('variant.title')}</div>
        <div className={css.description}>{t('variant.description')}</div>
      </div>
      <div className={css.chipGrid}>
        {WALLPAPER_VARIANTS.map((id) => (
          <button
            key={id}
            type="button"
            className={css.chip}
            aria-pressed={variant === id}
            onClick={() => { setVariant(id) }}
          >
            {t(`variant.${id}` as FrierenLocaleKey)}
          </button>
        ))}
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
          {t(busy ? 'variant.busy' : 'variant.upload')}
        </button>
        {custom !== '' && (
          <button type="button" className={css.clearBtn} onClick={() => { clearCustomWallpaper() }}>
            {t('variant.clear')}
          </button>
        )}
        {custom !== '' && <img className={css.preview} src={custom} alt="" aria-hidden="true" />}
      </div>
      {failed && <div className={css.error}>{t('upload.error')}</div>}
    </div>
  )
}

/**
 * Gallery rotation row: how often the wallpaper rotates and in which order.
 * It renders only while the gallery holds two or more images, so a single
 * wallpaper keeps the settings page uncluttered — the hooks still run
 * unconditionally, only the markup is gated.
 */
import { useEffect, useState } from 'react'
import * as React from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  MAX_CAROUSEL_INTERVAL, MIN_CAROUSEL_INTERVAL, WALLPAPER_ROTATIONS, type WallpaperRotation,
} from '../frieren-settings.ts'
import { clampInterval, resolveWallpaperList } from './wallpaper-list.ts'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** Locale key of each rotation order. */
const MODE_KEYS: Readonly<Record<WallpaperRotation, FrierenLocaleKey>> = {
  sequential: 'carousel.sequential',
  shuffle: 'carousel.shuffle',
}

/** Registrant-private business face: the rotation writes plus their observables. */
export interface WallpaperCarouselRowInjected {
  /** Persist the rotation interval in seconds. */
  setInterval: (seconds: number) => void
  /** Persist the rotation order. */
  setMode: (mode: WallpaperRotation) => void
  /** Bare observables of the gallery, the legacy single image, and the master switch. */
  hooks: {
    gallery: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    single: {
      getSnapshot(): string
      subscribe(fn: () => void): () => void
    }
    interval: {
      getSnapshot(): number
      subscribe(fn: () => void): () => void
    }
    mode: {
      getSnapshot(): WallpaperRotation
      subscribe(fn: () => void): () => void
    }
    enabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type WallpaperCarouselRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<WallpaperCarouselRowInjected>

/** Render an interval readout in seconds or whole minutes. */
function formatInterval(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  return `${Math.round(seconds / 60)}min`
}

/**
 * Render the gallery rotation row.
 * @param props - composed slot props.
 * @returns the row element tree, or null for a gallery of fewer than two images.
 */
export function WallpaperCarouselRow({ t, setInterval, setMode, useGallery, useSingle, useInterval, useMode, useEnabled }: WallpaperCarouselRowProps): React.ReactElement | null {
  const pluginEnabled = useEnabled(value => value)
  const gallery = useGallery(value => value) ?? ''
  const single = useSingle(value => value) ?? ''
  const persistedInterval = clampInterval(useInterval(value => value) ?? MIN_CAROUSEL_INTERVAL)
  const mode = useMode(value => value) ?? 'sequential'
  // Local state tracks the drag so the control stays responsive; the durable
  // write happens once on release.
  const [drag, setDrag] = useState(persistedInterval)
  useEffect(() => { setDrag(persistedInterval) }, [persistedInterval])

  if (pluginEnabled === false) return null
  const list = resolveWallpaperList(single, gallery)
  if (list.length < 2) return null

  return (
    <div className={css.groupColumn}>
      <div className={css.copy}>
        <div className={css.title}>{t('carousel.title')}</div>
        <div className={css.description}>{t('carousel.description')}</div>
      </div>
      <div className={css.sliderRow}>
        <span className={css.label}>{t('carousel.interval')}</span>
        <input
          type="range"
          min={MIN_CAROUSEL_INTERVAL}
          max={MAX_CAROUSEL_INTERVAL}
          step={5}
          value={drag}
          className={css.slider}
          aria-label={t('carousel.interval')}
          onInput={(event) => { setDrag(Number((event.target as HTMLInputElement).value)) }}
          onChange={(event) => {
            const value = clampInterval(Number((event.target as HTMLInputElement).value))
            setDrag(value)
            setInterval(value)
          }}
        />
        <span className={css.sliderValue}>{formatInterval(drag)}</span>
      </div>
      <div className={css.presetRow}>
        {WALLPAPER_ROTATIONS.map(rotation => (
          <button
            key={rotation}
            type="button"
            className={css.presetBtn}
            aria-pressed={mode === rotation}
            onClick={() => { setMode(rotation) }}
          >
            {t(MODE_KEYS[rotation])}
          </button>
        ))}
      </div>
    </div>
  )
}

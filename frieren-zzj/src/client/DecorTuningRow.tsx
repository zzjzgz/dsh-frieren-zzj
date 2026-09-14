/**
 * Decoration tuning row in the Frieren theme section: three sliders for the
 * decoration scene — element density (how many sparkles/blossoms), animation
 * speed (how fast they move), and the magic circle's scale. Writes the durable
 * `frieren-zzj` settings section.
 *
 * Feedback model: the slider's local state tracks the drag so the control
 * itself stays responsive, and the durable write happens once on release
 * (`onChange`). Unlike the wallpaper sliders there is no DOM layer to poke
 * imperatively — the stage re-renders from settings — so a per-input write
 * would only flood the settings bridge without speeding anything up.
 */
import { useEffect, useState } from 'react'
import * as React from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  MAX_CIRCLE_SCALE, MAX_DECOR_DENSITY, MAX_DECOR_SPEED,
  MIN_CIRCLE_SCALE, MIN_DECOR_DENSITY, MIN_DECOR_SPEED,
} from './decor-tuning.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: the tuning writes plus their observables. */
export interface DecorTuningRowInjected {
  /** Persist the element density multiplier. */
  setDensity: (value: number) => void
  /** Persist the animation speed multiplier. */
  setSpeed: (value: number) => void
  /** Persist the magic-circle scale multiplier. */
  setCircleScale: (value: number) => void
  /** Bare observables of the three tuning values plus the master switch. */
  hooks: {
    density: {
      getSnapshot(): number
      subscribe(fn: () => void): () => void
    }
    speed: {
      getSnapshot(): number
      subscribe(fn: () => void): () => void
    }
    circleScale: {
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
export type DecorTuningRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<DecorTuningRowInjected>

/** One labelled slider spec. */
interface SliderSpec {
  /** Locale key of the slider's label. */
  labelKey: 'decorTuning.density' | 'decorTuning.speed' | 'decorTuning.circleScale'
  min: number
  max: number
  step: number
  persisted: number
  /** Persist one committed value. */
  commit: (value: number) => void
}

/** Render one slider with its live value readout. */
function TuningSlider({ label, spec }: { label: string; spec: SliderSpec }): React.ReactElement {
  const [drag, setDrag] = useState(spec.persisted)

  // Sync local state when the persisted value changes externally (a confirmed
  // write, or a restore-to-defaults).
  useEffect(() => { setDrag(spec.persisted) }, [spec.persisted])

  return (
    <div className={css.sliderRow}>
      <span className={css.label}>{label}</span>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={drag}
        className={css.slider}
        aria-label={label}
        onInput={(event) => { setDrag(Number((event.target as HTMLInputElement).value)) }}
        onChange={(event) => {
          const value = Number((event.target as HTMLInputElement).value)
          setDrag(value)
          spec.commit(value)
        }}
      />
      <span className={css.sliderValue}>{drag.toFixed(2)}×</span>
    </div>
  )
}

/**
 * Render the decoration tuning row: density, speed, and magic-circle scale.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function DecorTuningRow({ t, setDensity, setSpeed, setCircleScale, useDensity, useSpeed, useCircleScale, useEnabled }: DecorTuningRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const density = useDensity(value => value) ?? 1
  const speed = useSpeed(value => value) ?? 1
  const circleScale = useCircleScale(value => value) ?? 1

  if (pluginEnabled === false) return null

  const sliders: readonly SliderSpec[] = [
    {
      labelKey: 'decorTuning.density',
      min: MIN_DECOR_DENSITY, max: MAX_DECOR_DENSITY, step: 0.05,
      persisted: density, commit: setDensity,
    },
    {
      labelKey: 'decorTuning.speed',
      min: MIN_DECOR_SPEED, max: MAX_DECOR_SPEED, step: 0.25,
      persisted: speed, commit: setSpeed,
    },
    {
      labelKey: 'decorTuning.circleScale',
      min: MIN_CIRCLE_SCALE, max: MAX_CIRCLE_SCALE, step: 0.05,
      persisted: circleScale, commit: setCircleScale,
    },
  ]

  return (
    <div className={css.groupColumn}>
      <div className={css.copy}>
        <div className={css.title}>{t('decorTuning.title')}</div>
        <div className={css.description}>{t('decorTuning.description')}</div>
      </div>
      {sliders.map(spec => (
        <TuningSlider key={spec.labelKey} label={t(spec.labelKey)} spec={spec} />
      ))}
      <div className={css.presetRow}>
        <button
          type="button"
          className={css.presetBtn}
          onClick={() => {
            setDensity(1)
            setSpeed(1)
            setCircleScale(1)
          }}
        >
          {t('decorTuning.reset')}
        </button>
      </div>
    </div>
  )
}

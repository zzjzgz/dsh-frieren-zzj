/**
 * Performance-tier row in the Frieren theme section: one click sets the
 * decoration density, the animation speed, and the material together, so a
 * weak GPU or a drained battery needs no slider-by-slider tuning. The row
 * highlights the tier the current values correspond to, and shows nothing
 * pressed once any of the three has been hand-tuned (a "custom" state).
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { InputMaterial } from '../frieren-settings.ts'
import { detectPerfTier, PERF_TIERS, type PerfTier } from './perf-tier.ts'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** Locale key of each tier's button. */
const TIER_LABELS: Readonly<Record<PerfTier['id'], FrierenLocaleKey>> = {
  full: 'perf.full',
  balanced: 'perf.balanced',
  eco: 'perf.eco',
}

/** Registrant-private business face: the tier write plus the live values. */
export interface PerfRowInjected {
  /** Apply one tier (density, speed, and material in one go). */
  setTier: (tier: PerfTier) => void
  /** Bare observables of the values a tier writes plus the master switch. */
  hooks: {
    density: {
      getSnapshot(): number
      subscribe(fn: () => void): () => void
    }
    speed: {
      getSnapshot(): number
      subscribe(fn: () => void): () => void
    }
    material: {
      getSnapshot(): InputMaterial
      subscribe(fn: () => void): () => void
    }
    enabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type PerfRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<PerfRowInjected>

/**
 * Render the performance-tier row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function PerfRow({ t, setTier, useDensity, useSpeed, useMaterial, useEnabled }: PerfRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const density = useDensity(value => value) ?? 1
  const speed = useSpeed(value => value) ?? 1
  const material = useMaterial(value => value) ?? 'glass'
  if (pluginEnabled === false) return null

  const active = detectPerfTier(density, speed, material)

  return (
    <div className={css.groupColumn}>
      <div className={css.copy}>
        <div className={css.title}>{t('perf.title')}</div>
        <div className={css.description}>{t('perf.description')}</div>
      </div>
      <div className={css.presetRow}>
        {PERF_TIERS.map(tier => (
          <button
            key={tier.id}
            type="button"
            className={css.presetBtn}
            aria-pressed={active === tier.id}
            onClick={() => { setTier(tier) }}
          >
            {t(TIER_LABELS[tier.id])}
          </button>
        ))}
        {active === 'custom' && <span className={css.label}>{t('perf.custom')}</span>}
      </div>
    </div>
  )
}

/**
 * Pure performance-tier table: one click sets the decoration density, the
 * animation speed, and the material together. The tiers exist so a weak GPU
 * does not have to be tuned slider by slider; `custom` is what the row shows
 * once the user moves any of the three by hand.
 */
import type { InputMaterial } from '../frieren-settings.ts'

/** One selectable performance tier. */
export interface PerfTier {
  readonly id: 'full' | 'balanced' | 'eco'
  /** Decoration density the tier writes. */
  readonly density: number
  /** Animation speed the tier writes. */
  readonly speed: number
  /** Material the tier writes (backdrop blur is the expensive part). */
  readonly material: InputMaterial
}

/** The tiers, heaviest first. */
export const PERF_TIERS: readonly PerfTier[] = Object.freeze([
  { id: 'full', density: 1, speed: 1, material: 'glass' },
  { id: 'balanced', density: 0.75, speed: 0.75, material: 'glass' },
  { id: 'eco', density: 0.35, speed: 0.5, material: 'plain' },
])

/**
 * Which tier the current settings correspond to.
 * @param density - current decoration density.
 * @param speed - current animation speed.
 * @param material - current input material.
 * @returns the matching tier id, or 'custom' when the values match no tier.
 */
export function detectPerfTier(
  density: number,
  speed: number,
  material: InputMaterial,
): PerfTier['id'] | 'custom' {
  for (const tier of PERF_TIERS) {
    if (tier.density === density && tier.speed === speed && tier.material === material) return tier.id
  }
  return 'custom'
}

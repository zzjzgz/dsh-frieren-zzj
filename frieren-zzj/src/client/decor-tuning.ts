/**
 * Pure decoration-tuning math: how many sparkles/blossoms a density keeps, how
 * evenly they spread, and how a speed multiplier maps onto animation
 * durations. Kept free of DOM and React imports so the math is unit-testable
 * under `node --test`.
 */

/** Lowest density the slider offers (a quarter of the decorations). */
export const MIN_DECOR_DENSITY = 0.25
/** Highest density the slider offers (the full set). */
export const MAX_DECOR_DENSITY = 2
/** Slowest animation speed multiplier the slider offers. */
export const MIN_DECOR_SPEED = 0.25
/** Fastest animation speed multiplier the slider offers. */
export const MAX_DECOR_SPEED = 4
/** Smallest magic-circle scale the slider offers. */
export const MIN_CIRCLE_SCALE = 0.5
/** Largest magic-circle scale the slider offers. */
export const MAX_CIRCLE_SCALE = 2

/**
 * Clamp one tuning value into its slider range.
 * @param value - requested value.
 * @param min - inclusive lower bound.
 * @param max - inclusive upper bound.
 * @returns the clamped value.
 */
export function clampTuning(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * How many decorations of a full set a density keeps.
 * @param total - size of the full decoration set.
 * @param density - density multiplier (clamped into range).
 * @returns at least 1 and never more than `total`; 0 for an empty set.
 */
export function pickDecorCount(total: number, density: number): number {
  if (total <= 0) return 0
  const scaled = Math.floor(total * clampTuning(density, MIN_DECOR_DENSITY, MAX_DECOR_DENSITY))
  // A non-empty set keeps at least one decoration at the lowest density.
  return Math.max(1, Math.min(total, scaled))
}

/**
 * Select an evenly spread subset of a decoration set, so a lower density
 * thins the scene across the whole viewport instead of trimming one side.
 * @param items - the full ordered set (ordered by position).
 * @param density - density multiplier (clamped into range).
 * @returns the selected items, in the original order.
 */
export function pickDecorSubset<T>(items: readonly T[], density: number): T[] {
  const count = pickDecorCount(items.length, density)
  if (count >= items.length) return [...items]
  const step = items.length / count
  const picked: T[] = []
  for (let index = 0; index < count; index += 1) {
    const item = items[Math.floor(index * step)]
    if (item !== undefined) picked.push(item)
  }
  return picked
}

/**
 * Map a speed multiplier onto an animation duration: speed 2 runs twice as
 * fast, i.e. half the duration.
 * @param baseSeconds - the decoration's nominal duration in seconds.
 * @param speed - speed multiplier (clamped into range).
 * @returns the scaled duration in seconds.
 */
export function scaleDuration(baseSeconds: number, speed: number): number {
  return baseSeconds / clampTuning(speed, MIN_DECOR_SPEED, MAX_DECOR_SPEED)
}

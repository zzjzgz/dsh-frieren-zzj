/**
 * Pure quote-roller cache for the composer dock. Keys the picked quote on
 * (settings revision, local roll counter) so the quote only re-picks when the
 * settings change OR the user explicitly rolls; everything else re-serves the
 * same object so `useSyncExternalStore` snapshots stay stable. Free of DOM and
 * React imports so the logic is unit-testable under `node --test`.
 */
import type { CustomQuoteEntry, QuoteMode } from '../frieren-settings.ts'
import { pickQuote, type FrierenQuote } from './quotes.ts'

/** One cached quote pick, keyed by the settings revision and the roll counter. */
export interface QuoteCache {
  /** Settings revision the quote was picked at. */
  revision: number | undefined
  /** Local roll counter the quote was picked at. */
  roll: number
  /** The picked quote. */
  quote: FrierenQuote
}

/**
 * Return the cached quote while (revision, roll) is unchanged; otherwise pick
 * a fresh one through {@link pickQuote}.
 * @param cache - the previous cache entry, or undefined before the first read.
 * @param revision - the current settings revision.
 * @param roll - the current local roll counter.
 * @param mode - quote rotation mode.
 * @param customQuote - custom fixed quote text (empty = built-in classic line).
 * @param customQuotes - custom random pool (empty = built-in library).
 * @param rng - deterministic random source for tests; defaults to Math.random.
 * @returns the cache entry to serve for this (revision, roll) pair.
 */
export function nextQuote(
  cache: QuoteCache | undefined,
  revision: number,
  roll: number,
  mode: QuoteMode,
  customQuote: string,
  customQuotes: readonly CustomQuoteEntry[],
  rng: () => number = Math.random,
): QuoteCache {
  if (cache !== undefined && cache.revision === revision && cache.roll === roll) return cache
  return { revision, roll, quote: pickQuote(mode, customQuote, customQuotes, rng) }
}

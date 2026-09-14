/**
 * P1 quick-win unit tests, run with the Node built-in runner:
 *
 *   node --test test/p1.test.ts
 *
 * Covers the pure logic shipped in P1: the wallpaper dim composer, the
 * `wallpaperDim` settings resolution, the quote roller cache, and the shared
 * reduced-motion stylesheet block. No external test dependencies.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { wallpaperLayerBackground } from '../src/client/wallpaper-css.ts'
import { nextQuote } from '../src/client/quote-roller.ts'
import { resolveSettings } from '../src/frieren-settings.ts'
import { FRIEREN_QUOTES } from '../src/client/quotes.ts'
import { FRI_DECOR_CSS, FRI_REDUCED_MOTION_CSS } from '../src/client/fri-theme.css.ts'
import { FRI_BASE_CSS } from '../src/client/fri-base.css.ts'

const IMG = 'data:image/jpeg;base64,ABC'

// ---------------------------------------------------------------------------
// wallpaperLayerBackground — the dim overlay composer
// ---------------------------------------------------------------------------

test('dim 0 renders the bare url with no gradient layer', () => {
  assert.equal(wallpaperLayerBackground(IMG, 0), `url("${IMG}")`)
})

test('dim 45 stacks a 0.45 black gradient over the url', () => {
  assert.equal(
    wallpaperLayerBackground(IMG, 45),
    `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url("${IMG}")`,
  )
})

test('dim above 80 clamps to the 0.8 ceiling', () => {
  assert.equal(
    wallpaperLayerBackground(IMG, 200),
    `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("${IMG}")`,
  )
})

test('negative dim clamps back to the bare url', () => {
  assert.equal(wallpaperLayerBackground(IMG, -5), `url("${IMG}")`)
})

test('fractional dim maps onto the exact alpha', () => {
  assert.equal(
    wallpaperLayerBackground(IMG, 12.5),
    `linear-gradient(rgba(0, 0, 0, 0.125), rgba(0, 0, 0, 0.125)), url("${IMG}")`,
  )
})

test('empty wallpaper composes to an empty value', () => {
  assert.equal(wallpaperLayerBackground('', 45), '')
})

// ---------------------------------------------------------------------------
// resolveSettings — the wallpaperDim field
// ---------------------------------------------------------------------------

test('missing settings resolve wallpaperDim to 0', () => {
  const resolved = resolveSettings(undefined)
  assert.equal(resolved.wallpaperDim, 0)
  assert.equal(resolved.enabled, true)
})

test('a stored wallpaperDim resolves through unchanged', () => {
  assert.equal(resolveSettings({ wallpaperDim: 45 }).wallpaperDim, 45)
})

test('a non-number wallpaperDim falls back to 0', () => {
  const stale = { wallpaperDim: '45' } as unknown as Partial<Parameters<typeof resolveSettings>[0]>
  assert.equal(resolveSettings(stale).wallpaperDim, 0)
})

// ---------------------------------------------------------------------------
// nextQuote — the (revision, roll)-keyed quote cache
// ---------------------------------------------------------------------------

test('first read picks from the built-in pool', () => {
  const cache = nextQuote(undefined, 1, 0, 'random', '', [], () => 0)
  assert.equal(cache.quote.ja, FRIEREN_QUOTES[0]!.ja)
  assert.equal(cache.revision, 1)
  assert.equal(cache.roll, 0)
})

test('an unchanged (revision, roll) re-serves the same quote object', () => {
  const first = nextQuote(undefined, 1, 0, 'random', '', [], () => 0)
  const again = nextQuote(first, 1, 0, 'random', '', [], () => 0.999)
  assert.equal(again, first)
  assert.equal(again.quote, first.quote)
})

test('bumping the roll counter re-picks through the rng', () => {
  const first = nextQuote(undefined, 1, 0, 'random', '', [], () => 0)
  const rolled = nextQuote(first, 1, 1, 'random', '', [], () => 0.999)
  assert.equal(rolled.quote.ja, FRIEREN_QUOTES[FRIEREN_QUOTES.length - 1]!.ja)
  assert.notEqual(rolled.quote, first.quote)
})

test('a settings revision bump re-picks even at the same roll', () => {
  const first = nextQuote(undefined, 1, 0, 'random', '', [], () => 0)
  const bumped = nextQuote(first, 2, 0, 'random', '', [], () => 0.999)
  assert.equal(bumped.quote.ja, FRIEREN_QUOTES[FRIEREN_QUOTES.length - 1]!.ja)
  assert.equal(bumped.revision, 2)
})

test('fixed mode serves the custom quote text regardless of the roll', () => {
  const first = nextQuote(undefined, 1, 0, 'fixed', 'customized line', [], () => 0)
  assert.equal(first.quote.ja, 'customized line')
  const rolled = nextQuote(first, 1, 5, 'fixed', 'customized line', [], () => 0.5)
  assert.equal(rolled.quote.ja, 'customized line')
})

test('a custom pool feeds the random pick instead of the built-in library', () => {
  const pool = [{ text: 'own line', speaker: 'me', gloss: '' }]
  const cache = nextQuote(undefined, 1, 0, 'random', '', pool, () => 0)
  assert.equal(cache.quote.ja, 'own line')
  assert.equal(cache.quote.speakerJa, 'me')
})

// ---------------------------------------------------------------------------
// FRI_REDUCED_MOTION_CSS — the shared reduced-motion block
// ---------------------------------------------------------------------------

test('the reduced-motion block disables the animated decorations', () => {
  assert.match(FRI_REDUCED_MOTION_CSS, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(FRI_REDUCED_MOTION_CSS, /animation:\s*none/)
  for (const selector of ['.fri-sparkle', '.fri-flower', '.fri-circle-ring-a', '.fri-seal-ring', '.fri-dock-star']) {
    assert.ok(FRI_REDUCED_MOTION_CSS.includes(selector), `missing ${selector} in the reduced-motion block`)
  }
})

test('the reduced-motion block keeps the decorations statically visible', () => {
  // Sparkles rest at their lit opacity and flowers park inside the viewport
  // instead of freezing above the top edge or mid-fall.
  assert.match(FRI_REDUCED_MOTION_CSS, /\.fri-sparkle\s*{[^}]*opacity:\s*0\.55/)
  assert.match(FRI_REDUCED_MOTION_CSS, /\.fri-flower\s*{[^}]*top:\s*18%/)
})

test('the reduced-motion block drops the wallpaper layer transition', () => {
  assert.match(FRI_REDUCED_MOTION_CSS, /\[data-frieren-wallpaper-layer\]\s*{[^}]*transition:\s*none/)
})

test('the decor and base sheets both include the shared block', () => {
  assert.ok(FRI_REDUCED_MOTION_CSS.length > 0, 'the shared reduced-motion block is empty')
  for (const [name, sheet] of [['FRI_DECOR_CSS', FRI_DECOR_CSS], ['FRI_BASE_CSS', FRI_BASE_CSS]] as const) {
    assert.match(sheet, /@media \(prefers-reduced-motion: reduce\)/, `${name} lacks the reduced-motion block`)
  }
})

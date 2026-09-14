/**
 * P1 quick-win unit tests, run with the Node built-in runner:
 *
 *   node --test test/p1.test.ts
 *
 * Covers the pure logic shipped in P1: the wallpaper veil composer and the
 * palette-aware transparency sheet it feeds (including the contrast floor that
 * keeps light-palette text readable over a wallpaper), the `wallpaperDim`
 * settings resolution, the quote roller cache, and the shared reduced-motion
 * stylesheet block. No external test dependencies.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  WALLPAPER_LAYER_STYLE, WALLPAPER_TRANSPARENCY_CSS, WALLPAPER_VEIL_BACKGROUND, WALLPAPER_VEIL_STYLE,
  wallpaperLayerImage, wallpaperVeilOpacity,
} from '../src/client/wallpaper-css.ts'
import { WALLPAPER_REST_SCALE } from '../src/client/wallpaper-transition.ts'
import { GLASS_CSS } from '../src/client/glass.ts'
import { nextQuote } from '../src/client/quote-roller.ts'
import { resolveSettings } from '../src/frieren-settings.ts'
import { FRIEREN_QUOTES } from '../src/client/quotes.ts'
import { FRI_DECOR_CSS, FRI_REDUCED_MOTION_CSS } from '../src/client/fri-theme.css.ts'
import { FRI_BASE_CSS } from '../src/client/fri-base.css.ts'

const IMG = 'data:image/jpeg;base64,ABC'

// ---------------------------------------------------------------------------
// The wallpaper layers — one image per layer, the veil on its own
// ---------------------------------------------------------------------------

test('an image layer carries nothing but the image url', () => {
  assert.equal(wallpaperLayerImage(''), '')
  assert.equal(wallpaperLayerImage(IMG), `url("${IMG}")`)
})

test('the veil strength is the dim percentage, clamped to its ceiling', () => {
  assert.equal(wallpaperVeilOpacity(0), 0)
  assert.equal(wallpaperVeilOpacity(60), 0.6)
  assert.equal(wallpaperVeilOpacity(-5), 0)
  assert.equal(wallpaperVeilOpacity(200), 0.8)
})

test('the image layers rest exactly on the scale the fly-through lands on', () => {
  assert.match(WALLPAPER_LAYER_STYLE, /position:\s*fixed/)
  assert.match(WALLPAPER_LAYER_STYLE, /background-size:\s*cover/)
  assert.ok(WALLPAPER_LAYER_STYLE.includes(`transform:scale(${WALLPAPER_REST_SCALE})`))
  // A transform animation must composite the layer, not re-rasterize a
  // viewport-anchored background on every frame.
  assert.doesNotMatch(WALLPAPER_LAYER_STYLE, /background-attachment/)
})

test('no wallpaper layer bakes in a color: the veil reads the palette variable', () => {
  // A literal black or white veil would freeze the feature into one palette and
  // break the other one's text contrast (the light-palette readability fix).
  assert.ok(WALLPAPER_VEIL_BACKGROUND.includes('var(--fri-wallpaper-scrim-rgb'))
  for (const sheet of [WALLPAPER_LAYER_STYLE, WALLPAPER_VEIL_STYLE, WALLPAPER_VEIL_BACKGROUND]) {
    assert.doesNotMatch(sheet, /#[0-9a-f]{3}|rgba?\(\s*\d/i, `a color literal leaked into: ${sheet}`)
  }
})

test('the veil keeps its own layer so a swap never flashes the raw wallpaper', () => {
  assert.match(WALLPAPER_VEIL_STYLE, /position:\s*fixed/)
  assert.match(WALLPAPER_VEIL_STYLE, /transition:\s*opacity/)
})

// ---------------------------------------------------------------------------
// The palette-aware transparency sheet — the light-theme readability contract
// ---------------------------------------------------------------------------

/** Light-palette ink (`--dsw-alias-label-primary` = bluish-1000) as sRGB. */
const LIGHT_INK: readonly [number, number, number] = [15, 17, 21]

/** The darkest thing a wallpaper can put behind a surface. */
const BLACK_PAPER: readonly [number, number, number] = [0, 0, 0]

/** WCAG relative luminance of an opaque sRGB color (0-255 channels). */
function luminance(color: readonly [number, number, number]): number {
  const [r, g, b] = color.map((channel) => {
    const srgb = channel / 255
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two opaque sRGB colors. */
function contrast(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** Composite a translucent white over an opaque backdrop (source-over). */
function whiteOver(alpha: number, backdrop: readonly [number, number, number]): readonly [number, number, number] {
  return backdrop.map((channel) => Math.round(alpha * 255 + (1 - alpha) * channel)) as unknown as readonly [number, number, number]
}

/** Pull one `rgba(255, 255, 255, <alpha>)` alpha out of a stylesheet block. */
function whiteAlpha(source: string, property: string): number {
  const match = new RegExp(`${property}: rgba\\(255, 255, 255, ([\\d.]+)\\)`).exec(source)
  assert.ok(match, `no translucent white found for ${property}`)
  return Number(match[1])
}

const LIGHT_BLOCK = WALLPAPER_TRANSPARENCY_CSS.slice(WALLPAPER_TRANSPARENCY_CSS.indexOf(':not([data-ds-dark-theme])'))

test('the sheet keeps the app frame transparent and the veil palette-bound', () => {
  assert.match(WALLPAPER_TRANSPARENCY_CSS, /body\[data-frieren-wallpaper\]\s*{[^}]*--dsw-alias-bg-base: transparent/)
  // Dark palette shades; everything else stays exactly as it shipped.
  assert.match(WALLPAPER_TRANSPARENCY_CSS, /--fri-wallpaper-scrim-rgb: 0, 0, 0/)
  assert.match(WALLPAPER_TRANSPARENCY_CSS, /body\[data-ds-dark-theme\]\[data-frieren-wallpaper\]\s*{[^}]*--dsw-specific-bubble: rgba\(255, 255, 255, 0\.05\)/)
})

test('the light palette mists the wallpaper instead of shading it', () => {
  assert.ok(LIGHT_BLOCK.length > 0, 'the light-palette block is missing')
  assert.match(LIGHT_BLOCK, /--fri-wallpaper-scrim-rgb: 255, 255, 255/)
})

test('light-palette text surfaces keep 4.5:1 over the darkest wallpaper', () => {
  for (const property of ['--dsw-specific-sidebar-fill', '--dsw-specific-input-major', '--dsw-specific-bubble']) {
    const ratio = contrast(LIGHT_INK, whiteOver(whiteAlpha(LIGHT_BLOCK, property), BLACK_PAPER))
    assert.ok(ratio >= 4.5, `${property} leaves light-palette ink at ${ratio.toFixed(2)}:1`)
  }
})

test('the glass light variant keeps 4.5:1 over the darkest wallpaper', () => {
  const alpha = whiteAlpha(GLASS_CSS, 'background')
  const ratio = contrast(LIGHT_INK, whiteOver(alpha, BLACK_PAPER))
  assert.ok(ratio >= 4.5, `the light glass leaves light-palette ink at ${ratio.toFixed(2)}:1`)
  // The pre-fix 0.25 white is what made the settings panel unreadable over a
  // dimmed wallpaper: keep the regression pinned.
  assert.ok(contrast(LIGHT_INK, whiteOver(0.25, BLACK_PAPER)) < 3)
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

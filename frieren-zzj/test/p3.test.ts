/**
 * P3 unit tests, run with the Node built-in runner:
 *
 *   node --test
 *
 * Covers the pure logic shipped in P3: the focus-mode gate, the settings
 * export/import payload validation, and the settings fields behind them. No
 * external test dependencies.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { decorationsVisible } from '../src/client/focus.ts'
import { detectPerfTier, PERF_TIERS } from '../src/client/perf-tier.ts'
import { parseSettingsBackup, serializeSettingsBackup } from '../src/client/settings-backup.ts'
import { DEFAULT_FRIEREN_SETTINGS, resolveSettings } from '../src/frieren-settings.ts'
import { FRI_DECOR_CSS, FRI_REDUCED_MOTION_CSS } from '../src/client/fri-theme.css.ts'

// ---------------------------------------------------------------------------
// decorationsVisible — the focus-mode gate
// ---------------------------------------------------------------------------

test('the decorative stage renders while the theme is on and focus mode is off', () => {
  assert.equal(decorationsVisible(true, false), true)
})

test('focus mode hides the decorative stage', () => {
  assert.equal(decorationsVisible(true, true), false)
})

test('the master switch wins over focus mode', () => {
  assert.equal(decorationsVisible(false, false), false)
  assert.equal(decorationsVisible(false, true), false)
})

// ---------------------------------------------------------------------------
// resolveSettings — the focus-mode field
// ---------------------------------------------------------------------------

test('missing settings resolve focus mode to off', () => {
  assert.equal(resolveSettings(undefined).focusMode, false)
})

test('a stored focus mode resolves through unchanged', () => {
  assert.equal(resolveSettings({ focusMode: true }).focusMode, true)
  assert.equal(resolveSettings({ focusMode: false }).focusMode, false)
})

// ---------------------------------------------------------------------------
// settings backup — export/import round trip
// ---------------------------------------------------------------------------

test('a backup round-trips every settings field', () => {
  const original = { ...DEFAULT_FRIEREN_SETTINGS, decorDensity: 1.75, focusMode: true, customQuote: 'line' }
  const parsed = parseSettingsBackup(serializeSettingsBackup(original))
  assert.equal(parsed.ok, true)
  assert.ok(parsed.ok)
  assert.deepEqual(parsed.value, original)
  assert.deepEqual(parsed.skipped, [])
})

test('malformed JSON is refused with an error', () => {
  const parsed = parseSettingsBackup('{ not json')
  assert.equal(parsed.ok, false)
  assert.ok(!parsed.ok)
  assert.equal(parsed.error, 'invalid-json')
})

test('a non-object document is refused', () => {
  for (const text of ['[]', '42', '"text"', 'null']) {
    assert.equal(parseSettingsBackup(text).ok, false, `expected ${text} to be refused`)
  }
  const parsed = parseSettingsBackup('[]')
  assert.ok(!parsed.ok)
  assert.equal(parsed.error, 'not-an-object')
})

test('unknown keys are reported as skipped, not applied', () => {
  const parsed = parseSettingsBackup(JSON.stringify({ enabled: false, somethingElse: 1 }))
  assert.ok(parsed.ok)
  assert.deepEqual(parsed.value, { enabled: false })
  assert.deepEqual(parsed.skipped, ['somethingElse'])
})

test('a field with the wrong type is skipped while the rest apply', () => {
  const parsed = parseSettingsBackup(JSON.stringify({ enabled: 'yes', focusMode: true }))
  assert.ok(parsed.ok)
  assert.deepEqual(parsed.value, { focusMode: true })
  assert.deepEqual(parsed.skipped, ['enabled'])
})

test('an out-of-vocabulary enum value is skipped', () => {
  const parsed = parseSettingsBackup(JSON.stringify({ inputMaterial: 'chrome', quoteMode: 'random' }))
  assert.ok(parsed.ok)
  assert.deepEqual(parsed.value, { quoteMode: 'random' })
  assert.deepEqual(parsed.skipped, ['inputMaterial'])
})

test('a number smuggled in as a string is skipped', () => {
  // JSON has no NaN literal; a hand-edited "\"45\"" must not coerce into 45.
  const parsed = parseSettingsBackup(JSON.stringify({ wallpaperDim: '45', focusMode: true }))
  assert.ok(parsed.ok)
  assert.deepEqual(parsed.value, { focusMode: true })
  assert.deepEqual(parsed.skipped, ['wallpaperDim'])
})

test('a document with no recognized field is refused', () => {
  const parsed = parseSettingsBackup(JSON.stringify({ nope: 1 }))
  assert.equal(parsed.ok, false)
  assert.ok(!parsed.ok)
  assert.equal(parsed.error, 'no-fields')
})

// ---------------------------------------------------------------------------
// performance tiers
// ---------------------------------------------------------------------------

test('each tier is detected from its own settings', () => {
  for (const tier of PERF_TIERS) {
    assert.equal(detectPerfTier(tier.density, tier.speed, tier.material), tier.id)
  }
})

test('hand-tuned values read as custom', () => {
  assert.equal(detectPerfTier(1.13, 1, 'glass'), 'custom')
  assert.equal(detectPerfTier(1, 1, 'plain'), 'custom')
  assert.equal(detectPerfTier(0.75, 1, 'glass'), 'custom')
})

test('the tiers get lighter in order', () => {
  const [full, balanced, eco] = PERF_TIERS
  assert.ok(full !== undefined && balanced !== undefined && eco !== undefined)
  assert.ok(full.density >= balanced.density && balanced.density >= eco.density)
  assert.ok(full.speed >= balanced.speed && balanced.speed >= eco.speed)
})

// ---------------------------------------------------------------------------
// the dark-mode starfield sheet
// ---------------------------------------------------------------------------

test('the decor sheet carries the starfield and its drift', () => {
  assert.ok(FRI_DECOR_CSS.includes('.fri-stars'), 'missing .fri-stars in FRI_DECOR_CSS')
  assert.match(FRI_DECOR_CSS, /@keyframes fri-drift/)
  // The layer only lights up in dark mode.
  assert.match(FRI_DECOR_CSS, /body\[data-ds-dark-theme\]\s+\.fri-stars\s*{[^}]*opacity/)
})

test('the reduced-motion block stops the starfield drift', () => {
  assert.ok(FRI_REDUCED_MOTION_CSS.includes('.fri-stars'), 'the starfield keeps drifting under reduced motion')
})

test('the starfield rides inside the stage instead of behind the app frame', () => {
  // Regression guard: a fixed layer at a negative z-index hides behind the
  // frame's opaque body paint whenever no wallpaper is set, which is the
  // default state — the sheet must keep the stars inside the stage.
  assert.match(FRI_DECOR_CSS, /\.fri-stars\s*{[^}]*position:\s*absolute/)
  assert.doesNotMatch(FRI_DECOR_CSS, /\.fri-stars\s*{[^}]*z-index:\s*-/)
})

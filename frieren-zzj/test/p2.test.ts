/**
 * P2 unit tests, run with the Node built-in runner:
 *
 *   node --test
 *
 * Covers the pure logic shipped in P2: the casting indicator's visibility
 * gate, the decoration tuning math, and the stylesheet contributions of both.
 * No external test dependencies.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { castingVisible } from '../src/client/casting.ts'
import { resolveSettings } from '../src/frieren-settings.ts'
import {
  clampTuning, pickDecorCount, pickDecorSubset, scaleDuration,
  MIN_DECOR_DENSITY, MAX_DECOR_DENSITY, MIN_DECOR_SPEED, MAX_DECOR_SPEED,
} from '../src/client/decor-tuning.ts'
import { FRI_BASE_CSS } from '../src/client/fri-base.css.ts'
import { FRI_REDUCED_MOTION_CSS } from '../src/client/fri-theme.css.ts'

// ---------------------------------------------------------------------------
// castingVisible — the composer badge gate
// ---------------------------------------------------------------------------

test('the casting badge shows while the agent is running', () => {
  assert.equal(castingVisible(true, true), true)
})

test('the casting badge stays hidden while the agent is idle', () => {
  assert.equal(castingVisible(true, false), false)
})

test('the master switch suppresses the casting badge', () => {
  assert.equal(castingVisible(false, true), false)
})

test('an absent busy state counts as not running', () => {
  assert.equal(castingVisible(true, undefined), false)
})

// ---------------------------------------------------------------------------
// Stylesheet contributions
// ---------------------------------------------------------------------------

test('the base sheet carries the casting badge chrome', () => {
  for (const selector of ['.fri-casting', '.fri-casting-ring']) {
    assert.ok(FRI_BASE_CSS.includes(selector), `missing ${selector} in FRI_BASE_CSS`)
  }
  // The badge floats above the composer card, matching the overlay anchor's
  // own contract (entries position against the card with bottom: 100%).
  assert.match(FRI_BASE_CSS, /\.fri-casting\s*{[^}]*bottom:\s*100%/)
})

test('the reduced-motion block stops the casting ring spin', () => {
  assert.ok(FRI_REDUCED_MOTION_CSS.includes('.fri-casting-ring'), 'the casting ring keeps spinning under reduced motion')
})

// ---------------------------------------------------------------------------
// decorate tuning — density, spread, and speed
// ---------------------------------------------------------------------------

test('clampTuning holds a value inside its slider range', () => {
  assert.equal(clampTuning(-3, MIN_DECOR_DENSITY, MAX_DECOR_DENSITY), MIN_DECOR_DENSITY)
  assert.equal(clampTuning(99, MIN_DECOR_DENSITY, MAX_DECOR_DENSITY), MAX_DECOR_DENSITY)
  assert.equal(clampTuning(1, MIN_DECOR_DENSITY, MAX_DECOR_DENSITY), 1)
})

test('pickDecorCount halves a set at density 0.5', () => {
  assert.equal(pickDecorCount(11, 0.5), 5)
})

test('pickDecorCount never exceeds the full set', () => {
  assert.equal(pickDecorCount(11, 2), 11)
  assert.equal(pickDecorCount(11, 5), 11)
})

test('pickDecorCount keeps at least one decoration of a non-empty set', () => {
  assert.equal(pickDecorCount(1, MIN_DECOR_DENSITY), 1)
})

test('pickDecorCount leaves an empty set empty', () => {
  assert.equal(pickDecorCount(0, 1), 0)
})

test('pickDecorSubset spreads the survivors across the whole set', () => {
  const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  assert.deepEqual(pickDecorSubset(items, 0.5), [0, 2, 4, 6, 8])
  assert.deepEqual(pickDecorSubset([0, 1, 2, 3, 4, 5, 6, 7], 0.25), [0, 4])
})

test('pickDecorSubset keeps every item at or above full density', () => {
  const items = ['a', 'b', 'c']
  assert.deepEqual(pickDecorSubset(items, 1), items)
  assert.deepEqual(pickDecorSubset(items, 2), items)
})

test('pickDecorSubset of an empty set stays empty', () => {
  assert.deepEqual(pickDecorSubset([], 1), [])
})

test('scaleDuration maps speed 2 onto half the duration', () => {
  assert.equal(scaleDuration(14, 2), 7)
})

test('scaleDuration maps speed 0.5 onto double the duration', () => {
  assert.equal(scaleDuration(14, 0.5), 28)
})

test('scaleDuration clamps instead of dividing by zero', () => {
  const slowest = scaleDuration(14, 0)
  assert.ok(Number.isFinite(slowest))
  assert.equal(slowest, 14 / MIN_DECOR_SPEED)
  assert.equal(scaleDuration(14, 99), 14 / MAX_DECOR_SPEED)
})

// ---------------------------------------------------------------------------
// resolveSettings — the decoration tuning fields
// ---------------------------------------------------------------------------

test('missing settings resolve the decoration tuning to neutral', () => {
  const resolved = resolveSettings(undefined)
  assert.equal(resolved.decorDensity, 1)
  assert.equal(resolved.decorSpeed, 1)
  assert.equal(resolved.decorCircleScale, 1)
})

test('stored decoration tuning resolves through unchanged', () => {
  const resolved = resolveSettings({ decorDensity: 1.5, decorSpeed: 0.5, decorCircleScale: 1.25 })
  assert.equal(resolved.decorDensity, 1.5)
  assert.equal(resolved.decorSpeed, 0.5)
  assert.equal(resolved.decorCircleScale, 1.25)
})

test('a non-number decoration tuning falls back to neutral', () => {
  const stale = { decorDensity: '2' } as unknown as Partial<Parameters<typeof resolveSettings>[0]>
  assert.equal(resolveSettings(stale).decorDensity, 1)
})

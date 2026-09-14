/**
 * Unit tests for the wallpaper carousel's depth fly-through planner, run with
 * the Node built-in runner:
 *
 *   node --test test/wallpaper-transition.test.ts
 *
 * The planner owns every number the browser animates — two full-screen layers
 * flying past each other — so they are pinned here rather than in the DOM
 * wiring: the fly-through endpoints, the resting frame both layers meet on
 * (so the handoff cannot jump), and the three downgrades (no rotation,
 * reduced motion, eco tier).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  MAX_ANIMATED_BLUR_PX, WALLPAPER_REST_SCALE, wallpaperTransitionPlan,
  type WallpaperTransitionInput, type WallpaperTransitionPlan,
} from '../src/client/wallpaper-transition.ts'

/** A rotation tick with no downgrades: the depth fly-through, fully on. */
const ROTATE: WallpaperTransitionInput = { reason: 'rotate', reducedMotion: false, eco: false, blurPx: 3 }

/**
 * Run the planner and require an animated plan.
 * @param input - planner input.
 * @returns the narrowed animated plan.
 */
function animated(input: WallpaperTransitionInput): Extract<WallpaperTransitionPlan, { animate: true }> {
  const plan = wallpaperTransitionPlan(input)
  if (!plan.animate) throw new Error(`expected an animated plan, got "${plan.kind}"`)
  return plan
}

test('a rotation tick flies the new wallpaper in from the distance', () => {
  const plan = animated(ROTATE)
  assert.equal(plan.kind, 'depth')
  assert.ok(plan.incoming.from.scale < WALLPAPER_REST_SCALE, 'the incoming layer starts further away')
  assert.equal(plan.incoming.to.scale, WALLPAPER_REST_SCALE)
  assert.equal(plan.incoming.from.opacity, 0)
  assert.equal(plan.incoming.to.opacity, 1)
  assert.ok(plan.incoming.from.blurPx > ROTATE.blurPx, 'it starts blurrier than the wallpaper it becomes')
  assert.equal(plan.incoming.to.blurPx, ROTATE.blurPx)
})

test('the outgoing wallpaper rushes past the viewer and fades out', () => {
  const plan = animated(ROTATE)
  assert.equal(plan.outgoing.from.scale, WALLPAPER_REST_SCALE)
  assert.ok(plan.outgoing.to.scale > WALLPAPER_REST_SCALE, 'the outgoing layer grows toward the viewer')
  assert.equal(plan.outgoing.from.opacity, 1)
  assert.equal(plan.outgoing.to.opacity, 0)
  assert.equal(plan.outgoing.from.blurPx, ROTATE.blurPx)
  assert.ok(plan.outgoing.to.blurPx > ROTATE.blurPx)
})

test('the outgoing layer leaves faster than the incoming one arrives', () => {
  const plan = animated(ROTATE)
  assert.equal(plan.incoming.durationMs, 1100)
  assert.equal(plan.outgoing.durationMs, 700)
})

test('both layers meet on one resting frame so the handoff cannot jump', () => {
  const plan = animated(ROTATE)
  assert.deepEqual(plan.incoming.to, { scale: WALLPAPER_REST_SCALE, blurPx: ROTATE.blurPx, opacity: 1 })
  assert.deepEqual(plan.incoming.to, plan.outgoing.from)
})

test('the two layers fly on different curves', () => {
  const plan = animated(ROTATE)
  assert.notEqual(plan.incoming.easing, plan.outgoing.easing)
  // Hand-tuned design values, pinned: the incoming image travels on Material's
  // standard curve (still visibly mid-flight halfway through), the outgoing
  // accelerates away from the viewer.
  assert.equal(plan.incoming.easing, 'cubic-bezier(0.4, 0, 0.2, 1)')
  assert.equal(plan.outgoing.easing, 'cubic-bezier(0.5, 0, 0.9, 0.4)')
})

test('only a rotation tick animates', () => {
  for (const reason of ['initial', 'settings'] as const) {
    const plan = wallpaperTransitionPlan({ ...ROTATE, reason })
    assert.equal(plan.animate, false)
    assert.equal(plan.kind, 'none')
  }
})

test('reduced motion hard-cuts instead of flying', () => {
  const plan = wallpaperTransitionPlan({ ...ROTATE, reducedMotion: true })
  assert.equal(plan.animate, false)
  assert.equal(plan.kind, 'none')
})

test('the eco tier downgrades the flight to a plain crossfade', () => {
  const plan = animated({ ...ROTATE, eco: true })
  assert.equal(plan.kind, 'fade')
  for (const frames of [plan.incoming, plan.outgoing]) {
    assert.equal(frames.from.scale, WALLPAPER_REST_SCALE)
    assert.equal(frames.to.scale, WALLPAPER_REST_SCALE)
    assert.equal(frames.from.blurPx, ROTATE.blurPx)
    assert.equal(frames.to.blurPx, ROTATE.blurPx)
  }
  assert.equal(plan.incoming.from.opacity, 0)
  assert.equal(plan.outgoing.to.opacity, 0)
  assert.equal(plan.incoming.durationMs, 600)
  assert.equal(plan.outgoing.durationMs, 600)
})

test('the animated blur is capped so a full-screen re-blur stays affordable', () => {
  const plan = animated({ ...ROTATE, blurPx: 20 })
  assert.ok(plan.incoming.from.blurPx <= MAX_ANIMATED_BLUR_PX, 'the incoming start blur is capped')
  assert.ok(plan.outgoing.to.blurPx <= MAX_ANIMATED_BLUR_PX, 'the outgoing end blur is capped')
  assert.ok(plan.incoming.from.blurPx >= 20, 'never blurrier than the wallpaper the user already set')
})

test('the blur input resolves through the wallpaper clamp', () => {
  assert.equal(animated({ ...ROTATE, blurPx: -5 }).incoming.to.blurPx, 0)
  assert.equal(animated({ ...ROTATE, blurPx: 99 }).incoming.to.blurPx, 20)
})

test('a blur-free wallpaper still flies', () => {
  const plan = animated({ ...ROTATE, blurPx: 0 })
  assert.ok(plan.incoming.from.blurPx > 0)
  assert.equal(plan.incoming.to.blurPx, 0)
  assert.ok(plan.outgoing.to.blurPx > 0)
})

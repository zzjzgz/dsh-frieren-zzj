/**
 * Behaviour tests for the wallpaper stage — the two image layers, the veil, and
 * the depth fly-through's lifecycle — run with the Node built-in runner:
 *
 *   node --test test/wallpaper-stage.test.ts
 *
 * The stage is the part a browser would otherwise have to prove: which slot
 * holds which image, when a swap animates and when it must not, what happens to
 * a flight that is superseded mid-decode, and whether anything is left behind on
 * teardown. It talks to the DOM through `createElement`/`mount` and to the
 * browser's animation clock through `Element.animate`, so a ~50-line fake
 * implements exactly that surface — no jsdom dependency, no real timers.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createWallpaperStage, type WallpaperStageState } from '../src/client/wallpaper-stage.ts'
import { WALLPAPER_REST_SCALE } from '../src/client/wallpaper-transition.ts'

const IMG_A = '/plugins/frieren/wallpaper/a.jpg'
const IMG_B = '/plugins/frieren/wallpaper/b.jpg'
const IMG_C = '/plugins/frieren/wallpaper/c.jpg'

/** One recorded `Element.animate` call. */
interface FakeAnimation {
  keyframes: Keyframe[]
  options: KeyframeAnimationOptions
  cancelled: boolean
  finished: Promise<void>
  cancel(): void
  /** Report the animation reaching its end, the way the browser would. */
  settle(): void
}

/** The element surface the stage uses. */
interface FakeElement {
  dataset: Record<string, string>
  style: Record<string, unknown>
  animations: FakeAnimation[]
  removed: boolean
  animate(keyframes: Keyframe[], options: KeyframeAnimationOptions): FakeAnimation
  remove(): void
}

/** Create one fake element. */
function fakeElement(): FakeElement {
  const element: FakeElement = {
    dataset: {},
    style: {},
    animations: [],
    removed: false,
    animate(keyframes, options) {
      let finish: () => void = () => undefined
      let fail: (reason?: unknown) => void = () => undefined
      const finished = new Promise<void>((resolve, reject) => {
        finish = resolve
        fail = reject
      })
      const animation: FakeAnimation = {
        keyframes,
        options,
        cancelled: false,
        finished,
        cancel() {
          animation.cancelled = true
          fail(new Error('cancelled'))
        },
        settle: finish,
      }
      element.animations.push(animation)
      return animation
    },
    remove() {
      element.removed = true
    },
  }
  return element
}

/** Let queued microtasks and the stage's `await`ed decode continuation run. */
async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Build a stage over a fake DOM whose settings and decode timing the test drives.
 * @param overrides - initial stage state.
 */
function harness(overrides: Partial<WallpaperStageState> = {}) {
  const state: WallpaperStageState = {
    enabled: true, blurPx: 3, dim: 60, reducedMotion: false, eco: false, ...overrides,
  }
  const created: FakeElement[] = []
  const mounted: FakeElement[] = []
  let decodeResolve: (() => void) | null = null
  const stage = createWallpaperStage({
    createElement: () => {
      const element = fakeElement()
      created.push(element)
      return element as unknown as HTMLElement
    },
    mount: (nodes) => { mounted.push(...(nodes as unknown as FakeElement[])) },
    readState: () => ({ ...state }),
    decode: () => new Promise<void>((resolve) => { decodeResolve = resolve }),
  })
  return {
    state,
    stage,
    created,
    mounted,
    /** Paint and let a synchronous (hard-cut) paint settle. */
    paint: (url: string, reason: 'initial' | 'settings' | 'rotate'): void => { stage.paint(url, reason) },
    /** Resolve the pending decode and let the stage's continuation run. */
    finishDecode: async (): Promise<void> => {
      decodeResolve?.()
      await flush()
    },
    /** The layer currently on screen. */
    live: (): FakeElement | undefined => mounted.find((el) => el.dataset.frierenWallpaperLayer === '' && el.style.zIndex === '-3'),
    /** The layer waiting to fly in. */
    incoming: (): FakeElement | undefined => mounted.find((el) => el.dataset.frierenWallpaperLayer === '' && el.style.zIndex === '-2'),
    veil: (): FakeElement | undefined => mounted.find((el) => el.dataset.frierenWallpaperVeil === ''),
  }
}

test('the first paint mounts two image layers and the veil, and does not fly', () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  assert.equal(h.created.length, 3, 'two image layers and one veil')
  assert.equal(h.live()?.style.backgroundImage, `url("${IMG_A}")`)
  assert.equal(h.live()?.style.transform, `scale(${WALLPAPER_REST_SCALE})`)
  assert.equal(h.live()?.style.filter, 'blur(3px)')
  assert.equal(h.live()?.style.opacity, '1')
  assert.equal(h.veil()?.style.opacity, '0.6', 'the veil carries the dim percentage')
  assert.equal(h.veil()?.style.zIndex, '-1', 'the veil sits above both image layers')
  assert.deepEqual(h.live()?.animations, [], 'an initial paint hard-cuts')
})

test('a rotation animates both slots with the fly-through endpoints', async () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  const first = h.live()
  h.paint(IMG_B, 'rotate')
  await h.finishDecode()
  const incoming = h.mounted.find((el) => el !== first && el.style.backgroundImage === `url("${IMG_B}")`)
  assert.ok(incoming, 'the incoming image is painted on the other slot')
  const inFlight = incoming.animations[0]
  const outFlight = first?.animations[0]
  assert.ok(inFlight && outFlight, 'both layers animate')
  assert.deepEqual(inFlight.keyframes[0], { opacity: 0, transform: 'scale(0.82)', filter: 'blur(19px)' })
  assert.deepEqual(inFlight.keyframes[1], { opacity: 1, transform: `scale(${WALLPAPER_REST_SCALE})`, filter: 'blur(3px)' })
  assert.deepEqual(outFlight.keyframes[0], { opacity: 1, transform: `scale(${WALLPAPER_REST_SCALE})`, filter: 'blur(3px)' })
  assert.deepEqual(outFlight.keyframes[1], { opacity: 0, transform: 'scale(1.6)', filter: 'blur(23px)' })
  assert.equal(inFlight.options.fill, 'both')
  assert.equal(inFlight.options.duration, 1100)
  assert.equal(outFlight.options.duration, 700)
})

test('both layers are promoted for the flight and demoted once it lands', async () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  const first = h.live()
  h.paint(IMG_B, 'rotate')
  await h.finishDecode()
  const incoming = h.mounted.find((el) => el !== first && el.style.backgroundImage === `url("${IMG_B}")`)
  assert.ok(incoming)
  assert.equal(incoming.style.willChange, 'transform, filter, opacity')
  assert.equal(first?.style.willChange, 'transform, filter, opacity')

  incoming.animations[0]?.settle()
  await flush()
  assert.equal(h.live()?.style.backgroundImage, `url("${IMG_B}")`, 'the flown-in layer is now live')
  assert.equal(h.live()?.style.willChange, '', 'the promotion is dropped')
  assert.equal(first?.style.willChange, '')
  assert.equal(first?.style.backgroundImage, '', 'the old bitmap is released')
  assert.equal(first?.style.opacity, '1')
  assert.equal(first?.style.transform, `scale(${WALLPAPER_REST_SCALE})`)
})

test('a rotation that only restyles the settings never animates', async () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  const live = h.live()
  h.state.blurPx = 8
  h.state.dim = 20
  h.paint(IMG_A, 'rotate')
  assert.deepEqual(live?.animations, [], 'the same image must not fly in again')
  assert.equal(live?.style.filter, 'blur(8px)')
  assert.equal(h.veil()?.style.opacity, '0.2')
  await flush()
})

test('a settings paint swaps without animating', () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  const first = h.live()
  h.paint(IMG_B, 'settings')
  assert.equal(first?.style.backgroundImage, '', 'the previous image is dropped')
  assert.deepEqual(first?.animations, [])
  assert.equal(h.live()?.style.backgroundImage, `url("${IMG_B}")`)
})

test('reduced motion hard-cuts a rotation', async () => {
  const h = harness({ reducedMotion: true })
  h.paint(IMG_A, 'initial')
  const first = h.live()
  h.paint(IMG_B, 'rotate')
  assert.equal(h.live()?.style.backgroundImage, `url("${IMG_B}")`)
  assert.deepEqual(first?.animations, [], 'no flight under prefers-reduced-motion')
  await flush()
})

test('a flight superseded mid-decode never starts', async () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  h.paint(IMG_B, 'rotate')
  // The gallery/switch moves on while B is still decoding: C lands instantly.
  h.paint(IMG_C, 'settings')
  await h.finishDecode()
  for (const el of h.mounted) {
    assert.deepEqual(el.animations, [], 'the stale decode must not animate')
  }
  assert.equal(h.live()?.style.backgroundImage, `url("${IMG_C}")`)
})

test('a paint arriving mid-flight lands the swap before reusing the slots', async () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  h.paint(IMG_B, 'rotate')
  await h.finishDecode()
  assert.equal(
    h.live()?.style.backgroundImage,
    `url("${IMG_A}")`,
    'B is still flying, so the live slot is still A',
  )
  h.paint(IMG_C, 'settings')
  assert.equal(h.live()?.style.backgroundImage, `url("${IMG_C}")`)
  for (const el of h.mounted) {
    assert.deepEqual(el.animations.filter((animation) => !animation.cancelled), [], 'the flight is cancelled')
  }
})

test('the eco tier keeps the crossfade but not the flight', async () => {
  const h = harness({ eco: true })
  h.paint(IMG_A, 'initial')
  h.paint(IMG_B, 'rotate')
  await h.finishDecode()
  const incoming = h.mounted.find((el) => el.style.backgroundImage === `url("${IMG_B}")`)
  const inFlight = incoming?.animations[0]
  assert.ok(inFlight)
  assert.deepEqual(inFlight.keyframes[0], { opacity: 0, transform: `scale(${WALLPAPER_REST_SCALE})`, filter: 'blur(3px)' })
  assert.equal(inFlight.options.duration, 600)
})

test('turning the wallpaper off unmounts the stage and cancels a flight', async () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  h.paint(IMG_B, 'rotate')
  await h.finishDecode()
  h.state.enabled = false
  h.paint(IMG_A, 'settings')
  for (const el of h.mounted) assert.ok(el.removed, 'every layer is unmounted')
  assert.ok(h.mounted.every((el) => el.animations.every((animation) => animation.cancelled)))
  h.stage.teardown()
})

test('teardown is idempotent and leaves nothing mounted', () => {
  const h = harness()
  h.paint(IMG_A, 'initial')
  h.stage.teardown()
  h.stage.teardown()
  for (const el of h.mounted) assert.ok(el.removed)
})

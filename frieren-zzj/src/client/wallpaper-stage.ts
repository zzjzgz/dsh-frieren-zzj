/**
 * The wallpaper stage: two fixed full-viewport image slots plus the veil that
 * keeps text readable over them, and the depth fly-through the carousel rotates
 * with (planned by ./wallpaper-transition.ts). Everything the stage needs from
 * the world — element creation, where the layers mount, the settings in force,
 * and image decoding — is injected, so its lifecycle (which slot holds which
 * image, when a swap animates, what a superseded flight does, what teardown
 * leaves behind) is testable without a browser.
 *
 * Stacking, bottom to top: the outgoing image (z-index -3), the incoming image
 * while it flies in (-2), the veil (-1). All three sit behind the app frame, so
 * negative z-indexes are what keep the wallpaper under the UI.
 */
import { MAX_WALLPAPER_BLUR } from '../frieren-settings.ts'
import {
  WALLPAPER_LAYER_STYLE, WALLPAPER_VEIL_STYLE, wallpaperLayerImage, wallpaperVeilOpacity,
} from './wallpaper-css.ts'
import {
  WALLPAPER_REST_SCALE, wallpaperTransitionPlan,
  type WallpaperPaintReason, type WallpaperTransitionPlan,
} from './wallpaper-transition.ts'

/** Everything the stage reads at paint time. */
export interface WallpaperStageState {
  /** The master switch is on and the gallery holds at least one image. */
  enabled: boolean
  /** Wallpaper blur in px (clamped here like the layers do). */
  blurPx: number
  /** Veil strength in percent (0–80). */
  dim: number
  /** `prefers-reduced-motion: reduce` is active. */
  reducedMotion: boolean
  /** The performance tier forbids heavy full-screen animation. */
  eco: boolean
}

/** The injected world the stage draws in. */
export interface WallpaperStageDeps {
  /** Create one layer element (the stage sets its own dataset and styles). */
  createElement(): HTMLElement
  /** Mount the created layers (the stage never touches `document` itself). */
  mount(nodes: readonly HTMLElement[]): void
  /** The settings in force right now. */
  readState(): WallpaperStageState
  /** Resolve once the image can be painted, or when the caller's timeout fires. */
  decode(url: string): Promise<void>
}

/** The stage handle owned by the plugin effect. */
export interface WallpaperStage {
  /**
   * Show one wallpaper. `reason` decides whether the swap may animate: only
   * `'rotate'` does, and only when nothing downgrades it.
   * @param url - the image to show.
   * @param reason - what triggered this paint.
   */
  paint(url: string, reason: WallpaperPaintReason): void
  /** Unmount every layer and drop whatever was in flight. */
  teardown(): void
}

/** Grace after the longest flight before settling it anyway (a hidden tab may
 * never advance the animation clock). */
const SETTLE_GRACE_MS = 150

/**
 * Build a wallpaper stage.
 * @param deps - the injected world (element factory, mount point, settings, decode).
 * @returns the stage handle.
 */
export function createWallpaperStage(deps: WallpaperStageDeps): WallpaperStage {
  /** The two image slots, the veil above them, and which slot is on screen. */
  let layers: [HTMLElement, HTMLElement] | null = null
  let veil: HTMLElement | null = null
  let live: 0 | 1 = 0
  /** Wallpaper painted on the live slot ('' before the first paint). */
  let liveUrl = ''
  /** Settles the swap in flight right now, or null when the stage is at rest. */
  let finishSwap: (() => void) | null = null
  /** Animations of the swap in flight. */
  let animations: Animation[] = []
  /** Backstop that settles a swap whose animation never reports back. */
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  /** Bumped by every paint: an in-flight decode that lost the race does nothing. */
  let paintToken = 0

  /** The other slot. */
  const other = (slot: 0 | 1): 0 | 1 => (slot === 0 ? 1 : 0)

  /** The blur the image layers clamp to. */
  const clampBlur = (blurPx: number): number => Math.max(0, Math.min(MAX_WALLPAPER_BLUR, blurPx))

  /** Mount the two image slots and the veil. */
  const ensureLayers = (): void => {
    if (layers !== null) return
    const first = deps.createElement()
    const second = deps.createElement()
    for (const el of [first, second]) {
      el.dataset.frierenWallpaperLayer = ''
      el.style.cssText = WALLPAPER_LAYER_STYLE
    }
    const scrim = deps.createElement()
    scrim.dataset.frierenWallpaperVeil = ''
    scrim.style.cssText = WALLPAPER_VEIL_STYLE
    scrim.style.zIndex = '-1'
    scrim.style.opacity = '0'
    deps.mount([first, second, scrim])
    layers = [first, second]
    veil = scrim
    live = 0
    liveUrl = ''
  }

  /** Put one image layer back into its resting state. */
  const restLayer = (el: HTMLElement, zIndex: number, blurPx: number): void => {
    el.style.zIndex = String(zIndex)
    el.style.transform = `scale(${WALLPAPER_REST_SCALE})`
    el.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none'
    el.style.opacity = '1'
    el.style.willChange = ''
  }

  /** Drop every animation of the swap in flight (the caller restyles the layers). */
  const cancelAnimations = (): void => {
    for (const animation of animations) animation.cancel()
    animations = []
    if (settleTimer !== null) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
  }

  const teardown = (): void => {
    paintToken += 1
    finishSwap = null
    cancelAnimations()
    if (layers !== null) for (const el of layers) el.remove()
    if (veil !== null) veil.remove()
    layers = null
    veil = null
    live = 0
    liveUrl = ''
  }

  /** Restyle both slots for the settings in force (no swap, no animation). */
  const restyle = (blurPx: number): void => {
    if (layers === null) return
    restLayer(layers[live], -3, blurPx)
    restLayer(layers[other(live)], -2, blurPx)
  }

  /** Swap instantly: the incoming slot becomes live within one frame. */
  const hardCut = (url: string, blurPx: number): void => {
    if (layers === null) return
    const next = other(live)
    const incoming = layers[next]
    const outgoing = layers[live]
    incoming.style.backgroundImage = wallpaperLayerImage(url)
    restLayer(incoming, -3, blurPx)
    outgoing.style.backgroundImage = ''
    restLayer(outgoing, -2, blurPx)
    live = next
    liveUrl = url
  }

  /** Fly the incoming image in over the outgoing one, then settle on the end frame. */
  const flyThrough = (url: string, blurPx: number, plan: Extract<WallpaperTransitionPlan, { animate: true }>): void => {
    if (layers === null) return
    const next = other(live)
    const incoming = layers[next]
    const outgoing = layers[live]
    incoming.style.backgroundImage = wallpaperLayerImage(url)
    incoming.style.zIndex = '-2'
    incoming.style.opacity = '0'
    incoming.style.transform = `scale(${plan.incoming.from.scale})`
    incoming.style.filter = `blur(${plan.incoming.from.blurPx}px)`
    incoming.style.willChange = 'transform, filter, opacity'
    outgoing.style.zIndex = '-3'
    outgoing.style.willChange = 'transform, filter, opacity'
    const frames = (layer: 'incoming' | 'outgoing'): Keyframe[] => {
      const ends = plan[layer]
      return [
        { opacity: ends.from.opacity, transform: `scale(${ends.from.scale})`, filter: `blur(${ends.from.blurPx}px)` },
        { opacity: ends.to.opacity, transform: `scale(${ends.to.scale})`, filter: `blur(${ends.to.blurPx}px)` },
      ]
    }
    const incomingAnimation = incoming.animate(frames('incoming'), {
      duration: plan.incoming.durationMs, easing: plan.incoming.easing, fill: 'both',
    })
    const outgoingAnimation = outgoing.animate(frames('outgoing'), {
      duration: plan.outgoing.durationMs, easing: plan.outgoing.easing, fill: 'both',
    })
    animations = [incomingAnimation, outgoingAnimation]
    // Cancelling an animation rejects its `finished` promise; swallowing it here
    // keeps a superseded flight from surfacing as an unhandled rejection.
    for (const animation of animations) animation.finished.catch(() => undefined)

    let settled = false
    const settle = (): void => {
      if (settled) return
      settled = true
      if (finishSwap === settle) finishSwap = null
      cancelAnimations()
      // Both layers land on the same resting frame, so dropping the fill and
      // writing the resting styles cannot show as a jump.
      outgoing.style.backgroundImage = ''
      restLayer(outgoing, -2, blurPx)
      restLayer(incoming, -3, blurPx)
      live = next
      liveUrl = url
    }
    finishSwap = settle
    incomingAnimation.finished.then(settle, () => undefined)
    settleTimer = setTimeout(settle, Math.max(plan.incoming.durationMs, plan.outgoing.durationMs) + SETTLE_GRACE_MS)
  }

  const paint = (url: string, reason: WallpaperPaintReason): void => {
    // A newer paint always wins: land the swap in flight first so the slots it
    // occupies are free to reuse.
    if (finishSwap !== null) {
      const settle = finishSwap
      finishSwap = null
      settle()
    }
    paintToken += 1
    const state = deps.readState()
    if (!state.enabled) {
      teardown()
      return
    }
    const blurPx = clampBlur(state.blurPx)
    ensureLayers()
    if (veil !== null) veil.style.opacity = String(wallpaperVeilOpacity(state.dim))
    // Repainting the image already on screen (a blur/dim drag, an unrelated
    // settings write) restyles in place: never a swap, never an animation.
    if (liveUrl === url) {
      restyle(blurPx)
      return
    }
    const plan = wallpaperTransitionPlan({
      reason, reducedMotion: state.reducedMotion, eco: state.eco, blurPx,
    })
    if (!plan.animate) {
      hardCut(url, blurPx)
      return
    }
    const mine = paintToken
    void deps.decode(url).then(() => {
      // Superseded by a later paint, or switched off meanwhile: that paint already
      // put the right image on screen.
      if (mine !== paintToken) return
      const freshState = deps.readState()
      if (!freshState.enabled) return
      const blurNow = clampBlur(freshState.blurPx)
      const fresh = wallpaperTransitionPlan({
        reason: 'rotate', reducedMotion: freshState.reducedMotion, eco: freshState.eco, blurPx: blurNow,
      })
      if (!fresh.animate) {
        hardCut(url, blurNow)
        return
      }
      flyThrough(url, blurNow, fresh)
    })
  }

  return { paint, teardown }
}

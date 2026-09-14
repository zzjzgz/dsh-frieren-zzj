/**
 * Pure planner for the wallpaper carousel's depth fly-through: on a rotation
 * tick the incoming image arrives from the distance (smaller, blurred,
 * transparent → full-screen, at the user's blur, opaque) while the outgoing
 * image is flung past the viewer (growing, blurring, fading out). The DOM
 * wiring feeds these numbers to the Web Animations API; keeping them here
 * means the endpoints, the shared resting frame, and every downgrade are
 * unit-testable without a browser.
 */
import { MAX_WALLPAPER_BLUR } from '../frieren-settings.ts'

/** Scale both wallpaper layers rest at. The layers' inline transform must
 * match it exactly, so an animation can end on its own resting frame without
 * a one-frame jump — and stay above 1 so a blur never shows its edges. */
export const WALLPAPER_REST_SCALE = 1.1

/** Where the incoming image starts: further away than it ends up (1 = as close as it ends). */
const INCOMING_START_SCALE = 0.82

/** How far past the viewer the outgoing image travels before it is gone. */
const OUTGOING_END_SCALE = 1.6

/** Blur the incoming image starts with, on top of the user's wallpaper blur. */
const INCOMING_EXTRA_BLUR_PX = 16

/** Blur the outgoing image picks up as it rushes past the viewer. */
const OUTGOING_EXTRA_BLUR_PX = 20

/** Ceiling on the animated blur radius: re-rasterizing a full-screen blur every
 * frame is the expensive part of this effect, so the flight never blurs harder
 * than this no matter how blurry the wallpaper itself is set. */
export const MAX_ANIMATED_BLUR_PX = 26

/** Arrival time of the incoming image. */
const INCOMING_DURATION_MS = 1100

/** Departure time of the outgoing image: shorter, because it is flung past. */
const OUTGOING_DURATION_MS = 700

/** Crossfade time the eco tier falls back to (no scale, no blur). */
const ECO_FADE_DURATION_MS = 600

/** Arrival curve (Material's standard easing): a deliberate start, the bulk of
 * the travel through the middle, then a soft settle — so the image is still
 * visibly mid-flight halfway through instead of snapping into place. */
const INCOMING_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

/** Departure curve: accelerates away from the viewer. */
const OUTGOING_EASING = 'cubic-bezier(0.5, 0, 0.9, 0.4)'

/** Crossfade curve: neutral in-and-out. */
const FADE_EASING = 'ease-in-out'

/** Why a wallpaper was painted. Only a rotation tick is worth animating:
 * settings changes (blur/dim sliders, uploads, the master switch) and the
 * first paint must land instantly or the UI would fly on every drag. */
export type WallpaperPaintReason = 'initial' | 'settings' | 'rotate'

/** Everything the planner needs to describe one swap. */
export interface WallpaperTransitionInput {
  /** What triggered the paint. */
  reason: WallpaperPaintReason
  /** `prefers-reduced-motion: reduce` is active. */
  reducedMotion: boolean
  /** The wallpaper performance tier is `eco` (no heavy full-screen animation). */
  eco: boolean
  /** The user's wallpaper blur in px (out-of-range values clamp like the layer). */
  blurPx: number
}

/** One layer's animation endpoints: scale, blur and opacity at each end. */
export interface WallpaperLayerFrames {
  /** Endpoints the layer animates from. */
  from: { scale: number; blurPx: number; opacity: number }
  /** Endpoints the layer animates to. */
  to: { scale: number; blurPx: number; opacity: number }
  /** Animation duration in milliseconds. */
  durationMs: number
  /** CSS easing for the animation. */
  easing: string
}

/** The two-layer plan. `animate: false` means the caller hard-cuts the swap. */
export type WallpaperTransitionPlan =
  | { animate: false; kind: 'none' }
  | { animate: true; kind: 'depth' | 'fade'; incoming: WallpaperLayerFrames; outgoing: WallpaperLayerFrames }

/**
 * Resolve one wallpaper swap into layer animations.
 *
 * A plain crossfade and the depth flight share their shape — only the numbers
 * differ — so the caller applies one code path and the downgrades stay data.
 * @param input - paint reason, accessibility and performance gates, wallpaper blur.
 * @returns the plan; `kind: 'none'` means hard-cut.
 */
export function wallpaperTransitionPlan(input: WallpaperTransitionInput): WallpaperTransitionPlan {
  if (input.reason !== 'rotate' || input.reducedMotion) return { animate: false, kind: 'none' }

  const blur = Math.max(0, Math.min(MAX_WALLPAPER_BLUR, input.blurPx))
  const capped = (value: number): number => Math.min(MAX_ANIMATED_BLUR_PX, value)

  if (input.eco) {
    return {
      animate: true,
      kind: 'fade',
      incoming: {
        from: { scale: WALLPAPER_REST_SCALE, blurPx: blur, opacity: 0 },
        to: { scale: WALLPAPER_REST_SCALE, blurPx: blur, opacity: 1 },
        durationMs: ECO_FADE_DURATION_MS,
        easing: FADE_EASING,
      },
      outgoing: {
        from: { scale: WALLPAPER_REST_SCALE, blurPx: blur, opacity: 1 },
        to: { scale: WALLPAPER_REST_SCALE, blurPx: blur, opacity: 0 },
        durationMs: ECO_FADE_DURATION_MS,
        easing: FADE_EASING,
      },
    }
  }

  return {
    animate: true,
    kind: 'depth',
    incoming: {
      from: { scale: INCOMING_START_SCALE, blurPx: capped(blur + INCOMING_EXTRA_BLUR_PX), opacity: 0 },
      to: { scale: WALLPAPER_REST_SCALE, blurPx: blur, opacity: 1 },
      durationMs: INCOMING_DURATION_MS,
      easing: INCOMING_EASING,
    },
    outgoing: {
      from: { scale: WALLPAPER_REST_SCALE, blurPx: blur, opacity: 1 },
      to: { scale: OUTGOING_END_SCALE, blurPx: capped(blur + OUTGOING_EXTRA_BLUR_PX), opacity: 0 },
      durationMs: OUTGOING_DURATION_MS,
      easing: OUTGOING_EASING,
    },
  }
}

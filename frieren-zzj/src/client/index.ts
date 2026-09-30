/**
 * Frieren × Himmel web theme, browser half: the theme chrome stylesheet
 * (fantasy serif headings, gold-lilac scrollbar, seal/badge/dock quote),
 * and — gated by the user-owned settings — the wallpaper stylesheet
 * (watercolor background with per-layer decorations), the custom-wallpaper
 * override, the input-card material stylesheet (iOS frosted glass vs plain;
 * message area stays transparent), and the decorative stage. The settings
 * live in a dedicated "Frieren theme" settings section: appearance,
 * custom wallpaper upload, input-bar material, per-layer decoration toggles,
 * and quote rotation mode with custom quote support. Presentation only:
 * no business state, no model-visible input.
 */
import * as React from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// DSH 0.2 removed the dsh-client-runtime face: a client plugin's apply() now
// receives the plain cordis Context, exactly as the shipped client packages do.
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: since DSH 0.2 the `ctx.slots` service (SlotRegistry, and with it
// the SlotMap keys of every declaring package) is owned by the ui-renderer
// client face, not by the pure-core ui-slots package.
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the theme service (ctx.theme, theme/change) and slot-name
// Context merges from the declaring packages (client bundle purity gate: no
// value imports).
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the Session root standard-props merge (the `useSession`
// busy-state selector handed to every session-scoped slot entry).
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
// Type-only: the settings surface's SlotMap merges ('settings.section',
// 'settings.general.item').
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { FRI_BASE_CSS } from './fri-base.css.ts'
import { FRI_DECOR_CSS } from './fri-theme.css.ts'
import { GLASS_CSS } from './glass.ts'
import {
  CUSTOM_WALLPAPER_FIELD, WALLPAPER_BLUR_FIELD, WALLPAPER_DIM_FIELD, DECOR_CIRCLE_FIELD, DECOR_FLOWERS_FIELD, DECOR_RIBBON_FIELD,
  DECOR_SPARKLES_FIELD, DECOR_VIGNETTE_FIELD, DEFAULT_FRIEREN_SETTINGS, ENABLED_FIELD,
  DECOR_DENSITY_FIELD, DECOR_SPEED_FIELD, CIRCLE_SCALE_FIELD, FOCUS_MODE_FIELD,
  INPUT_MATERIAL_FIELD, QUOTE_MODE_FIELD, CUSTOM_QUOTE_FIELD, CUSTOM_RANDOM_QUOTES_FIELD,
  WALLPAPERS_FIELD, CAROUSEL_INTERVAL_FIELD, CAROUSEL_MODE_FIELD,
  resolveSettings, parseCustomQuotes,
  type DecorState, type DecorLayer, type InputMaterial, type QuoteMode, type WallpaperRotation,
} from '../frieren-settings.ts'
import { type FrierenQuote } from './quotes.ts'
import { nextQuote, type QuoteCache } from './quote-roller.ts'
import { WALLPAPER_TRANSPARENCY_CSS } from './wallpaper-css.ts'
import { createWallpaperStage } from './wallpaper-stage.ts'
import { type WallpaperPaintReason } from './wallpaper-transition.ts'
import { clampInterval, encodeWallpaperList, nextWallpaperIndex, resolveWallpaperList } from './wallpaper-list.ts'
import { wallpaperFilesToDelete } from '../wallpaper-names.ts'
import { forgetWallpapers } from './persist-wallpaper.ts'
import { castingVisible } from './casting.ts'
import { pickDecorSubset, scaleDuration } from './decor-tuning.ts'
import { detectPerfTier, type PerfTier } from './perf-tier.ts'
import { decorationsVisible } from './focus.ts'
import { en, zh, type FrierenLocaleKey } from './locales.ts'
import { FriSettingsBridge } from './fri-settings-bridge.ts'
import { FriSection } from './FriSection.tsx'
import { EnableRow, type EnableRowInjected } from './EnableRow.tsx'
import { ResetRow, type ResetRowInjected } from './ResetRow.tsx'
import { SchemeRow, type SchemeRowInjected } from './SchemeRow.tsx'
import { WallpaperUploadRow, type WallpaperUploadRowInjected } from './WallpaperUploadRow.tsx'
import { WallpaperCarouselRow, type WallpaperCarouselRowInjected } from './WallpaperCarouselRow.tsx'
import { MaterialRow, type MaterialRowInjected } from './MaterialRow.tsx'
import { DecorRow, type DecorRowInjected } from './DecorRow.tsx'
import { DecorTuningRow, type DecorTuningRowInjected } from './DecorTuningRow.tsx'
import { PerfRow, type PerfRowInjected } from './PerfRow.tsx'
import { FocusRow, type FocusRowInjected } from './FocusRow.tsx'
import { BackupRow, type BackupRowInjected } from './BackupRow.tsx'
import { QuoteModeRow, type QuoteModeRowInjected } from './QuoteModeRow.tsx'

interface SparkleSpec {
  left: string
  top: string
  size: number
  delay: number
  dur: number
  tone: 'gold' | 'peri'
}

const SPARKLES: readonly SparkleSpec[] = [
  { left: '5%', top: '16%', size: 14, delay: 0, dur: 3.4, tone: 'gold' },
  { left: '13%', top: '74%', size: 10, delay: 0.9, dur: 2.8, tone: 'peri' },
  { left: '23%', top: '9%', size: 12, delay: 1.7, dur: 3.7, tone: 'peri' },
  { left: '32%', top: '84%', size: 9, delay: 0.4, dur: 3.1, tone: 'gold' },
  { left: '46%', top: '17%', size: 13, delay: 2.3, dur: 3.5, tone: 'gold' },
  { left: '57%', top: '87%', size: 11, delay: 1.3, dur: 3.9, tone: 'peri' },
  { left: '66%', top: '11%', size: 10, delay: 0.6, dur: 3.0, tone: 'peri' },
  { left: '75%', top: '68%', size: 14, delay: 1.9, dur: 3.3, tone: 'gold' },
  { left: '83%', top: '24%', size: 11, delay: 2.7, dur: 3.2, tone: 'gold' },
  { left: '91%', top: '50%', size: 9, delay: 1.1, dur: 2.7, tone: 'peri' },
  { left: '41%', top: '57%', size: 8, delay: 2.1, dur: 2.6, tone: 'gold' },
]

interface FlowerSpec {
  left: string
  size: number
  delay: number
  dur: number
}

const FLOWERS: readonly FlowerSpec[] = [
  { left: '8%', size: 15, delay: 0, dur: 14 },
  { left: '18%', size: 11, delay: 4, dur: 17 },
  { left: '36%', size: 13, delay: 7, dur: 15 },
  { left: '55%', size: 10, delay: 2, dur: 19 },
  { left: '68%', size: 15, delay: 9, dur: 13 },
  { left: '84%', size: 12, delay: 5, dur: 16 },
  { left: '47%', size: 9, delay: 11, dur: 18 },
]

/** How long a rotation waits for the next image to decode before flying anyway. */
const WALLPAPER_DECODE_TIMEOUT_MS = 1500

/** Bare observable the renderer binds into a use<Name> selector hook. */
interface BareObservable<T> {
  getSnapshot(): T
  subscribe(fn: () => void): () => void
}

/** 苍月草 (blue moon weed): five pale-blue petals around a gold core. */
function BlueFlower(props: { size: number; className?: string; style?: React.CSSProperties }): React.ReactElement {
  const petals = [0, 72, 144, 216, 288].map((angle) =>
    React.createElement('g', { key: angle, transform: `rotate(${angle} 12 12)` },
      React.createElement('ellipse', { cx: 12, cy: 5.5, rx: 3.5, ry: 5.2, fill: 'rgba(143, 168, 224, 0.35)', stroke: '#7b9dd6', strokeWidth: 1.2 }),
    ),
  )
  return React.createElement('svg', {
    viewBox: '0 0 24 24',
    width: props.size,
    height: props.size,
    className: props.className ?? '',
    style: props.style,
    'aria-hidden': true,
  },
    // Soft glow halo behind the flower
    React.createElement('circle', { cx: 12, cy: 12, r: 10, fill: 'rgba(143, 168, 224, 0.08)' }),
    React.createElement('g', { opacity: 0.92 }, petals),
    React.createElement('circle', { cx: 12, cy: 12, r: 1.8, fill: '#e8c96a' }),
    React.createElement('circle', { cx: 12, cy: 12, r: 0.8, fill: '#f5dc8a' }),
  )
}

/** Component props of the decorative stage: the settings-backed selector hooks. */
type FriStageProps = InjectFace<{ hooks: {
  enabled: BareObservable<boolean>
  decor: BareObservable<DecorState>
  focus: BareObservable<boolean>
} }>

/** Frame-wide decorative stage: glow, sparkles, falling flowers, magic circle, ribbon, vignette. */
function FriStage({ useEnabled, useDecor, useFocus }: FriStageProps): React.ReactElement | null {
  // Every hook runs unconditionally: an early return between hook calls would
  // trip React's rules-of-hooks (error #300) and crash the slot entry the
  // moment the switch turns off.
  const enabled = useEnabled(enabled => enabled)
  const decor = useDecor(value => value)
  const focus = useFocus(value => value)
  if (!decorationsVisible(enabled === true, focus === true)) return null
  const sparkles = decor?.sparkles ?? true
  const flowers = decor?.flowers ?? true
  const circle = decor?.circle ?? true
  const ribbon = decor?.ribbon ?? true
  const vignette = decor?.vignette ?? true
  // Tuning: density thins each set (spread across the viewport rather than
  // trimmed to one side), speed scales every animation duration, and the
  // circle scale resizes the magic circle around its own centre.
  const sparkleSet = pickDecorSubset(SPARKLES, decor?.density ?? 1)
  const flowerSet = pickDecorSubset(FLOWERS, decor?.density ?? 1)
  const speed = decor?.speed ?? 1
  const circleScale = decor?.circleScale ?? 1
  return React.createElement('div', { className: 'fri-stage', 'aria-hidden': true },
    // The starfield rides inside the stage: the stage is already mounted only
    // while decorations are visible, so the master switch and focus mode gate
    // the stars for free, and the stage's own stacking keeps them above the
    // app frame (a negative-z layer would hide behind the frame's opaque body
    // paint whenever no wallpaper is set). The dark gate is CSS-only.
    React.createElement('div', { className: 'fri-stars' }),
    React.createElement('div', { className: 'fri-glow' }),
    sparkles && sparkleSet.map((s, i) => React.createElement('span', {
      key: `s${i}`,
      className: s.tone === 'gold' ? 'fri-sparkle fri-sparkle-gold' : 'fri-sparkle fri-sparkle-peri',
      style: {
        left: s.left,
        top: s.top,
        fontSize: s.size,
        animationDelay: `${s.delay}s`,
        animationDuration: `${scaleDuration(s.dur, speed)}s`,
      },
    }, s.tone === 'gold' ? '✦' : '✧')),
    flowers && flowerSet.map((f, i) => React.createElement(BlueFlower, {
      key: `f${i}`,
      size: f.size,
      className: 'fri-flower',
      style: {
        left: f.left,
        animationDelay: `${f.delay}s`,
        animationDuration: `${scaleDuration(f.dur, speed)}s`,
      },
    })),
    circle && React.createElement('div', { className: 'fri-circle', style: { transform: `scale(${circleScale})` } },
      React.createElement('div', { className: 'fri-circle-glow' }),
      React.createElement('span', { className: 'fri-circle-ring fri-circle-ring-a' }),
      React.createElement('span', { className: 'fri-circle-ring fri-circle-ring-b' }),
      React.createElement('span', { className: 'fri-circle-ring fri-circle-ring-c' }),
      React.createElement('span', { className: 'fri-circle-core' }, '❁'),
    ),
    ribbon && React.createElement('div', { className: 'fri-ribbon' }),
    vignette && React.createElement('div', { className: 'fri-vignette' }),
  )
}

/** Sidebar seal: the hero Himmel's golden ring holding a blue moon weed; clicking it toggles focus mode. */
type FriSealProps = PropsLocale<'settings.frieren'> & InjectFace<{
  toggleFocus: () => void
  hooks: {
    enabled: BareObservable<boolean>
    focus: BareObservable<boolean>
  }
}>

function FriSeal({ t, toggleFocus, useEnabled, useFocus }: FriSealProps): React.ReactElement | null {
  const enabled = useEnabled(value => value)
  const focus = useFocus(value => value)
  if (enabled === false) return null
  const focused = focus === true
  return React.createElement('div', {
    className: focused ? 'fri-seal fri-seal-focused' : 'fri-seal',
    title: t('focus.seal.hint'),
    role: 'button',
    tabIndex: 0,
    'aria-pressed': focused,
    onClick: () => { toggleFocus() },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggleFocus()
      }
    },
  },
    React.createElement('span', { className: 'fri-seal-ring' }),
    React.createElement(BlueFlower, { size: 14 }),
  )
}

/** Session-header badge: 蒼月草が咲く頃に. */
type FriBadgeProps = InjectFace<{ hooks: { enabled: BareObservable<boolean> } }>

function FriBadge({ useEnabled }: FriBadgeProps): React.ReactElement | null {
  const enabled = useEnabled(value => value)
  if (enabled === false) return null
  return React.createElement('div', { className: 'fri-badge', title: '蒼月草が咲く頃に —— 葬送的芙莉莲 × 勇者辛美尔' },
    React.createElement('span', { 'aria-hidden': true }, '❀'),
    React.createElement('span', null, '蒼月草が咲く頃に'),
  )
}

/** Composer dock quote: rotates per the quote mode; the gloss rides the tooltip. */
type FriQuoteProps = PropsLocale<'settings.frieren'> & InjectFace<{
  rerollQuote: () => void
  hooks: {
    quote: BareObservable<FrierenQuote>
    enabled: BareObservable<boolean>
  }
}>

function FriQuote({ t, rerollQuote, useQuote, useEnabled }: FriQuoteProps): React.ReactElement | null {
  const enabled = useEnabled(value => value)
  const quote = useQuote(value => value)
  if (enabled === false) return null
  if (quote === undefined) return null
  // The line is a button in spirit: clicking rolls the next quote. The gloss
  // and the roll hint share the tooltip.
  const hint = t('quote.reroll.hint')
  const tooltip = quote.zh === '' ? hint : `${quote.zh}\n${hint}`
  return React.createElement('div', {
    className: 'fri-dock fri-dock-clickable',
    title: tooltip,
    role: 'button',
    tabIndex: 0,
    onClick: () => { rerollQuote() },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        rerollQuote()
      }
    },
  },
    React.createElement('span', { className: 'fri-dock-star', 'aria-hidden': true }, '✦'),
    React.createElement('span', null, quote.ja),
    quote.speakerJa !== '' && React.createElement('span', { className: 'fri-dock-sub' }, `—— ${quote.speakerJa} · ${t('quote.series')}`),
  )
}

/**
 * Casting badge: a small magic circle floating above the composer card while
 * the addressed agent is working — "the mage is chanting". Session-scoped, so
 * `useSession` (a runtime-provided standard prop) carries the busy flag; the
 * badge renders nothing at all while idle, so it never reserves layout.
 */
type FriCastingProps =
  PropsRuntime<'conversation.input.overlay'>
  & PropsLocale<'settings.frieren'>
  & InjectFace<{ hooks: { enabled: BareObservable<boolean> } }>

function FriCasting({ t, useEnabled, useSession }: FriCastingProps): React.ReactElement | null {
  const enabled = useEnabled(value => value)
  // Mirrors the composer's own read: `running` is absent when no addressed
  // agent exists, which must count as idle rather than busy.
  const running = useSession(s => s.running) ?? false
  if (!castingVisible(enabled === true, running)) return null
  return React.createElement('div', {
    className: 'fri-casting',
    title: t('casting.title'),
    role: 'status',
    'aria-live': 'polite',
  },
    React.createElement('span', { className: 'fri-casting-ring', 'aria-hidden': true }),
    React.createElement('span', null, t('casting.label')),
  )
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * One preference row inside the Frieren theme section. Declared at
     * runtime by this plugin's section entry (mirrors the settings domain's
     * 'settings.general.item' contract); the type lives here so the section
     * and its rows can collaborate.
     */
    'settings.frieren.item': { kind: 'list'; scope: 'root'; owner: { children?: never } }
  }
  interface LocaleNamespaceMap {
    /** The Frieren theme section and its rows' copy. */
    'settings.frieren': FrierenLocaleKey
  }
}

/** Dictionary namespace owned by the theme section and its rows. */
const LOCALE_NS = 'settings.frieren'

/** Required services: the theme registry, the slot system, and the locale registry. */
export const inject = ['theme', 'slots', 'locale']

/**
 * Client plugin body: gate every effect (theme chrome stylesheet, wallpaper
 * stylesheet, custom-wallpaper override, input-card material, decorative stage,
 * seal, badge, dock quote) on the user-owned `enabled` master switch plus their
 * individual settings, and register the "Frieren theme" settings section with
 * its rows (master switch, appearance, upload, material, decorations, quote
 * mode with custom quote support, restore defaults). Every side effect is owned
 * by this plugin's fiber and removed on dispose.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // The durable `frieren-zzj` settings namespace. The harness settings RPC
  // allowlist refuses third-party namespaces, so the value rides this
  // package's own bridge route (node half) instead of settingsScope. Until
  // the first read lands (or in a deployment without the node half) everything
  // stays on with defaults — the switches are opt-out, never opt-in.
  const scope = new FriSettingsBridge()
  ctx.effect(() => {
    scope.start()
    return () => scope.dispose()
  }, 'frieren-zzj: settings bridge scope')
  const settingsOf = (): ReturnType<typeof resolveSettings> => {
    const snapshot = scope.getSnapshot()
    return resolveSettings(snapshot.status === 'ready' ? snapshot.value : undefined)
  }

  // Theme chrome: fonts, scrollbar, seal, badge, dock quote — present exactly
  // while the master switch is on.
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'frieren-zzj'
    tag.textContent = FRI_BASE_CSS
    const sync = (): void => {
      if (settingsOf().enabled) {
        if (!tag.isConnected) document.head.appendChild(tag)
      } else if (tag.isConnected) {
        tag.remove()
      }
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => { unsubscribe(); tag.remove() }
  }, 'frieren-zzj: theme chrome stylesheet')

  // Observable sources the stage, dock, and rows bind through use<Name> hooks.
  const enabledSource: BareObservable<boolean> = {
    getSnapshot: () => settingsOf().enabled,
    subscribe: (fn) => scope.subscribe(fn),
  }

  // Decor state is an object: cache one stable reference per settings
  // revision so uSES never sees a fresh identity between snapshots.
  let decorCache: { revision: number | undefined; state: DecorState } | undefined
  const decorSource: BareObservable<DecorState> = {
    getSnapshot: () => {
      const revision = scope.getSnapshot().revision
      if (decorCache === undefined || decorCache.revision !== revision) {
        const s = settingsOf()
        decorCache = {
          revision,
          state: {
            sparkles: s.decorSparkles, flowers: s.decorFlowers, circle: s.decorCircle,
            ribbon: s.decorRibbon, vignette: s.decorVignette,
            density: s.decorDensity, speed: s.decorSpeed, circleScale: s.decorCircleScale,
          },
        }
      }
      return decorCache.state
    },
    subscribe: (fn) => scope.subscribe(fn),
  }

  const customWallpaperSource: BareObservable<string> = {
    getSnapshot: () => settingsOf().customWallpaper,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const wallpaperBlurSource: BareObservable<number> = {
    getSnapshot: () => settingsOf().wallpaperBlur,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const wallpaperDimSource: BareObservable<number> = {
    getSnapshot: () => settingsOf().wallpaperDim,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const customWallpapersSource: BareObservable<string> = {
    getSnapshot: () => settingsOf().customWallpapers,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const carouselIntervalSource: BareObservable<number> = {
    getSnapshot: () => settingsOf().carouselInterval,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const carouselModeSource: BareObservable<WallpaperRotation> = {
    getSnapshot: () => settingsOf().carouselMode,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const materialSource: BareObservable<InputMaterial> = {
    getSnapshot: () => settingsOf().inputMaterial,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const decorDensitySource: BareObservable<number> = {
    getSnapshot: () => settingsOf().decorDensity,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const decorSpeedSource: BareObservable<number> = {
    getSnapshot: () => settingsOf().decorSpeed,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const circleScaleSource: BareObservable<number> = {
    getSnapshot: () => settingsOf().decorCircleScale,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const focusModeSource: BareObservable<boolean> = {
    getSnapshot: () => settingsOf().focusMode,
    subscribe: (fn) => scope.subscribe(fn),
  }

  /** Flip focus mode; the sidebar seal and the settings row share this write. */
  const toggleFocus = (): void => { void scope.set(FOCUS_MODE_FIELD, !settingsOf().focusMode) }

  const quoteModeSource: BareObservable<QuoteMode> = {
    getSnapshot: () => settingsOf().quoteMode,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const customQuoteSource: BareObservable<string> = {
    getSnapshot: () => settingsOf().customQuote,
    subscribe: (fn) => scope.subscribe(fn),
  }

  // Quote resolution: one stable quote per (settings revision, local roll), so
  // random mode re-rolls on any settings change AND when the user clicks the
  // dock line. The roll counter is deliberately session-local: "one more line"
  // is a look-at-it-now gesture, not a preference worth persisting.
  let quoteCache: QuoteCache | undefined
  let quoteRoll = 0
  const quoteRollListeners = new Set<() => void>()
  const quoteSource: BareObservable<FrierenQuote> = {
    getSnapshot: () => {
      const s = settingsOf()
      quoteCache = nextQuote(
        quoteCache,
        scope.getSnapshot().revision,
        quoteRoll,
        s.quoteMode,
        s.customQuote,
        parseCustomQuotes(s.customRandomQuotes),
      )
      return quoteCache.quote
    },
    subscribe: (fn) => {
      const unsubscribe = scope.subscribe(fn)
      quoteRollListeners.add(fn)
      return () => { unsubscribe(); quoteRollListeners.delete(fn) }
    },
  }

  /** Roll the next dock quote without touching settings. */
  const rerollQuote = (): void => {
    quoteRoll += 1
    // Notify a snapshot of the listeners: a subscriber may unsubscribe while
    // reacting, which must not perturb this iteration.
    for (const fn of [...quoteRollListeners]) fn()
  }

  // The appearance preference rides the theme service's own durable
  // namespace; the observable mirrors it through the theme/change event.
  const schemeSource: BareObservable<'light' | 'dark' | 'system'> = {
    getSnapshot: () => ctx.theme.getTheme().preference,
    subscribe: (fn) => ctx.on('theme/change', fn),
  }

  // Decor CSS: .fri-stage and all decoration element styles. Always present
  // while the plugin is on, independent of whether a wallpaper is set —
  // decorations (sparkles, flowers, magic circle, ribbon, vignette, glow)
  // are visual overlays that work on any background, including none.
  // Previously these rules were bundled inside FRI_WALLPAPER_CSS, which
  // caused them to vanish when the built-in wallpaper was absent — the
  // root cause of decorations collapsing to the top-left corner.
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'frieren-zzj-decor'
    const sync = (): void => {
      if (settingsOf().enabled) {
        if (!tag.isConnected) {
          tag.textContent = FRI_DECOR_CSS
          document.head.appendChild(tag)
        }
      } else if (tag.isConnected) {
        tag.remove()
      }
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => { unsubscribe(); tag.remove() }
  }, 'frieren-zzj: decor stylesheet')

  // Custom wallpaper stage: two fixed full-viewport image layers mounted BEHIND
  // the app frame (negative z-index), plus the veil that keeps text readable over
  // them. The key insight (borrowed from dsh-wallpaper-engine) is that the DSH
  // app frame paints an opaque background via the --dsw-alias-bg-base token,
  // which would completely hide a negative-z layer; so we set a body attribute
  // `data-frieren-wallpaper` and inject WALLPAPER_TRANSPARENCY_CSS, which
  // overrides --dsw-alias-bg-base (and the sidebar fill) while a wallpaper is
  // active — per palette, so the light theme keeps a light surface under its
  // near-black ink instead of dropping the text onto the image.
  //
  // Two image layers exist because the carousel's rotation is a DEPTH FLY-THROUGH
  // (planned by ./wallpaper-transition.ts): the incoming image arrives from the
  // distance while the outgoing one is flung past the viewer. Only a rotation
  // tick animates — every other paint (blur/dim drag, upload, switch, first
  // mount) hard-cuts, or the UI would fly on each slider step.
  // Initial state is NO wallpaper (no layer is mounted).
  ctx.effect(() => {
    // Inject the transparency CSS once (idempotent).
    const transparencyTag = document.createElement('style')
    transparencyTag.dataset.pluginCss = 'frieren-zzj-wallpaper-transparency'
    transparencyTag.textContent = WALLPAPER_TRANSPARENCY_CSS
    document.head.appendChild(transparencyTag)

    /** Whether the user asked for reduced motion (the OS-level switch). */
    const prefersReducedMotion = (): boolean =>
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

    /**
     * Resolve once the image can be painted, or after the timeout: a flight that
     * starts before the bitmap is decoded would fade in an empty layer.
     */
    const decodeWallpaper = (url: string, timeoutMs: number): Promise<void> =>
      new Promise((resolve) => {
        if (typeof Image !== 'function') {
          resolve()
          return
        }
        let timerId: ReturnType<typeof setTimeout> | undefined
        let done = false
        const settleDecode = (): void => {
          if (done) return
          done = true
          if (timerId !== undefined) clearTimeout(timerId)
          resolve()
        }
        timerId = setTimeout(settleDecode, timeoutMs)
        const image = new Image()
        image.onload = settleDecode
        image.onerror = settleDecode
        image.src = url
        if (typeof image.decode === 'function') image.decode().then(settleDecode, settleDecode)
      })

    // The stage owns the layers and the flight; this effect owns what to show
    // (the gallery and its rotation) and hands the stage the world it needs.
    const stage = createWallpaperStage({
      createElement: () => document.createElement('div'),
      mount: (nodes) => { document.body.append(...nodes) },
      readState: () => {
        const s = settingsOf()
        return {
          enabled: s.enabled && resolveWallpaperList(s.customWallpaper, s.customWallpapers).length > 0,
          blurPx: s.wallpaperBlur,
          dim: s.wallpaperDim,
          reducedMotion: prefersReducedMotion(),
          eco: detectPerfTier(s.decorDensity, s.decorSpeed, s.inputMaterial) === 'eco',
        }
      },
      decode: (url) => decodeWallpaper(url, WALLPAPER_DECODE_TIMEOUT_MS),
    })

    let timer: ReturnType<typeof setInterval> | null = null
    let index = 0
    let period = -1

    const clearTimer = (): void => {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      period = -1
    }

    /**
     * Hand the current gallery image to the stage. Settings are read fresh on
     * every call, so the rotation tick never paints from a stale closure.
     */
    const paint = (reason: WallpaperPaintReason): void => {
      const s = settingsOf()
      const list = resolveWallpaperList(s.customWallpaper, s.customWallpapers)
      if (!s.enabled || list.length === 0) {
        clearTimer()
        document.body.removeAttribute('data-frieren-wallpaper')
        stage.teardown()
        return
      }
      if (index >= list.length) index = 0
      const url = list[index] ?? list[0]
      if (url === undefined) return
      // Mark the body so the transparency CSS kicks in.
      document.body.setAttribute('data-frieren-wallpaper', 'on')
      stage.paint(url, reason)
    }

    /** Keep the rotation timer in step with the gallery size and the interval. */
    const syncTimer = (): void => {
      const s = settingsOf()
      const list = resolveWallpaperList(s.customWallpaper, s.customWallpapers)
      if (!s.enabled || list.length <= 1) {
        clearTimer()
        return
      }
      const wanted = clampInterval(s.carouselInterval) * 1000
      if (timer !== null && period === wanted) return
      clearTimer()
      timer = setInterval(() => {
        const now = settingsOf()
        const liveList = resolveWallpaperList(now.customWallpaper, now.customWallpapers)
        if (!now.enabled || liveList.length <= 1) {
          clearTimer()
          paint('settings')
          return
        }
        index = nextWallpaperIndex(index, liveList.length, now.carouselMode)
        paint('rotate')
      }, wanted)
      period = wanted
    }

    const sync = (): void => {
      paint('settings')
      syncTimer()
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => {
      unsubscribe()
      clearTimer()
      transparencyTag.remove()
      document.body.removeAttribute('data-frieren-wallpaper')
      stage.teardown()
    }
  }, 'frieren-zzj: custom wallpaper layer')

  // Input-card material stylesheet: present exactly while the plugin is on
  // and the material is 'glass' (iOS frosted look); 'plain' removes it and
  // the card falls back to its default surface. Dark rules ride
  // `body[data-ds-dark-theme]`, so the dark glass follows the user's manual
  // light/dark/system preference.
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'frieren-zzj-input-material'
    const sync = (): void => {
      const s = settingsOf()
      if (s.enabled && s.inputMaterial === 'glass') {
        if (!tag.isConnected) {
          tag.textContent = GLASS_CSS
          document.head.appendChild(tag)
        }
      } else if (tag.isConnected) {
        tag.remove()
      }
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => { unsubscribe(); tag.remove() }
  }, 'frieren-zzj: input material stylesheet')

  // Frame stage: registered once, rendering nothing while the switch is off.
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'frieren-stage',
    order: 100,
    inject: () => ({
      hooks: {
        enabled: enabledSource,
        decor: decorSource,
        focus: focusModeSource,
      },
    }),
  }, FriStage))

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'frieren-seal',
    order: 100,
    label: () => '勇者辛美尔的金戒指',
    locale: LOCALE_NS,
    inject: () => ({
      toggleFocus,
      hooks: { enabled: enabledSource, focus: focusModeSource },
    }),
  }, FriSeal))

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'frieren-badge',
    order: 100,
    label: () => '苍月草主题徽记',
    inject: () => ({ hooks: { enabled: enabledSource } }),
  }, FriBadge))

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'frieren-quote',
    order: 100,
    locale: LOCALE_NS,
    inject: () => ({ rerollQuote, hooks: { quote: quoteSource, enabled: enabledSource } }),
  }, FriQuote))

  // Casting badge: session-scoped, so the runtime hands it the `useSession`
  // busy selector; it renders nothing while the agent is idle.
  ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({
    name: 'conversation.input.overlay',
    id: 'frieren-casting',
    order: 90,
    locale: LOCALE_NS,
    inject: () => ({ hooks: { enabled: enabledSource } }),
  }, FriCasting))

  // The Frieren theme settings section: a nav entry beside General, owning
  // its own item slot so every theme setting lives in one page.
  ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), 'frieren-zzj: section dictionaries')
  const t = ctx.locale.bind(LOCALE_NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'frieren',
    order: 10,
    label: () => t('section.nav'),
    locale: LOCALE_NS,
    children: { 'settings.frieren.item': { kind: 'list', scope: 'root' } },
  }, FriSection))

  // Rows of the theme section, in display order: master switch first, the
  // theme settings behind it, restore-defaults last.
  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-enable',
    order: 5,
    locale: LOCALE_NS,
    inject: (): EnableRowInjected => ({
      setEnabled: (enabled: boolean) => { void scope.set(ENABLED_FIELD, enabled) },
      hooks: { enabled: enabledSource },
    }),
  }, EnableRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-scheme',
    order: 20,
    locale: LOCALE_NS,
    inject: (): SchemeRowInjected => ({
      setScheme: (preference) => { ctx.theme.setTheme(preference) },
      hooks: { scheme: schemeSource, enabled: enabledSource },
    }),
  }, SchemeRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-upload',
    order: 30,
    locale: LOCALE_NS,
    inject: (): WallpaperUploadRowInjected => ({
      setWallpaperBlur: (blur: number) => { void scope.set(WALLPAPER_BLUR_FIELD, blur) },
      setWallpaperDim: (dim: number) => { void scope.set(WALLPAPER_DIM_FIELD, dim) },
      // Read straight from the settings bridge, not from a render snapshot: the
      // upload flow checks capacity while an upload is in flight.
      readGallery: () => {
        const s = settingsOf()
        return resolveWallpaperList(s.customWallpaper, s.customWallpapers)
      },
      // The gallery becomes the single source of truth from the first edit on:
      // writing it also clears the legacy single-wallpaper field, which the
      // resolver folds into the list until then.
      setGallery: (list: readonly string[]) => {
        void scope.set(WALLPAPERS_FIELD, encodeWallpaperList(list))
        void scope.set(CUSTOM_WALLPAPER_FIELD, '')
      },
      clearGallery: () => {
        void scope.set(WALLPAPERS_FIELD, '')
        void scope.set(CUSTOM_WALLPAPER_FIELD, '')
      },
      hooks: {
        customWallpaper: customWallpaperSource,
        customWallpapers: customWallpapersSource,
        wallpaperBlur: wallpaperBlurSource,
        wallpaperDim: wallpaperDimSource,
        enabled: enabledSource,
      },
    }),
  }, WallpaperUploadRow))

  // Gallery rotation controls: only meaningful with two or more images, so the
  // row hides itself while the gallery holds fewer (it still mounts, keeping
  // the hooks unconditional).
  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-carousel',
    order: 32,
    locale: LOCALE_NS,
    inject: (): WallpaperCarouselRowInjected => ({
      setInterval: (seconds: number) => { void scope.set(CAROUSEL_INTERVAL_FIELD, seconds) },
      setMode: (mode: WallpaperRotation) => { void scope.set(CAROUSEL_MODE_FIELD, mode) },
      hooks: {
        gallery: customWallpapersSource,
        single: customWallpaperSource,
        interval: carouselIntervalSource,
        mode: carouselModeSource,
        enabled: enabledSource,
      },
    }),
  }, WallpaperCarouselRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-material',
    order: 35,
    locale: LOCALE_NS,
    inject: (): MaterialRowInjected => ({
      setMaterial: (material: InputMaterial) => { void scope.set(INPUT_MATERIAL_FIELD, material) },
      hooks: { material: materialSource, enabled: enabledSource },
    }),
  }, MaterialRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-decor',
    order: 40,
    locale: LOCALE_NS,
    inject: (): DecorRowInjected => ({
      setDecor: (field: DecorLayer, enabled: boolean) => {
        const fieldName = field === 'sparkles' ? DECOR_SPARKLES_FIELD
          : field === 'flowers' ? DECOR_FLOWERS_FIELD
            : field === 'circle' ? DECOR_CIRCLE_FIELD
              : field === 'ribbon' ? DECOR_RIBBON_FIELD
                : DECOR_VIGNETTE_FIELD
        void scope.set(fieldName, enabled)
      },
      hooks: { decor: decorSource, enabled: enabledSource },
    }),
  }, DecorRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-decor-tuning',
    order: 45,
    locale: LOCALE_NS,
    inject: (): DecorTuningRowInjected => ({
      setDensity: (value: number) => { void scope.set(DECOR_DENSITY_FIELD, value) },
      setSpeed: (value: number) => { void scope.set(DECOR_SPEED_FIELD, value) },
      setCircleScale: (value: number) => { void scope.set(CIRCLE_SCALE_FIELD, value) },
      hooks: {
        density: decorDensitySource,
        speed: decorSpeedSource,
        circleScale: circleScaleSource,
        enabled: enabledSource,
      },
    }),
  }, DecorTuningRow))

  // Performance tiers: one click writes density, speed, and material together.
  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-perf',
    order: 46,
    locale: LOCALE_NS,
    inject: (): PerfRowInjected => ({
      setTier: (tier: PerfTier) => {
        void scope.set(DECOR_DENSITY_FIELD, tier.density)
        void scope.set(DECOR_SPEED_FIELD, tier.speed)
        void scope.set(INPUT_MATERIAL_FIELD, tier.material)
      },
      hooks: {
        density: decorDensitySource,
        speed: decorSpeedSource,
        material: materialSource,
        enabled: enabledSource,
      },
    }),
  }, PerfRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-focus',
    order: 42,
    locale: LOCALE_NS,
    inject: (): FocusRowInjected => ({
      setFocusMode: (value: boolean) => { void scope.set(FOCUS_MODE_FIELD, value) },
      hooks: { focus: focusModeSource, enabled: enabledSource },
    }),
  }, FocusRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-quote-mode',
    order: 50,
    locale: LOCALE_NS,
    inject: (): QuoteModeRowInjected => ({
      setQuoteMode: (mode: QuoteMode) => { void scope.set(QUOTE_MODE_FIELD, mode) },
      setCustomQuote: (text: string) => { void scope.set(CUSTOM_QUOTE_FIELD, text) },
      setCustomRandomQuotes: (json: string) => { void scope.set(CUSTOM_RANDOM_QUOTES_FIELD, json) },
      hooks: {
        quoteMode: quoteModeSource,
        customQuote: customQuoteSource,
        customRandomQuotes: { getSnapshot: () => settingsOf().customRandomQuotes, subscribe: (fn) => scope.subscribe(fn) },
        enabled: enabledSource,
      },
    }),
  }, QuoteModeRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-backup',
    order: 53,
    locale: LOCALE_NS,
    inject: (): BackupRowInjected => ({
      readSettings: () => settingsOf(),
      // Merge, never wholesale-replace: an imported file that predates a field
      // must leave that field (and an absent wallpaper) alone.
      importSettings: (value) => {
        const before = settingsOf()
        const merged = { ...before, ...value }
        void scope.replace(merged)
        // An import can drop store-backed images just like a manual removal, so
        // the files it orphans go too (best effort; the activation sweep is the
        // backstop for anything that survives).
        void forgetWallpapers(wallpaperFilesToDelete(
          resolveWallpaperList(before.customWallpaper, before.customWallpapers),
          resolveWallpaperList(merged.customWallpaper, merged.customWallpapers),
        ))
      },
      hooks: { enabled: enabledSource },
    }),
  }, BackupRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-reset',
    order: 55,
    locale: LOCALE_NS,
    inject: (): ResetRowInjected => ({
      resetDefaults: () => { void scope.replace(DEFAULT_FRIEREN_SETTINGS) },
    }),
  }, ResetRow))
}

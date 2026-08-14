/**
 * Frieren × Himmel web theme, browser half: the alias-token override layer,
 * the theme chrome stylesheet (fantasy serif headings, gold-lilac scrollbar,
 * seal/badge/dock quote), and — gated by the user-owned settings — the
 * wallpaper stylesheet (watercolor background with per-layer decorations),
 * the wallpaper tone/custom overlay, and the decorative stage. The settings
 * live in a dedicated "Frieren theme" settings section: wallpaper master
 * switch, appearance (light/dark/system via the theme service), wallpaper
 * tone + local upload, content-backdrop separation, per-layer decoration
 * toggles, and quote rotation mode. Presentation only: no business state, no
 * model-visible input.
 */
import * as React from 'react'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the theme service (ctx.theme, theme/change) and slot-name
// Context merges from the declaring packages (client bundle purity gate: no
// value imports).
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: the settings surface's SlotMap merges ('settings.section',
// 'settings.general.item') and the ctx.settingsScope Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { FRI_BASE_CSS } from './fri-base.css.ts'
import { FRI_WALLPAPER_CSS } from './fri-theme.css.ts'
import { wallpaperOverlayCss } from './variants.ts'
import {
  CONTENT_BACKDROP_FIELD, CUSTOM_BRIGHTNESS_FIELD, CUSTOM_WALLPAPER_FIELD, DECOR_CIRCLE_FIELD,
  DECOR_FLOWERS_FIELD, DECOR_RIBBON_FIELD, DECOR_SPARKLES_FIELD, DECOR_VIGNETTE_FIELD,
  FRIEREN_SETTINGS_NAMESPACE, QUOTE_MODE_FIELD, resolveSettings, WALLPAPER_FIELD,
  WALLPAPER_VARIANT_FIELD, wantsSolidBackdrop,
  type ContentBackdropMode, type DecorState, type FrierenSettings, type QuoteMode, type WallpaperVariant,
} from '../frieren-settings.ts'
import { pickQuote, type FrierenQuote } from './quotes.ts'
import { en, zh, type FrierenLocaleKey } from './locales.ts'
import { FriSection } from './FriSection.tsx'
import { WallpaperRow, type WallpaperRowInjected } from './WallpaperRow.tsx'
import { SchemeRow, type SchemeRowInjected } from './SchemeRow.tsx'
import { VariantRow, type VariantRowInjected } from './VariantRow.tsx'
import { BackdropRow, type BackdropRowInjected } from './BackdropRow.tsx'
import { DecorRow, type DecorRowInjected } from './DecorRow.tsx'
import { QuoteModeRow, type QuoteModeRowInjected } from './QuoteModeRow.tsx'

/** Alias-token overrides: lavender parchment (light) / indigo night (dark). */
const TOKENS = {
  '--dsw-alias-bg-base': { light: 'rgba(248,243,236,0.55)', dark: 'rgba(18,19,36,0.72)' },
  '--dsw-alias-bg-layer-1': { light: '#f3ece8', dark: '#23243f' },
  '--dsw-alias-bg-layer-2': { light: '#e9e0e4', dark: '#2b2c4e' },
  '--dsw-alias-bg-overlay': { light: '#faf6f3', dark: '#262744' },
  '--dsw-alias-border-l1': { light: '#d8ccd8', dark: '#3a3c63' },
  '--dsw-alias-border-l2': { light: '#b9a8c2', dark: '#54578c' },
  '--dsw-alias-brand-primary': { light: '#5a63b8', dark: '#9aa3e8' },
  '--dsw-alias-label-primary': { light: '#322f45', dark: '#ece9f5' },
  '--dsw-alias-label-secondary': { light: '#6f6a80', dark: '#a9a6c4' },
  '--dsw-alias-state-error-primary': { light: '#b0554b', dark: '#d98a80' },
  '--dsw-alias-state-success-primary': { light: '#4e7d63', dark: '#8fbe97' },
  '--dsw-alias-state-warn-primary': { light: '#c08f3e', dark: '#dcb463' },
  '--dsw-specific-sidebar-fill': { light: 'rgba(242,234,228,0.55)', dark: 'rgba(16,17,33,0.74)' },
}

/**
 * Solid-content variant of the token layer: near-opaque base and sidebar
 * fills, so a bright/warm custom wallpaper stays outside the message area.
 * Everything else keeps the translucent palette.
 */
const SOLID_TOKENS = {
  ...TOKENS,
  '--dsw-alias-bg-base': { light: 'rgba(248,243,236,0.96)', dark: 'rgba(18,19,36,0.94)' },
  '--dsw-specific-sidebar-fill': { light: 'rgba(242,234,228,0.96)', dark: 'rgba(16,17,33,0.95)' },
}

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

/** Bare observable the renderer binds into a use<Name> selector hook. */
interface BareObservable<T> {
  getSnapshot(): T
  subscribe(fn: () => void): () => void
}

/** 苍月草 (blue moon weed): five pale-blue petals around a gold core. */
function BlueFlower(props: { size: number; className?: string; style?: React.CSSProperties }): React.ReactElement {
  const petals = [0, 72, 144, 216, 288].map((angle) =>
    React.createElement('g', { key: angle, transform: `rotate(${angle} 12 12)` },
      React.createElement('ellipse', { cx: 12, cy: 6.8, rx: 3.1, ry: 4.5 }),
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
    React.createElement('g', { fill: 'none', stroke: '#8fa8e0', strokeWidth: 1.5, opacity: 0.9 }, petals),
    React.createElement('circle', { cx: 12, cy: 12, r: 2.1, fill: '#e8c96a' }),
  )
}

/** Component props of the decorative stage: the settings-backed selector hooks. */
type FriStageProps = InjectFace<{ hooks: {
  wallpaperEnabled: BareObservable<boolean>
  decor: BareObservable<DecorState>
} }>

/** Frame-wide decorative stage: glow, sparkles, falling flowers, magic circle, ribbon, vignette. */
function FriStage({ useWallpaperEnabled, useDecor }: FriStageProps): React.ReactElement | null {
  if (useWallpaperEnabled(enabled => enabled) === false) return null
  const decor = useDecor(value => value)
  const sparkles = decor?.sparkles ?? true
  const flowers = decor?.flowers ?? true
  const circle = decor?.circle ?? true
  const ribbon = decor?.ribbon ?? true
  const vignette = decor?.vignette ?? true
  return React.createElement('div', { className: 'fri-stage', 'aria-hidden': true },
    React.createElement('div', { className: 'fri-glow' }),
    sparkles && SPARKLES.map((s, i) => React.createElement('span', {
      key: `s${i}`,
      className: s.tone === 'gold' ? 'fri-sparkle fri-sparkle-gold' : 'fri-sparkle fri-sparkle-peri',
      style: {
        left: s.left,
        top: s.top,
        fontSize: s.size,
        animationDelay: `${s.delay}s`,
        animationDuration: `${s.dur}s`,
      },
    }, s.tone === 'gold' ? '✦' : '✧')),
    flowers && FLOWERS.map((f, i) => React.createElement(BlueFlower, {
      key: `f${i}`,
      size: f.size,
      className: 'fri-flower',
      style: {
        left: f.left,
        animationDelay: `${f.delay}s`,
        animationDuration: `${f.dur}s`,
      },
    })),
    circle && React.createElement('div', { className: 'fri-circle' },
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

/** Sidebar seal: the hero Himmel's golden ring holding a blue moon weed. */
function FriSeal(): React.ReactElement {
  return React.createElement('div', { className: 'fri-seal', title: '勇者ヒンメルの指輪 — 芙莉莲×辛美尔主题' },
    React.createElement('span', { className: 'fri-seal-ring' }),
    React.createElement(BlueFlower, { size: 14 }),
  )
}

/** Session-header badge: 蒼月草が咲く頃に. */
function FriBadge(): React.ReactElement {
  return React.createElement('div', { className: 'fri-badge', title: '蒼月草が咲く頃に —— 葬送的芙莉莲 × 勇者辛美尔' },
    React.createElement('span', { 'aria-hidden': true }, '❀'),
    React.createElement('span', null, '蒼月草が咲く頃に'),
  )
}

/** Composer dock quote: rotates per the quote mode; the gloss rides the tooltip. */
type FriQuoteProps = PropsLocale<'settings.frieren'> & InjectFace<{ hooks: { quote: BareObservable<FrierenQuote> } }>

function FriQuote({ t, useQuote }: FriQuoteProps): React.ReactElement | null {
  const quote = useQuote(value => value)
  if (quote === undefined) return null
  return React.createElement('div', { className: 'fri-dock', title: quote.zh },
    React.createElement('span', { className: 'fri-dock-star', 'aria-hidden': true }, '✦'),
    React.createElement('span', null, quote.ja),
    React.createElement('span', { className: 'fri-dock-sub' }, `—— ${quote.speakerJa} · ${t('quote.series')}`),
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

/** Required services: the theme registry, the slot system, the settings transport, and the locale registry. */
export const inject = ['theme', 'slots', 'settingsScope', 'locale']

/**
 * Client plugin body: stack the token layer (solid or translucent per the
 * content-backdrop setting), inject the theme chrome stylesheet, gate the
 * wallpaper stylesheet and the tone/custom overlay on the user-owned
 * settings, and register the "Frieren theme" settings section with its six
 * rows. Every side effect is owned by this plugin's fiber and removed on
 * dispose.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  // Theme chrome: fonts, scrollbar, seal, badge, dock quote — always on.
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'frieren-zzj'
    tag.textContent = FRI_BASE_CSS
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'frieren-zzj: theme chrome stylesheet')

  // The durable `frieren-zzj` settings namespace. Until the host section
  // loads (or in a deployment without a settings provider) everything stays
  // on with defaults — the switches are opt-out, never opt-in.
  const scope = ctx.settingsScope.bind<FrierenSettings>({ namespace: FRIEREN_SETTINGS_NAMESPACE })
  const settingsOf = (): ReturnType<typeof resolveSettings> => {
    const snapshot = scope.getSnapshot()
    return resolveSettings(snapshot.status === 'ready' ? snapshot.value : undefined)
  }

  // Token layer: solid while the content-backdrop setting demands it,
  // translucent otherwise. Re-overriding the same source replaces the layer,
  // so switching between the two palettes is a single call.
  ctx.effect(() => {
    let disposeLayer: (() => void) | undefined
    const sync = (): void => {
      disposeLayer = ctx.theme.overrideTokens('frieren-theme', wantsSolidBackdrop(settingsOf()) ? SOLID_TOKENS : TOKENS)
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => { unsubscribe(); disposeLayer?.() }
  }, 'frieren-zzj: token layer')

  // Observable sources the stage, dock, and rows bind through use<Name> hooks.
  const wallpaperSource: BareObservable<boolean> = {
    getSnapshot: () => settingsOf().wallpaper,
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
          },
        }
      }
      return decorCache.state
    },
    subscribe: (fn) => scope.subscribe(fn),
  }

  const variantSource: BareObservable<WallpaperVariant> = {
    getSnapshot: () => settingsOf().wallpaperVariant,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const customWallpaperSource: BareObservable<string> = {
    getSnapshot: () => settingsOf().customWallpaper,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const backdropSource: BareObservable<ContentBackdropMode> = {
    getSnapshot: () => settingsOf().contentBackdrop,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const quoteModeSource: BareObservable<QuoteMode> = {
    getSnapshot: () => settingsOf().quoteMode,
    subscribe: (fn) => scope.subscribe(fn),
  }

  // Quote resolution: one stable quote per settings revision, so random mode
  // re-rolls only when the mode (or any settings change) bumps the revision.
  let quoteCache: { revision: number | undefined; quote: FrierenQuote } | undefined
  const quoteSource: BareObservable<FrierenQuote> = {
    getSnapshot: () => {
      const revision = scope.getSnapshot().revision
      if (quoteCache === undefined || quoteCache.revision !== revision) {
        quoteCache = { revision, quote: pickQuote(settingsOf().quoteMode) }
      }
      return quoteCache.quote
    },
    subscribe: (fn) => scope.subscribe(fn),
  }

  // The appearance preference rides the theme service's own durable
  // namespace; the observable mirrors it through the theme/change event.
  const schemeSource: BareObservable<'light' | 'dark' | 'system'> = {
    getSnapshot: () => ctx.theme.getTheme().preference,
    subscribe: (fn) => ctx.on('theme/change', fn),
  }

  // Wallpaper stylesheet: present exactly while the master switch is on, so
  // turning it off restores the plain app background without a reload.
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'frieren-zzj-wallpaper'
    const sync = (): void => {
      if (settingsOf().wallpaper) {
        if (!tag.isConnected) {
          tag.textContent = FRI_WALLPAPER_CSS
          document.head.appendChild(tag)
        }
      } else if (tag.isConnected) {
        tag.remove()
      }
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => { unsubscribe(); tag.remove() }
  }, 'frieren-zzj: wallpaper stylesheet')

  // Tone/custom overlay: while the wallpaper is on, compose the body
  // background layers (dim layer in dark mode, tone tint, image) with
  // background-blend-mode. The image layer is the custom upload when set,
  // else the built-in `--fri-bg`. background-blend-mode blends layers of the
  // SAME element — immune to stacking-context isolation, so tone switching
  // always takes effect. Re-generating the text is idempotent and cheap.
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'frieren-zzj-wallpaper-overlay'
    const sync = (): void => {
      const s = settingsOf()
      const image = s.customWallpaper !== '' ? `url("${s.customWallpaper}")` : 'var(--fri-bg)'
      const css = wallpaperOverlayCss(s.wallpaperVariant, image)
      if (s.wallpaper && css !== '') {
        tag.textContent = css
        if (!tag.isConnected) document.head.appendChild(tag)
      } else if (tag.isConnected) {
        tag.remove()
      }
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => { unsubscribe(); tag.remove() }
  }, 'frieren-zzj: wallpaper tone/custom overlay')

  // Frame stage: registered once, rendering nothing while the switch is off.
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'frieren-stage',
    order: 100,
    inject: () => ({
      hooks: {
        wallpaperEnabled: wallpaperSource,
        decor: decorSource,
      },
    }),
  }, FriStage))

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
    { name: 'sidebar.footer.action', id: 'frieren-seal', order: 100, label: () => '勇者辛美尔的金戒指' },
    FriSeal,
  ))

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register(
    { name: 'conversation.session.header.utilities', id: 'frieren-badge', order: 100, label: () => '苍月草主题徽记' },
    FriBadge,
  ))

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'frieren-quote',
    order: 100,
    locale: LOCALE_NS,
    inject: () => ({ hooks: { quote: quoteSource } }),
  }, FriQuote))

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

  // Rows of the theme section, in display order.
  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-wallpaper',
    order: 10,
    locale: LOCALE_NS,
    inject: (): WallpaperRowInjected => ({
      setWallpaper: (enabled: boolean) => { void scope.set(WALLPAPER_FIELD, enabled) },
      hooks: { wallpaperEnabled: wallpaperSource },
    }),
  }, WallpaperRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-scheme',
    order: 20,
    locale: LOCALE_NS,
    inject: (): SchemeRowInjected => ({
      setScheme: (preference) => { ctx.theme.setTheme(preference) },
      hooks: { scheme: schemeSource },
    }),
  }, SchemeRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-variant',
    order: 30,
    locale: LOCALE_NS,
    inject: (): VariantRowInjected => ({
      setVariant: (variant: WallpaperVariant) => { void scope.set(WALLPAPER_VARIANT_FIELD, variant) },
      setCustomWallpaper: (dataUrl: string) => { void scope.set(CUSTOM_WALLPAPER_FIELD, dataUrl) },
      setCustomBrightness: (brightness: number) => { void scope.set(CUSTOM_BRIGHTNESS_FIELD, brightness) },
      clearCustomWallpaper: () => { void scope.set(CUSTOM_WALLPAPER_FIELD, '') },
      hooks: { variant: variantSource, customWallpaper: customWallpaperSource },
    }),
  }, VariantRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-backdrop',
    order: 35,
    locale: LOCALE_NS,
    inject: (): BackdropRowInjected => ({
      setBackdrop: (mode: ContentBackdropMode) => { void scope.set(CONTENT_BACKDROP_FIELD, mode) },
      hooks: { backdrop: backdropSource },
    }),
  }, BackdropRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-decor',
    order: 40,
    locale: LOCALE_NS,
    inject: (): DecorRowInjected => ({
      setDecor: (field: keyof DecorState, enabled: boolean) => {
        const fieldName = field === 'sparkles' ? DECOR_SPARKLES_FIELD
          : field === 'flowers' ? DECOR_FLOWERS_FIELD
            : field === 'circle' ? DECOR_CIRCLE_FIELD
              : field === 'ribbon' ? DECOR_RIBBON_FIELD
                : DECOR_VIGNETTE_FIELD
        void scope.set(fieldName, enabled)
      },
      hooks: { decor: decorSource },
    }),
  }, DecorRow))

  ctx.slots.inject('settings.frieren.item', () => ctx.slots.register({
    name: 'settings.frieren.item',
    id: 'frieren-quote-mode',
    order: 50,
    locale: LOCALE_NS,
    inject: (): QuoteModeRowInjected => ({
      setQuoteMode: (mode: QuoteMode) => { void scope.set(QUOTE_MODE_FIELD, mode) },
      hooks: { quoteMode: quoteModeSource },
    }),
  }, QuoteModeRow))
}

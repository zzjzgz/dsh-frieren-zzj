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
// 'settings.general.item').
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { FRI_BASE_CSS } from './fri-base.css.ts'
import { FRI_DECOR_CSS } from './fri-theme.css.ts'
import { GLASS_CSS } from './glass.ts'
import {
  CUSTOM_WALLPAPER_FIELD, WALLPAPER_OPACITY_FIELD, DECOR_CIRCLE_FIELD, DECOR_FLOWERS_FIELD, DECOR_RIBBON_FIELD,
  DECOR_SPARKLES_FIELD, DECOR_VIGNETTE_FIELD, DEFAULT_FRIEREN_SETTINGS, ENABLED_FIELD,
  INPUT_MATERIAL_FIELD, QUOTE_MODE_FIELD, CUSTOM_QUOTE_FIELD, CUSTOM_RANDOM_QUOTES_FIELD,
  resolveSettings, parseCustomQuotes,
  type DecorState, type InputMaterial, type QuoteMode,
} from '../frieren-settings.ts'
import { pickQuote, type FrierenQuote } from './quotes.ts'
import { en, zh, type FrierenLocaleKey } from './locales.ts'
import { FriSettingsBridge } from './fri-settings-bridge.ts'
import { FriSection } from './FriSection.tsx'
import { EnableRow, type EnableRowInjected } from './EnableRow.tsx'
import { ResetRow, type ResetRowInjected } from './ResetRow.tsx'
import { SchemeRow, type SchemeRowInjected } from './SchemeRow.tsx'
import { WallpaperUploadRow, type WallpaperUploadRowInjected } from './WallpaperUploadRow.tsx'
import { MaterialRow, type MaterialRowInjected } from './MaterialRow.tsx'
import { DecorRow, type DecorRowInjected } from './DecorRow.tsx'
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
} }>

/** Frame-wide decorative stage: glow, sparkles, falling flowers, magic circle, ribbon, vignette. */
function FriStage({ useEnabled, useDecor }: FriStageProps): React.ReactElement | null {
  // Both hooks run unconditionally: an early return between hook calls would
  // trip React's rules-of-hooks (error #300) and crash the slot entry the
  // moment the switch turns off.
  const enabled = useEnabled(enabled => enabled)
  const decor = useDecor(value => value)
  if (enabled === false) return null
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
type FriSealProps = InjectFace<{ hooks: { enabled: BareObservable<boolean> } }>

function FriSeal({ useEnabled }: FriSealProps): React.ReactElement | null {
  const enabled = useEnabled(value => value)
  if (enabled === false) return null
  return React.createElement('div', { className: 'fri-seal', title: '勇者ヒンメルの指輪 — 芙莉莲×辛美尔主题' },
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
type FriQuoteProps = PropsLocale<'settings.frieren'> & InjectFace<{ hooks: {
  quote: BareObservable<FrierenQuote>
  enabled: BareObservable<boolean>
} }>

function FriQuote({ t, useQuote, useEnabled }: FriQuoteProps): React.ReactElement | null {
  const enabled = useEnabled(value => value)
  const quote = useQuote(value => value)
  if (enabled === false) return null
  if (quote === undefined) return null
  return React.createElement('div', { className: 'fri-dock', title: quote.zh },
    React.createElement('span', { className: 'fri-dock-star', 'aria-hidden': true }, '✦'),
    React.createElement('span', null, quote.ja),
    quote.speakerJa !== '' && React.createElement('span', { className: 'fri-dock-sub' }, `—— ${quote.speakerJa} · ${t('quote.series')}`),
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

  const wallpaperOpacitySource: BareObservable<number> = {
    getSnapshot: () => settingsOf().wallpaperOpacity,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const materialSource: BareObservable<InputMaterial> = {
    getSnapshot: () => settingsOf().inputMaterial,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const quoteModeSource: BareObservable<QuoteMode> = {
    getSnapshot: () => settingsOf().quoteMode,
    subscribe: (fn) => scope.subscribe(fn),
  }

  const customQuoteSource: BareObservable<string> = {
    getSnapshot: () => settingsOf().customQuote,
    subscribe: (fn) => scope.subscribe(fn),
  }

  // Quote resolution: one stable quote per settings revision, so random mode
  // re-rolls only when the mode (or any settings change) bumps the revision.
  let quoteCache: { revision: number | undefined; quote: FrierenQuote } | undefined
  const quoteSource: BareObservable<FrierenQuote> = {
    getSnapshot: () => {
      const revision = scope.getSnapshot().revision
      if (quoteCache === undefined || quoteCache.revision !== revision) {
        const s = settingsOf()
        const customQuotes = parseCustomQuotes(s.customRandomQuotes)
        quoteCache = { revision, quote: pickQuote(s.quoteMode, s.customQuote, customQuotes) }
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

  // Custom wallpaper layer: when a user uploads an image, a fixed full-screen
  // <div> is mounted as the body's background. This approach is completely
  // independent of the body element's own CSS (which the host app controls),
  // avoiding all cross-priority conflicts. The opacity slider controls the
  // layer's CSS `opacity` property directly. Initial state is NO wallpaper
  // (the div is absent), giving users a clean slate.
  ctx.effect(() => {
    let layer: HTMLDivElement | null = null
    const sync = (): void => {
      const s = settingsOf()
      const custom = s.customWallpaper
      const opacity = s.wallpaperOpacity
      if (s.enabled && custom !== '') {
        if (layer === null) {
          layer = document.createElement('div')
          layer.dataset.frierenWallpaper = ''
          layer.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;background-position:center;background-size:cover;background-repeat:no-repeat;background-attachment:fixed;'
          document.body.insertAdjacentElement('afterbegin', layer)
        }
        // Always update: re-uploads change the URL and the opacity slider
        // changes the opacity value continuously.
        layer.style.backgroundImage = `url("${custom}")`
        layer.style.opacity = String(Math.max(0, Math.min(100, opacity)) / 100)
      } else if (layer !== null) {
        layer.remove()
        layer = null
      }
    }
    sync()
    const unsubscribe = scope.subscribe(sync)
    return () => { unsubscribe(); if (layer !== null) layer.remove() }
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
      },
    }),
  }, FriStage))

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'frieren-seal',
    order: 100,
    label: () => '勇者辛美尔的金戒指',
    inject: () => ({ hooks: { enabled: enabledSource } }),
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
    inject: () => ({ hooks: { quote: quoteSource, enabled: enabledSource } }),
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
      setCustomWallpaper: (dataUrl: string) => { void scope.set(CUSTOM_WALLPAPER_FIELD, dataUrl) },
      clearCustomWallpaper: () => { void scope.set(CUSTOM_WALLPAPER_FIELD, '') },
      setWallpaperOpacity: (opacity: number) => { void scope.set(WALLPAPER_OPACITY_FIELD, opacity) },
      hooks: { customWallpaper: customWallpaperSource, wallpaperOpacity: wallpaperOpacitySource, enabled: enabledSource },
    }),
  }, WallpaperUploadRow))

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
      setDecor: (field: keyof DecorState, enabled: boolean) => {
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
    id: 'frieren-reset',
    order: 55,
    locale: LOCALE_NS,
    inject: (): ResetRowInjected => ({
      resetDefaults: () => { void scope.replace(DEFAULT_FRIEREN_SETTINGS) },
    }),
  }, ResetRow))
}

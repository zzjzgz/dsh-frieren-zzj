/**
 * Frieren × Himmel web theme, browser half: the alias-token override layer,
 * the global stylesheet (watercolor background, fantasy serif headings,
 * gold-lilac scrollbar, sparkles, blue-moon-weed flowers, magic circles),
 * and the decorative slot entries — frame stage, hero seal, header badge,
 * and the Himmel dock quote. Presentation only: no business state, no
 * model-visible input.
 */
import * as React from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the theme service and slot-name Context merges from the
// declaring packages (client bundle purity gate: no value imports).
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { FRI_THEME_CSS } from './fri-theme.css.ts'

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

/** Frame-wide decorative stage: glow, sparkles, falling flowers, magic circle, ribbon, vignette. */
function FriStage(): React.ReactElement {
  return React.createElement('div', { className: 'fri-stage', 'aria-hidden': true },
    React.createElement('div', { className: 'fri-glow' }),
    SPARKLES.map((s, i) => React.createElement('span', {
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
    FLOWERS.map((f, i) => React.createElement(BlueFlower, {
      key: `f${i}`,
      size: f.size,
      className: 'fri-flower',
      style: {
        left: f.left,
        animationDelay: `${f.delay}s`,
        animationDuration: `${f.dur}s`,
      },
    })),
    React.createElement('div', { className: 'fri-circle' },
      React.createElement('div', { className: 'fri-circle-glow' }),
      React.createElement('span', { className: 'fri-circle-ring fri-circle-ring-a' }),
      React.createElement('span', { className: 'fri-circle-ring fri-circle-ring-b' }),
      React.createElement('span', { className: 'fri-circle-ring fri-circle-ring-c' }),
      React.createElement('span', { className: 'fri-circle-core' }, '❁'),
    ),
    React.createElement('div', { className: 'fri-ribbon' }),
    React.createElement('div', { className: 'fri-vignette' }),
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

/** Composer dock quote: Himmel's ten-years line. */
function FriQuote(): React.ReactElement {
  return React.createElement('div', { className: 'fri-dock' },
    React.createElement('span', { className: 'fri-dock-star', 'aria-hidden': true }, '✦'),
    React.createElement('span', null, 'フリーレン……君と過ごした十年は、俺の人生で最も輝いていた'),
    React.createElement('span', { className: 'fri-dock-sub' }, '—— 勇者ヒンメル · 葬送的芙莉莲'),
  )
}

/** Required services: the theme registry and the slot system. */
export const inject = ['theme', 'slots']

/**
 * Client plugin body: stack the token layer, inject the global stylesheet,
 * and register the decorative slot entries. Every side effect is owned by
 * this plugin's fiber and removed on dispose.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.theme.overrideTokens('frieren-theme', TOKENS), 'frieren-zzj: token layer')

  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'frieren-zzj'
    tag.textContent = FRI_THEME_CSS
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'frieren-zzj: global stylesheet')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'frieren-stage', order: 100 },
    FriStage,
  ))

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
    { name: 'sidebar.footer.action', id: 'frieren-seal', order: 100, label: () => '勇者辛美尔的金戒指' },
    FriSeal,
  ))

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register(
    { name: 'conversation.session.header.utilities', id: 'frieren-badge', order: 100, label: () => '苍月草主题徽记' },
    FriBadge,
  ))

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
    { name: 'conversation.composer.dock', id: 'frieren-quote', order: 100 },
    FriQuote,
  ))
}

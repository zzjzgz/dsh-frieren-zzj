/**
 * Frieren × Himmel quote library for the composer dock line. Quotes are
 * fan-curated flavor lines from 葬送のフリーレン; the zh/en glosses are
 * fan translations (意译), not official. The dock always renders the Japanese
 * original with a localized attribution; the gloss rides the title tooltip.
 */

import type { QuoteMode } from '../frieren-settings.ts'

/** One quote entry: original Japanese, glosses, and speaker attribution. */
export interface FrierenQuote {
  /** Japanese original line. */
  ja: string
  /** Simplified Chinese gloss. */
  zh: string
  /** English gloss. */
  en: string
  /** Speaker name in Japanese. */
  speakerJa: string
  /** Speaker name in Chinese. */
  speakerZh: string
}

/** The curated quote library, in display order; index 0 is the fixed classic line. */
export const FRIEREN_QUOTES: readonly FrierenQuote[] = Object.freeze([
  {
    ja: 'フリーレン……君と過ごした十年は、俺の人生で最も輝いていた',
    zh: '芙莉莲……与你共度的十年，是我人生中最闪耀的时光。',
    en: 'Frieren… the ten years I spent with you were the brightest of my life.',
    speakerJa: '勇者ヒンメル',
    speakerZh: '勇者辛美尔',
  },
  {
    ja: '人の死に、慣れることなんてない',
    zh: '人的离世，是永远无法习惯的事。',
    en: 'You never get used to people dying.',
    speakerJa: 'フリーレン',
    speakerZh: '芙莉莲',
  },
  {
    ja: '魔法使いはね、魔力を隠すものなんだよ',
    zh: '魔法使啊，是要隐藏魔力的哦。',
    en: 'You see, mages hide their mana.',
    speakerJa: 'ヒンメル',
    speakerZh: '辛美尔',
  },
  {
    ja: 'わたしは、ヒンメルのことを何も知らなかった',
    zh: '我对他，一无所知。',
    en: 'I never knew anything about Himmel.',
    speakerJa: 'フリーレン',
    speakerZh: '芙莉莲',
  },
  {
    ja: '優しさは、時に人を傷つける。それでも、優しさは美しい',
    zh: '温柔有时会伤害人，可温柔依然是美丽的。',
    en: 'Kindness sometimes hurts people — and yet, kindness is still beautiful.',
    speakerJa: 'ハイター',
    speakerZh: '海塔',
  },
  {
    ja: '臆病でもいい。それでも俺は、ヒンメル様みたいな勇者になりたい',
    zh: '胆小也没关系。即便如此，我也想成为辛美尔大人那样的勇者。',
    en: 'Being a coward is fine. Even so, I want to become a hero like Lord Himmel.',
    speakerJa: 'シュタルク',
    speakerZh: '修塔尔克',
  },
  {
    ja: '蒼月草が咲く頃に、また会おう',
    zh: '待到苍月草绽放之时，我们再会吧。',
    en: 'Let us meet again when the blue moon weed blooms.',
    speakerJa: 'フリーレン',
    speakerZh: '芙莉莲',
  },
  {
    ja: '魔法は、特別な人だけのものじゃない',
    zh: '魔法，并不只属于特别的人。',
    en: 'Magic does not belong only to the extraordinary.',
    speakerJa: 'フリーレン',
    speakerZh: '芙莉莲',
  },
])

/** Day length in ms; the daily pick advances once per UTC day. */
const DAY_MS = 86_400_000

/**
 * Pick one quote for the given mode.
 * @param mode - rotation mode; `fixed` always returns the classic Himmel line.
 * @param now - epoch ms; injectable for determinism in tests.
 * @returns the selected quote.
 */
export function pickQuote(mode: QuoteMode, now: number = Date.now()): FrierenQuote {
  const index = mode === 'fixed' ? 0
    : mode === 'random' ? Math.floor(Math.random() * FRIEREN_QUOTES.length)
      : Math.floor(now / DAY_MS) % FRIEREN_QUOTES.length
  const quote = FRIEREN_QUOTES[index]
  // The library is non-empty and every index above is bounded — the throw
  // exists only to satisfy the unchecked-index type; it cannot fire.
  if (quote === undefined) throw new Error(`frieren-zzj: quote index ${index} out of range`)
  return quote
}

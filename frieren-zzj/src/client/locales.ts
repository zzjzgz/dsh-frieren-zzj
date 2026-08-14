/** Locale bundles for the wallpaper switch row in the General settings section. */

/** Locale keys the wallpaper row renders. */
export type FrierenLocaleKey =
  | 'wallpaper.title' | 'wallpaper.description'
  | 'wallpaper.on' | 'wallpaper.off'

/** English copy. */
export const en: Record<FrierenLocaleKey, string> = {
  'wallpaper.title': 'Frieren wallpaper',
  'wallpaper.description': 'Show the watercolor background scene and its decorations.',
  'wallpaper.on': 'Wallpaper on',
  'wallpaper.off': 'Wallpaper off',
}

/** Simplified Chinese copy. */
export const zh: Record<FrierenLocaleKey, string> = {
  'wallpaper.title': '芙莉莲壁纸',
  'wallpaper.description': '显示水彩壁纸背景与星光、飘花、魔法阵等装饰。',
  'wallpaper.on': '壁纸已开启',
  'wallpaper.off': '壁纸已关闭',
}

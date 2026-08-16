/** Locale bundles for the Frieren theme section and its rows. */

/** Locale keys the Frieren theme surface renders. */
export type FrierenLocaleKey =
  | 'section.nav'
  | 'wallpaper.title' | 'wallpaper.description' | 'wallpaper.on' | 'wallpaper.off'
  | 'wallpaper.upload.title' | 'wallpaper.upload.description'
  | 'wallpaper.upload.button' | 'wallpaper.upload.clear' | 'wallpaper.upload.busy' | 'wallpaper.upload.error'
  | 'scheme.title' | 'scheme.description' | 'scheme.light' | 'scheme.dark' | 'scheme.system'
  | 'material.title' | 'material.description' | 'material.glass' | 'material.plain'
  | 'decor.title' | 'decor.description'
  | 'decor.sparkles' | 'decor.flowers' | 'decor.circle' | 'decor.ribbon' | 'decor.vignette'
  | 'quote.title' | 'quote.description' | 'quote.daily' | 'quote.random' | 'quote.fixed'
  | 'quote.series'

/** English copy. */
export const en: Record<FrierenLocaleKey, string> = {
  'section.nav': 'Frieren theme',
  'wallpaper.title': 'Frieren wallpaper',
  'wallpaper.description': 'Show the watercolor background scene with its stars, blossoms, and magic circle.',
  'wallpaper.on': 'Wallpaper on',
  'wallpaper.off': 'Wallpaper off',
  'wallpaper.upload.title': 'Custom wallpaper',
  'wallpaper.upload.description': 'Upload a local image as your wallpaper; clears back to the built-in scene.',
  'wallpaper.upload.button': 'Upload local image',
  'wallpaper.upload.clear': 'Restore built-in',
  'wallpaper.upload.busy': 'Processing…',
  'wallpaper.upload.error': 'Could not read that image — try another file.',
  'scheme.title': 'Appearance',
  'scheme.description': 'Pick light, dark, or follow the system. Stays in sync with the Appearance row.',
  'scheme.light': 'Light',
  'scheme.dark': 'Dark',
  'scheme.system': 'System',
  'material.title': 'Input bar material',
  'material.description': 'Glass frosts the input card, the task list, and the goal bar; message cards keep their default surfaces. Plain restores every default surface.',
  'material.glass': 'Glass',
  'material.plain': 'Plain',
  'decor.title': 'Decorations',
  'decor.description': 'Toggle each decoration layer of the wallpaper scene.',
  'decor.sparkles': 'Sparkles',
  'decor.flowers': 'Blossoms',
  'decor.circle': 'Magic circle',
  'decor.ribbon': 'Ribbon',
  'decor.vignette': 'Vignette',
  'quote.title': 'Quotes',
  'quote.description': 'How the quote under the input box rotates.',
  'quote.daily': 'Daily',
  'quote.random': 'Random',
  'quote.fixed': 'Fixed',
  'quote.series': 'Frieren: Beyond Journey\u2019s End',
}

/** Simplified Chinese copy. */
export const zh: Record<FrierenLocaleKey, string> = {
  'section.nav': '芙莉莲主题',
  'wallpaper.title': '芙莉莲壁纸',
  'wallpaper.description': '显示水彩壁纸背景与星光、飘花、魔法阵等装饰。',
  'wallpaper.on': '壁纸已开启',
  'wallpaper.off': '壁纸已关闭',
  'wallpaper.upload.title': '自定义壁纸',
  'wallpaper.upload.description': '上传本地图片作为壁纸，可随时恢复内置背景。',
  'wallpaper.upload.button': '上传本地图片',
  'wallpaper.upload.clear': '恢复内置',
  'wallpaper.upload.busy': '处理中…',
  'wallpaper.upload.error': '无法读取这张图片，请换一张试试。',
  'scheme.title': '外观模式',
  'scheme.description': '选择浅色、深色或跟随系统，与「外观」设置保持同步。',
  'scheme.light': '浅色',
  'scheme.dark': '深色',
  'scheme.system': '跟随系统',
  'material.title': '输入框材质',
  'material.description': '玻璃 = 输入框、任务清单、目标卡片毛玻璃，消息区卡片保持默认表面、壁纸完整可见；普通 = 全部恢复默认表面。',
  'material.glass': '玻璃',
  'material.plain': '普通',
  'decor.title': '装饰元素',
  'decor.description': '单独开关壁纸上的各层装饰。',
  'decor.sparkles': '星光',
  'decor.flowers': '飘花',
  'decor.circle': '魔法阵',
  'decor.ribbon': '彩带',
  'decor.vignette': '暗角',
  'quote.title': '名台词',
  'quote.description': '输入栏下方名台词的轮换方式。',
  'quote.daily': '每日一句',
  'quote.random': '随机',
  'quote.fixed': '固定台词',
  'quote.series': '葬送的芙莉莲',
}

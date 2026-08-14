/** Locale bundles for the Frieren theme section and its rows. */

/** Locale keys the Frieren theme surface renders. */
export type FrierenLocaleKey =
  | 'section.nav'
  | 'wallpaper.title' | 'wallpaper.description' | 'wallpaper.on' | 'wallpaper.off'
  | 'scheme.title' | 'scheme.description' | 'scheme.light' | 'scheme.dark' | 'scheme.system'
  | 'variant.title' | 'variant.description'
  | 'variant.default' | 'variant.dawn' | 'variant.dusk' | 'variant.violet' | 'variant.night' | 'variant.sepia'
  | 'variant.upload' | 'variant.clear' | 'variant.busy'
  | 'backdrop.title' | 'backdrop.description' | 'backdrop.auto' | 'backdrop.translucent' | 'backdrop.solid'
  | 'decor.title' | 'decor.description'
  | 'decor.sparkles' | 'decor.flowers' | 'decor.circle' | 'decor.ribbon' | 'decor.vignette'
  | 'quote.title' | 'quote.description' | 'quote.daily' | 'quote.random' | 'quote.fixed'
  | 'quote.series'
  | 'upload.error'

/** English copy. */
export const en: Record<FrierenLocaleKey, string> = {
  'section.nav': 'Frieren theme',
  'wallpaper.title': 'Frieren wallpaper',
  'wallpaper.description': 'Show the watercolor background scene with its stars, blossoms, and magic circle.',
  'wallpaper.on': 'Wallpaper on',
  'wallpaper.off': 'Wallpaper off',
  'scheme.title': 'Appearance',
  'scheme.description': 'Pick light, dark, or follow the system. Stays in sync with the Appearance row.',
  'scheme.light': 'Light',
  'scheme.dark': 'Dark',
  'scheme.system': 'System',
  'variant.title': 'Wallpaper tone',
  'variant.description': 'Pick a built-in tone, or upload a local image as your custom wallpaper.',
  'variant.default': 'Day sky',
  'variant.dawn': 'Dawn',
  'variant.dusk': 'Dusk',
  'variant.violet': 'Violet',
  'variant.night': 'Starry night',
  'variant.sepia': 'Sepia',
  'variant.upload': 'Upload local image',
  'variant.clear': 'Restore built-in',
  'variant.busy': 'Processing…',
  'backdrop.title': 'Content backdrop',
  'backdrop.description': 'How much the message area separates from the wallpaper. Auto goes solid when a custom wallpaper is bright or warm.',
  'backdrop.auto': 'Auto',
  'backdrop.translucent': 'Translucent',
  'backdrop.solid': 'Solid',
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
  'upload.error': 'Could not read that image — try another file.',
}

/** Simplified Chinese copy. */
export const zh: Record<FrierenLocaleKey, string> = {
  'section.nav': '芙莉莲主题',
  'wallpaper.title': '芙莉莲壁纸',
  'wallpaper.description': '显示水彩壁纸背景与星光、飘花、魔法阵等装饰。',
  'wallpaper.on': '壁纸已开启',
  'wallpaper.off': '壁纸已关闭',
  'scheme.title': '外观模式',
  'scheme.description': '选择浅色、深色或跟随系统，与「外观」设置保持同步。',
  'scheme.light': '浅色',
  'scheme.dark': '深色',
  'scheme.system': '跟随系统',
  'variant.title': '壁纸色调',
  'variant.description': '选择内置色调，或上传本地图片作为自定义壁纸。',
  'variant.default': '青空',
  'variant.dawn': '晨曦',
  'variant.dusk': '黄昏',
  'variant.violet': '暮紫',
  'variant.night': '星夜',
  'variant.sepia': '复古',
  'variant.upload': '上传本地图片',
  'variant.clear': '恢复内置',
  'variant.busy': '处理中…',
  'backdrop.title': '内容区衬底',
  'backdrop.description': '消息区与壁纸的区分程度。自动模式：自定义壁纸较亮或较暖时，消息区自动改用实底背景。',
  'backdrop.auto': '自动',
  'backdrop.translucent': '半透明',
  'backdrop.solid': '实底',
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
  'upload.error': '无法读取这张图片，请换一张试试。',
}

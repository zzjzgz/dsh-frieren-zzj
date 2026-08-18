/** Locale bundles for the Frieren theme section and its rows. */

/** Locale keys the Frieren theme surface renders. */
export type FrierenLocaleKey =
  | 'section.nav'
  | 'enable.title' | 'enable.description' | 'enable.on' | 'enable.off'
  | 'reset.title' | 'reset.description' | 'reset.button'
  | 'wallpaper.upload.title' | 'wallpaper.upload.description'
  | 'wallpaper.upload.button' | 'wallpaper.upload.clear' | 'wallpaper.upload.busy' | 'wallpaper.upload.error'
  | 'scheme.title' | 'scheme.description' | 'scheme.light' | 'scheme.dark' | 'scheme.system'
  | 'material.title' | 'material.description' | 'material.glass' | 'material.plain'
  | 'decor.title' | 'decor.description'
  | 'decor.sparkles' | 'decor.flowers' | 'decor.circle' | 'decor.ribbon' | 'decor.vignette'
  | 'quote.title' | 'quote.description' | 'quote.random' | 'quote.fixed'
  | 'quote.series'
  | 'quote.custom.title' | 'quote.custom.description' | 'quote.custom.placeholder'
  | 'quote.randomTable.title' | 'quote.randomTable.description'
  | 'quote.randomTable.textHeader' | 'quote.randomTable.speakerHeader' | 'quote.randomTable.glossHeader'
  | 'quote.randomTable.addRow' | 'quote.randomTable.deleteRow' | 'quote.randomTable.empty'

/** English copy. */
export const en: Record<FrierenLocaleKey, string> = {
  'section.nav': 'Frieren theme',
  'enable.title': 'Frieren theme plugin',
  'enable.description': 'Master switch: off removes every theme effect (wallpaper, decorations, fonts, seal, badge, quotes) and returns the default interface.',
  'enable.on': 'Theme on',
  'enable.off': 'Theme off',
  'reset.title': 'Restore defaults',
  'reset.description': 'Reset every Frieren theme setting to its default value and re-enable the plugin.',
  'reset.button': 'Restore defaults',
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
  'material.title': 'Overall material',
  'material.description': 'Glass applies iOS frosted glass to the input card, task list, goal bar, and settings panel. Plain restores every default surface.',
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
  'quote.random': 'Random',
  'quote.fixed': 'Fixed',
  'quote.series': 'Frieren: Beyond Journey\u2019s End',
  'quote.custom.title': 'Custom fixed quote',
  'quote.custom.description': 'Enter a custom line for the fixed mode (empty = built-in classic Himmel line).',
  'quote.custom.placeholder': 'Enter your custom quote…',
  'quote.randomTable.title': 'Custom random quotes',
  'quote.randomTable.description': 'Add your own quotes for random mode (empty = built-in library).',
  'quote.randomTable.textHeader': 'Quote',
  'quote.randomTable.speakerHeader': 'Speaker',
  'quote.randomTable.glossHeader': 'Gloss (optional)',
  'quote.randomTable.addRow': 'Add row',
  'quote.randomTable.deleteRow': 'Delete',
  'quote.randomTable.empty': 'No custom quotes — using built-in library.',
}

/** Simplified Chinese copy. */
export const zh: Record<FrierenLocaleKey, string> = {
  'section.nav': '芙莉莲主题',
  'enable.title': '芙莉莲主题插件',
  'enable.description': '总开关：关闭后主题全部效果（壁纸、装饰、字体、印章、徽记、台词）立即消失，界面恢复默认。',
  'enable.on': '主题已开启',
  'enable.off': '主题已关闭',
  'reset.title': '恢复默认设置',
  'reset.description': '把所有芙莉莲主题设置重置为默认值，并重新开启插件。',
  'reset.button': '恢复默认设置',
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
  'material.title': '整体材质',
  'material.description': '玻璃 = 输入框、任务清单、目标卡片、设置面板统一 iOS 毛玻璃，消息区卡片保持默认表面、壁纸完整可见；普通 = 全部恢复默认表面。',
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
  'quote.random': '随机',
  'quote.fixed': '固定台词',
  'quote.series': '葬送的芙莉莲',
  'quote.custom.title': '自定义固定台词',
  'quote.custom.description': '输入固定台词模式的自定义台词（留空 = 使用内置辛美尔经典台词）。',
  'quote.custom.placeholder': '输入你的自定义台词…',
  'quote.randomTable.title': '自定义随机台词',
  'quote.randomTable.description': '为随机模式添加自定义台词列表（留空 = 使用内置台词库）。',
  'quote.randomTable.textHeader': '台词',
  'quote.randomTable.speakerHeader': '说话人',
  'quote.randomTable.glossHeader': '释义（可选）',
  'quote.randomTable.addRow': '添加一行',
  'quote.randomTable.deleteRow': '删除',
  'quote.randomTable.empty': '暂无自定义台词——使用内置台词库。',
}

# @deepseek-ai/dsh-client-frieren-zzj

dsh-芙莉莲-zzj —— 芙莉莲 × 辛美尔（葬送のフリーレン）装饰主题：别名令牌覆盖层、全局样式表与装饰插槽条目。浏览器半部通过主题服务叠加令牌层、注入全局样式表（内嵌水彩背景图、奇幻衬线标题、金紫渐变滚动条、星光、苍月草飘花、魔法阵），并向各插槽注册帧级装饰层、勇者金戒指印章、会话头部徽记与辛美尔铭文。

## 配置

无。该主题为纯装饰，只要插件被组合即始终生效。

## Model Experience

None, as this package affects no model context: it only overrides theme
tokens, injects a static stylesheet, and registers decorative slot entries.

#### KV Cache effect

Does not invalidate: the package neither reads nor writes model requests, so
it never changes the prompt or message prefix; provider cache availability and
eviction remain outside the package contract.

## 已知限制与后续工作

- 背景图以 base64 data URL 内嵌于客户端 bundle（约 0.4 MB），换取图片自包含，代价是包体积。
- 标题字体在运行时从 Google Fonts 加载；离线时会回退到本地衬线字体栈。

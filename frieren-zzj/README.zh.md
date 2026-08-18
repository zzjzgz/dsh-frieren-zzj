# @zengzhaojun/dsh-client-frieren-zzj

dsh-芙莉莲-zzj —— 芙莉莲 × 辛美尔（葬送のフリーレン）装饰主题：别名令牌覆盖层、全局样式表与装饰插槽条目。浏览器半部通过主题服务叠加令牌层、注入全局样式表（奇幻衬线标题、金紫渐变滚动条、星光、苍月草飘花、魔法阵），并向各插槽注册帧级装饰层、勇者金戒指印章、会话头部徽记与轮换的辛美尔铭文。初始状态为无壁纸，用户可自行上传图片作为整体背景并调节模糊度。

## 配置

插件拥有独立的「芙莉莲主题」设置分区（`settings.section`，位于设置导航中 General 之后），行均持久化到 `frieren-zzj` 命名空间：

- **插件总开关**（默认为开）：关闭后令牌层、主题字体、壁纸、装饰舞台、玻璃材质、金戒指、徽记、台词**全部移除**，界面恢复默认外观；分区只保留总开关与恢复按钮，方便随时开回来；
- 外观模式（浅色 / 深色 / 跟随系统 —— 复用主题服务自己的 `ui-theme` 偏好命名空间，与内置「外观」行同步）；
- 自定义壁纸上传（压缩为 JPEG data URL 存入设置文档，再次上传即替换，「移除壁纸」一键清除）。初始状态为**无壁纸**，用户上传后壁纸作为整体背景以独立固定层渲染（`position:fixed; z-index:-2`，配合 `transform:scale(1.1)` 与 `transition:filter 0.3s ease`），不干扰 `body` 默认布局；
- **壁纸模糊度**（0px–20px）：滑块实时调节壁纸背景的 CSS `filter: blur()`，配合 4 个预设按钮（无模糊 / 轻度 / 中度 / 重度），变化时平滑过渡（`transition: filter 0.3s ease`）。`transform: scale(1.1)` 防止模糊后边缘漏出。仅在设置了壁纸时显示；
- 整体材质（玻璃 / 普通）：`glass` 给输入框卡片（`[data-composer-card]`）、任务清单卡片（`[data-testid='todo-panel']`）、目标卡片（`[data-goal-bar] > :first-child`）与设置面板（`[role="dialog"][aria-modal="true"]`）应用**固定配方**的毛玻璃——参考 OceanAvenu Dark Glass 方法（https://blog.csdn.net/qq_43433246/article/details/162127888）：极低透明度的玻璃底、强模糊（浅色 28px / 深色 40px）、低透明度白边、轻方向悬浮投影、大圆角；浅色与深色两套配方内建、**不可调节**。`plain` 移除样式，所有卡片回到默认表面。消息区卡片（气泡、工具卡）刻意不玻璃化，消息区保持透明，壁纸完整可见。深色规则挂在 `body[data-ds-dark-theme]` 上，跟随用户手动选择的深浅色（而非系统媒体查询）；
- 逐层装饰开关（星光、飘花、魔法阵、彩带、暗角）；
- 名台词轮换方式（每日一句 / 随机 / 固定），内置 8 句台词库；
- **恢复默认设置**（分区底部按钮）：整段重置为默认值（无壁纸、玻璃材质、装饰全开、随机台词、模糊度恢复 0px、清除自定义壁纸）并重新开启插件。

所有行通过 revision 缓存的 observable 读取；设置文档缺失时各字段回退到默认值。

## Model Experience

None, as this package affects no model context: it only overrides theme
tokens, injects a static stylesheet, and registers decorative slot entries.

#### KV Cache effect

Does not invalidate: the package neither reads nor writes model requests, so
it never changes the prompt or message prefix; provider cache availability and
eviction remain outside the package contract.

## 已知限制与后续工作

- 自定义壁纸以 JPEG data URL 存入用户设置文档（上传时自动压缩到最长边 1920px）。
- 名台词为粉丝整理的日文原句 + 意译，非官方翻译。
- 标题字体在运行时从 Google Fonts 加载；离线时会回退到本地衬线字体栈。

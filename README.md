# dsh-芙莉莲-zzj

> 葬送的芙莉莲 × 勇者辛美尔 —— DeepSeek Harness Web 界面（`dsh web`）的芙莉莲主题插件

把整个 Web 界面变成充满芙莉莲元素的水彩世界：全站背景图、蓝紫水彩配色、魔法阵、苍月草飘花、星光、勇者金戒指印章与辛美尔的名台词。

插件是**部署级客户端插件**：随 Web 组合自动加载，**重启不丢失、无需批准**。

![主题预览](screenshots/preview.png)

> 截图占位：把界面截图放到 `screenshots/preview.png` 即可显示。

## 特性

- 🖼️ **全站水彩背景**：自定义背景图（已内嵌进插件，无需附带图片文件）
- 🎨 **双模式配色**：浅色 = 薰衣草羊皮纸，深色 = 靛蓝夜空，跟随系统明暗自动切换
- ✨ **装饰元素**：右上角旋转三环魔法阵、苍月草（蓝月草）五瓣花飘落、金/紫双色星光、顶部三色彩带、四角辉光与暗角
- 💍 **勇者辛美尔的金戒指印章**：侧边栏底部的金色徽记，内嵌一朵苍月草
- ❀ **会话头部徽记**：「蒼月草が咲く頃に」
- 📜 **辛美尔名台词**：输入栏下方「フリーレン……君と過ごした十年は、俺の人生で最も輝いていた」
- 🔤 **奇幻衬线标题字体**（Cinzel + 思源宋体）、金紫渐变滚动条、鼠尾草紫选区与焦点环
- ♻️ **部署级**：重启自动加载，无需批准、无需手动运行

## 环境要求

- DeepSeek Harness `0.1.0-rc.5` 同发布线
- 使用 **Web profile**（`dsh web`）
- 现代浏览器（Chrome / Edge / Firefox / Safari）

## 目录结构

```
dsh-frieren-zzj/
├── README.md                  # 本文档
├── frieren-zzj/               # 插件源码（即仓库 packages/client/frieren-zzj）
└── dist/
    └── deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.5.tgz   # 打包产物（安装版用）
```

## 安装

### 方式一：仓库源码部署（推荐，可自行魔改）

1. 把 `frieren-zzj/` 整个文件夹复制到你的仓库 `packages/client/frieren-zzj`
2. 注册三处（与仓库内其他 `dsh-client-ui-*` 包一致）：
   - `packages/bundle/web-app/cordis.patch.yml` 浏览器名录里加：
     ```yaml
     - id: ui-frieren-zzj
       name: '@deepseek-ai/dsh-client-frieren-zzj'
     ```
   - `packages/bundle/web-app/package.json` 的 dependencies 里加：
     ```json
     "@deepseek-ai/dsh-client-frieren-zzj": "workspace:^",
     ```
   - `tsconfig.client.json` 的 references 与 `tsconfig.base.json` 的 paths 里各加一行（照 `ui-user-questions` 的格式）
3. 构建并重启：
   ```bash
   pnpm install
   pnpm run build:lib:client
   # 重启 dsh web
   ```

### 方式二：安装版部署（使用打包产物）

1. 把 `dist/deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.5.tgz` 放到部署目录，然后：
   ```bash
   pnpm add ./deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.5.tgz
   ```
   （或 `npm install ./deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.5.tgz`）
2. 在你的 Web 组合配置（cordis.yml / profile patch）里加名录行：
   ```yaml
   - id: ui-frieren-zzj
     name: '@deepseek-ai/dsh-client-frieren-zzj'
   ```
   并确保该包名出现在你的 profile 可解析的依赖清单（resolver manifest）中。
3. 重启 `dsh web`，主题随页面自动加载。

> 两种方式**都不需要**任何批准或手动运行——它是组合的一部分，不是动态插件。

## 自定义

- **改配色**：编辑 `src/client/index.ts` 顶部的 `TOKENS`（`--dsw-alias-*` 的 light/dark 值）
- **改背景图**：`src/client/fri-theme.css.ts` 是生成文件，背景图以 base64 data URL 内嵌在 `--fri-bg` 变量中；更换图片后需重新生成该文件（压缩为 JPEG 约 1920px 宽 → base64 → 替换 data URL）并重建 bundle
- **改装饰**：魔法阵、星光、飘花的数量/位置/节奏都在 `src/client/index.ts` 的 `SPARKLES` / `FLOWERS` 数组与 `fri-theme.css.ts` 中

## 从源码打包

```bash
pnpm --filter @deepseek-ai/dsh-client-frieren-zzj pack --pack-destination ./dist
```

## 卸载

- 方式一：删除 `packages/client/frieren-zzj` 及三处注册（名录行、依赖、tsconfig 两行）
- 方式二：`pnpm remove @deepseek-ai/dsh-client-frieren-zzj`，并移除组合配置中的名录行

## 常见问题

**重启后主题还在吗？**
在。这是部署级插件，随组合加载，不像动态插件那样重启即失。

**需要批准吗？**
不需要。加载路径与 `ui-theme`、`ui-sidebar` 等内置插件相同。

**朋友怎么用？**
把本仓库整个 clone/下载，按「安装」章节任选一种方式即可；背景图已内嵌，无需额外文件。

**离线能用吗？**
能。标题字体在线时从 Google Fonts 加载，离线自动回退本地衬线字体栈；背景与配色完全离线可用。

## 已知限制

- 背景图内嵌使客户端 bundle 增加约 0.4 MB
- 主题始终生效，暂无设置开关（移除插件即卸载）
- 装饰层 `pointer-events: none`，不影响任何交互

## 版权与许可

- 插件代码：MIT License（见 `LICENSE`）
- 背景图版权归原作者所有（本仓库默认不含背景图源文件，图片已内嵌进构建产物）
- 《葬送的芙莉莲》（葬送のフリーレン）版权归 山田鐘人・アベツカサ 及动画制作方所有；本插件为粉丝自制装饰主题，与版权方无关

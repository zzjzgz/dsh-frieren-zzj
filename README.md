# dsh-芙莉莲-zzj

> 葬送的芙莉莲 × 勇者辛美尔 —— DeepSeek Harness Web 界面（`dsh web`）的芙莉莲主题插件

把整个 Web 界面变成充满芙莉莲元素的水彩世界：全站背景图、蓝紫水彩配色、魔法阵、苍月草飘花、星光、勇者金戒指印章与辛美尔的名台词。

插件是**部署级客户端插件**：装进 web profile 后随 `dsh web` 自动加载，**重启不丢失、无需批准**。

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

- DeepSeek Harness `0.1.0-rc.5` 同发布线（`dsh` CLI）
- 使用 **Web profile**（`dsh web`）
- `pnpm` 已安装且在 PATH 上（`dsh plugin` 通过 pnpm 管理 profile 依赖）
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

> **原理**：本插件是**客户端插件**（包内声明 `dsh.client`，不是 `dsh.bundle`），所以安装分两步：
> ① 把 `dist/` 里的 tgz 装进 **web profile** 的依赖（由 pnpm 管理）；
> ② 在 web profile 的 `cordis.patch.yml` 里注册一行名录。
>
> 两步都只发生在 profile 目录（默认 `%USERPROFILE%\.dsh\profiles\web`，即本机 `C:\Users\zzj\.dsh\profiles\web`），**完全不改动 dsh 源码仓库**；装好后随组合自动加载，重启不丢失、无需批准。

### 第 0 步：确认环境

1. `dsh` CLI 可用。本机是通过 DSH 源码目录启动的：在 `D:\JavaCode\ds-h\deepseek-harness` 下执行 `pnpm dsh ...`；如果你的 `dsh` 已在 PATH 上，下文所有命令去掉 `pnpm` 前缀即可。
2. `pnpm --version` 能正常输出版本号（`dsh plugin` 内部要调用 pnpm）。
3. 至少成功启动过一次 `dsh web`——首次运行会自动初始化 web profile（组合 `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app`），profile 目录就出现在 `%USERPROFILE%\.dsh\profiles\web`。

### 第 1 步：拿到安装包 tgz

- 直接用本仓库自带的 `dist/deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.5.tgz`；
- 或改过源码后自己重新打包（见下文「从源码打包」）。

### 第 2 步：把 tgz 装进 web profile（二选一）

**方式 A（推荐）：用 `dsh plugin` 一条命令完成**

```powershell
# 在任意目录执行均可（本机示例用 DSH 源码目录）
pnpm dsh plugin --profile web add "file:D:/JavaCode/ds-h/dsh-frieren-zzj/dist/deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.5.tgz"
```

这条命令内部做的事：

- profile 不存在时会先自动初始化（web profile 模板：base + web-app）；
- 以 profile 目录为工作目录调用 `pnpm add <spec>`，把包装进 `node_modules`；
- 装完会打印一条 warning：`declares no dsh.bundle — installed as a plain dependency, not a profile layer` —— **这是正常的，不是报错**：它是客户端插件（`dsh.client`）而不是 bundle，名录行我们在第 3 步手动注册；
- 结果：`package.json` 出现依赖、`pnpm-lock.yaml` 与 `node_modules` 同步更新。

**方式 B：手动 pnpm（效果与 A 完全相同）**

```powershell
cd $env:USERPROFILE\.dsh\profiles\web      # macOS/Linux: cd ~/.dsh/profiles/web
pnpm add "file:D:/JavaCode/ds-h/dsh-frieren-zzj/dist/deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.5.tgz"
```

> ⚠️ 路径注意：`dsh plugin add` 会把**相对**路径锚定到「你运行命令的目录」，而手动 `pnpm add` 的相对路径会相对 **profile 目录**解析——所以一律写 **`file:` + 正斜杠的绝对路径**最稳妥，不会装错地方。

**验证装上了**（任选其一）：

```powershell
# 包本体已存在：
Get-ChildItem "$env:USERPROFILE\.dsh\profiles\web\node_modules\@deepseek-ai\dsh-client-frieren-zzj\lib"
# 或让 pnpm 解释为什么安装它：
pnpm dsh plugin --profile web why @deepseek-ai/dsh-client-frieren-zzj
```

> 小知识：pnpm 写进 `package.json` 的 spec 会变成 `"file:D://JavaCode//ds-h//dsh-frieren-zzj//dist//...tgz"` 这种盘符后带双斜杠的形式，这是 pnpm 自己的路径规范化，属正常现象，不要手动改回单斜杠。

### 第 3 步：在 profile 的 `cordis.patch.yml` 注册名录行

打开 `%USERPROFILE%\.dsh\profiles\web\cordis.patch.yml`（没有就新建一个空文件），在顶层 YAML 数组里加入：

```yaml
# dsh-芙莉莲-zzj — Frieren × Himmel 主题（客户端插件）
- insert:
    - id: frieren-zzj
      name: '@deepseek-ai/dsh-client-frieren-zzj'
```

- `id` 可自取，保证唯一即可；`name` 必须与包名**完全一致**（`@deepseek-ai/dsh-client-frieren-zzj`）；
- `insert` 表示向组合里插入这一行；profile 的 patch 在 bundle 层**之后**应用，所以这行会出现在最终组合里；
- 不要改同目录的 `cordis.yml`——那是自动生成的 profile 根文件，文件头注释也写了：*edit cordis.patch.yml, not this file*。

### 第 4 步：验证组合配置

```powershell
pnpm dsh web --dump-config
```

- 输出整棵组合树，每一行带注释标明来源文件；应能看到 `frieren-zzj` 行，注释指向 profile 的 `cordis.patch.yml`；
- `--dump-config` 只打印组合、**不启动服务**，随时可以运行；
- 看不到这行？回到第 2/3 步检查：`node_modules` 里有没有包、YAML 缩进对不对、`name` 拼写对不对。

### 第 5 步：重启 `dsh web` 并刷新浏览器

1. 在运行 `pnpm dsh web` 的终端按 `Ctrl+C` 停掉旧实例；
2. 重新运行 `pnpm dsh web`；
3. 浏览器打开 `http://127.0.0.1:3080`，**硬刷新**（Windows: `Ctrl+F5`；macOS: `Cmd+Shift+R`）——客户端 bundle 有浏览器缓存，普通刷新可能还是旧页面。

> 小技巧：想先试试不打断现有实例，可以另开一个终端跑 `pnpm dsh web --port 3081`，用 3081 端口预览；确认没问题再切回正式实例。

### 第 6 步：确认效果

应看到：全站水彩背景、右上角旋转魔法阵、苍月草飘花、金紫星光、顶部彩带、侧边栏金戒指印章、「蒼月草が咲く頃に」徽记、输入框下方辛美尔名台词。如果背景/配色变了但装饰没出现，多半是浏览器缓存，再硬刷新一次。

## 更新插件（改了源码重新打包后）

1. **升版本号**：改 `frieren-zzj/package.json` 的 `version`（如 `0.1.0-rc.5` → `0.1.0-rc.6`）。**必须升**：pnpm 按 lockfile 里的 integrity 校验 tgz，同版本号的新 tgz 不会被重新安装；
2. 重新打包（见「从源码打包」），得到 `dist/deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.6.tgz`；
3. 重装：

   ```powershell
   pnpm dsh plugin --profile web add "file:D:/JavaCode/ds-h/dsh-frieren-zzj/dist/deepseek-ai-dsh-client-frieren-zzj-0.1.0-rc.6.tgz"
   ```

4. 重启 `dsh web` + 浏览器硬刷新。

## 从源码打包

`dist/` 里的 tgz 就是安装源；需要重新打包时：

1. 升版本号（见「更新插件」）；
2. 构建出 `lib/` 再打包。本仓库的 `frieren-zzj/` 依赖 `workspace:^` 的 monorepo 依赖和 tsdown 构建链，不是自包含 workspace，所以最稳妥的打包环境是 DSH 源码仓库——把 `frieren-zzj/` 放进其 `packages/client/` 后执行：

   ```bash
   pnpm --filter @deepseek-ai/dsh-client-frieren-zzj bundle      # tsdown 构建出 lib/
   pnpm --filter @deepseek-ai/dsh-client-frieren-zzj pack --pack-destination D:/JavaCode/ds-h/dsh-frieren-zzj/dist
   ```

3. 新的 tgz 出现在 `dist/` 后，按「安装」第 2 步重装即可。

## 卸载

1. 删除 `cordis.patch.yml` 里第 3 步加的 insert 块；
2. 移除依赖：

   ```powershell
   pnpm dsh plugin --profile web remove @deepseek-ai/dsh-client-frieren-zzj
   # 或手动：
   cd $env:USERPROFILE\.dsh\profiles\web
   pnpm remove @deepseek-ai/dsh-client-frieren-zzj
   ```

3. 重启 `dsh web`，主题消失。

## 常见问题

**重启后主题还在吗？**
在。装进 profile 就是部署级插件，随组合加载，不像动态插件那样重启即失。

**需要批准吗？**
不需要。加载路径与 `ui-theme`、`ui-sidebar` 等内置插件相同。

**安装时 pnpm 提示 `no dsh.bundle` 是报错吗？**
不是。它是客户端插件（`dsh.client`），本来就不作为 bundle 层；名录行在 `cordis.patch.yml` 手动注册后即生效。

**主题没生效？**
按顺序排查：① `pnpm dsh web --dump-config` 里有没有 `frieren-zzj` 行；② `node_modules\@deepseek-ai\dsh-client-frieren-zzj` 是否存在；③ 浏览器是否硬刷新（Ctrl+F5）；④ 是否完整重启过 `dsh web`。

**朋友怎么用？**
把本仓库整个 clone/下载，用 `dist/` 里的 tgz 按「安装」步骤走即可；背景图已内嵌，无需额外文件。

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

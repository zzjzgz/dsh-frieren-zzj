# dsh-芙莉莲-zzj

> 葬送的芙莉莲 × 勇者辛美尔 —— DeepSeek Harness Web 界面（`dsh web`）的芙莉莲主题插件

把整个 Web 界面变成充满芙莉莲元素的水彩世界：全站背景图、蓝紫水彩配色、魔法阵、苍月草飘花、星光、勇者金戒指印章与辛美尔的名台词，输入框支持玻璃/普通两种材质（消息区保持透明，壁纸完整可见）。所有开关都收在设置里的独立「芙莉莲主题」分区：壁纸总开关、外观模式、自定义壁纸上传、输入框材质、逐层装饰开关、名台词轮换方式。

插件是**部署级客户端插件**：装进 web profile 后随 `dsh web` 自动加载，**重启不丢失、无需批准**。



> 截图占位：把界面截图放到 `screenshots/preview.png` 即可显示。

## 特性

- 🛑 **插件总开关**：一键关闭**全部**主题效果（壁纸、装饰、字体、印章、徽记、台词、玻璃、配色），界面立即恢复默认外观；再次开启全部回来。开关在「芙莉莲主题」分区顶部
- ♻️ **恢复默认设置**：一键把所有设置重置为默认值（壁纸开、玻璃材质、装饰全开、每日台词、清除自定义壁纸与旧版残留字段）并重新开启插件。按钮在分区底部
- 🖼️ **全站水彩背景**：自定义背景图（已内嵌进插件，无需附带图片文件）
- 🎨 **双模式配色**：浅色 = 薰衣草羊皮纸，深色 = 靛蓝夜空；设置里可选**浅色 / 深色 / 跟随系统**三态（与内置「外观」设置同步）
- 📤 **自定义壁纸**：上传本地图片即作为壁纸（自动压缩到 1600px JPEG 存入设置，可随时再次上传替换，或一键恢复内置）
- 🧊 **输入框材质**：玻璃 / 普通二选一。玻璃 = 输入框、任务清单、目标卡片毛玻璃（参考 OceanAvenu Dark Glass 方法：低透明底 + 强模糊 + 白边 + 层次阴影，浅/深色固定配方，不可调节），消息区卡片保持默认表面；普通 = 全部恢复默认表面。消息区保持透明，壁纸完整可见
- ✨ **逐层装饰开关**：星光、苍月草飘花、魔法阵、彩带、暗角可单独开关
- 💍 **勇者辛美尔的金戒指印章**：侧边栏底部的金色徽记，内嵌一朵苍月草
- ❀ **会话头部徽记**：「蒼月草が咲く頃に」
- 📜 **名台词轮换**：输入栏下方台词支持**每日一句 / 随机 / 固定**三种模式，内置 8 句辛美尔、芙莉莲、海塔、修塔尔克的名台词（日文原句 + 中文释义悬浮提示）
- 🔤 **奇幻衬线标题字体**（Cinzel + 思源宋体）、金紫渐变滚动条、鼠尾草紫选区与焦点环
- ⚙️ **独立设置分区**：设置面板新增「芙莉莲主题」页，所有开关集中管理
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
├── frieren-zzj/               # 插件源码（npm 包 @zengzhaojun/dsh-client-frieren-zzj）
└── dist/
    └── zengzhaojun-dsh-client-frieren-zzj-0.1.0-rc.22.tgz   # 打包产物（安装版用）
```

## 安装

> 和ai说：根据 https://github.com/zzjzgz/dsh-frieren-zzj 的仓库指引在本地安装这个壁纸插件。

> **原理**：本插件是**客户端插件**（包内声明 `dsh.client`，不是 `dsh.bundle`），所以安装分两步：
> ① 把 `dist/` 里的 tgz 装进 **web profile** 的依赖（由 pnpm 管理）；
> ② 在 web profile 的 `cordis.patch.yml` 里注册一行名录。
>
> 两步都只发生在 profile 目录（默认 `%USERPROFILE%\.dsh\profiles\web`，即本机 `C:\Users\zzj\.dsh\profiles\web`），**完全不改动 dsh 源码仓库**；装好后随组合自动加载，重启不丢失、无需批准。
>
> **设置为什么能写入**：dsh 的 API 网关对浏览器可写的 settings 命名空间有一份**硬编码白名单**（`agent-loop`、`shell`、`locale`、`permission`、`ui-conversation`、`ui-theme`、`web-search-deepseek` 等），第三方命名空间一律 `settings-not-exposed`，浏览器端写入会被静默丢弃（表现为设置里的开关点了没反应）。本插件因此不走该通道：node 半边直接向 settings 服务注册命名空间，并额外注册一条同源 HTTP 路由（`/plugins/@zengzhaojun/dsh-client-frieren-zzj/settings`）作为浏览器读写桥，设置仍持久化在用户设置文档（`~/.dsh/settings.yaml`），与内置插件一致。**该桥依赖 node 半边，所以升级后必须完整重启 `dsh web`。**

### 第 0 步：确认环境

1. `dsh` CLI 可用。本机是通过 DSH 源码目录启动的：在 `D:\dsh-dsp\deepseek-harness` 下执行 `pnpm dsh ...`；如果你的 `dsh` 已在 PATH 上，下文所有命令去掉 `pnpm` 前缀即可。
2. `pnpm --version` 能正常输出版本号（`dsh plugin` 内部要调用 pnpm）。
3. 至少成功启动过一次 `dsh web`——首次运行会自动初始化 web profile（组合 `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app`），profile 目录就出现在 `%USERPROFILE%\.dsh\profiles\web`。

### 第 1 步：安装插件（推荐：npm 一条命令）

插件已发布到 npm（`@zengzhaojun/dsh-client-frieren-zzj`），直接按包名安装：

```powershell
pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.22"
```

- 本质是让 pnpm 从 npm registry 拉包，装进 profile 依赖（由 pnpm 管理）；
- 本机如果配的是腾讯镜像，新版本可能延迟几分钟才同步；遇到 404 就临时指定官方源：
  `pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.22" --registry=https://registry.npmjs.org`
- 装完会打印一条 warning：`declares no dsh.bundle — installed as a plain dependency, not a profile layer` —— **这是正常的，不是报错**：它是客户端插件（`dsh.client`）而不是 bundle，名录行我们在第 3 步手动注册。

### 第 2 步（可选）：离线/本地 tgz 安装

没有 npm 网络时，可用仓库 `dist/` 里的 tgz 安装：

```powershell
pnpm dsh plugin --profile web add "file:D:/JavaCode/ds-h/dsh-frieren-zzj/dist/zengzhaojun-dsh-client-frieren-zzj-0.1.0-rc.22.tgz"
```

> ⚠️ 路径注意：`dsh plugin add` 会把**相对**路径锚定到「你运行命令的目录」，而手动 `pnpm add` 的相对路径会相对 **profile 目录**解析——所以一律写 **`file:` + 正斜杠的绝对路径**最稳妥，不会装错地方。

**验证装上了**（任选其一）：

```powershell
# 包本体已存在：
Get-ChildItem "$env:USERPROFILE\.dsh\profiles\web\node_modules\@zengzhaojun\dsh-client-frieren-zzj\lib"
# 或让 pnpm 解释为什么安装它：
pnpm dsh plugin --profile web why @zengzhaojun/dsh-client-frieren-zzj
```

> 小知识：pnpm 写进 `package.json` 的 spec 对本地 tgz 会变成 `"file:D://JavaCode//ds-h//dsh-frieren-zzj//dist//...tgz"` 这种盘符后带双斜杠的形式，这是 pnpm 自己的路径规范化，属正常现象；从 npm 安装则是标准的 `"@zengzhaojun/dsh-client-frieren-zzj": "0.1.0-rc.22"`。

### 第 3 步：在 profile 的 `cordis.patch.yml` 注册名录行

打开 `%USERPROFILE%\.dsh\profiles\web\cordis.patch.yml`（没有就新建一个空文件），在顶层 YAML 数组里加入：

```yaml
# dsh-芙莉莲-zzj — Frieren × Himmel 主题（客户端插件）
- insert:
    - id: frieren-zzj
      name: '@zengzhaojun/dsh-client-frieren-zzj'
```

- `id` 可自取，保证唯一即可；`name` 必须与包名**完全一致**（`@zengzhaojun/dsh-client-frieren-zzj`）；
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

应看到：全站水彩背景、右上角旋转魔法阵、苍月草飘花、金紫星光、顶部彩带、侧边栏金戒指印章、「蒼月草が咲く頃に」徽记、输入栏下方名台词。如果背景/配色变了但装饰没出现，多半是浏览器缓存，再硬刷新一次。

打开设置（左下角齿轮）→ 导航里会出现「芙莉莲主题」分区，从上到下依次是：**插件总开关**、壁纸总开关、外观模式（浅色/深色/跟随系统）、自定义壁纸上传、输入框材质（玻璃 / 普通）、逐层装饰开关、名台词轮换方式，底部是**恢复默认设置**。改完立即生效，无需刷新。总开关关闭后分区里只保留开关与恢复按钮，方便随时开回来。

## 更新插件（发布新版本）

1. **升版本号**：改 `frieren-zzj/package.json` 的 `version`（如 `0.1.0-rc.22` → `0.1.0-rc.23`）。**必须升**：npm 不允许重复发布同一版本，pnpm 也按 lockfile 校验；
2. 重新构建 + 发布（见「从源码打包」和「发布到 npm」）：

   ```powershell
   cd D:\JavaCode\ds-h\dsh-frieren-zzj\frieren-zzj
   npm publish --tag rc        # 账号开 2FA 的话会提示输入验证码
   ```

3. 任何机器上按新版本号重装：

   ```powershell
   pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.22"
   ```

4. 重启 `dsh web` + 浏览器硬刷新（设置桥依赖 node 半边，**必须完整重启**）。

## 从源码打包

`dist/` 里的 tgz 就是安装源；需要重新打包时：

1. 升版本号（见「更新插件」）；
2. 构建出 `lib/` 再打包。本仓库自带一套**独立构建工具链**（`tsconfig.build.json` + `tsdown.config.build.ts` + `platform.build.ts`，仓库根的 `node_modules` 用 junction 复用本机 DSH 源码仓库的依赖，完全不改动 DSH 源码）：

   ```powershell
   cd D:\JavaCode\ds-h\dsh-frieren-zzj
   node node_modules/typescript/bin/tsc -p tsconfig.build.json
   node node_modules/tsdown/dist/run.mjs -c tsdown.config.build.ts
   cd frieren-zzj
   pnpm pack --pack-destination ..\dist
   ```

3. 新的 tgz 出现在 `dist/` 后，可本地安装（见「安装」第 2 步），或继续发布到 npm（见「发布到 npm」）。

## 发布到 npm（让 `dsh plugin add "包名@版本"` 直接安装）

`dsh plugin --profile web add "name@version"` 本质是让 pnpm 从 npm registry 拉包，所以把插件发布到 npmjs 后，安装命令就和装任何第三方包一样：

1. **注册/登录 npm 账号**（只需一次）：

   ```powershell
   npm adduser --registry=https://registry.npmjs.org
   ```

2. **发布**（在 `frieren-zzj/` 目录；`publishConfig.registry` 已固定指向 npmjs 官方源，不受本机腾讯镜像影响；`rc.*` 是预发布版本，必须显式给 tag）：

   ```powershell
   cd D:\JavaCode\ds-h\dsh-frieren-zzj\frieren-zzj
   npm publish --tag rc
   ```

   > 想先看打包内容：`npm publish --dry-run --tag rc`。

   > **2FA 提示**：账号开启双重认证时，`npm publish` 会提示输入验证码（或加 `--otp=6位码`）。想免验证码发布（适合脚本/CI），在 <https://www.npmjs.com/settings/zengzhaojun/tokens> 生成 **Granular Access Token**：All packages + Read and write + 勾选 **Bypass 2FA for publish**，然后 `npm config set //registry.npmjs.org/:_authToken=令牌`。令牌等于发布权限，别提交进仓库、别分享。

   > **版本标签（dist-tag）**：`--tag rc` 发布**不会**更新 `latest` 标签，所以不带版本号的安装命令装到的是 `latest`（可能落后于 rc）。建议安装时**显式写版本**（`@0.1.0-rc.22`）；想统一 latest 可补一条：`npm dist-tag add @zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.22 latest`。

3. **任何机器上一条命令安装**（本机腾讯镜像会同步 npmjs，新包一般几分钟内可见）：

   ```powershell
   pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.22"
   ```

   如果镜像还没同步到（404），可先临时指定官方源安装：

   ```powershell
   pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.22" --registry=https://registry.npmjs.org
   ```

4. 记得 `cordis.patch.yml` 里的 `name` 用包名全称 `@zengzhaojun/dsh-client-frieren-zzj`（见安装第 3 步），然后重启 `dsh web`。

> 包名规则：npm 上 scoped 包名 = 你拥有的 scope（用户名或组织）+ 包名。`@deepseek-ai/*` 是官方 scope，个人无法发布；本插件使用账号 `zengzhaojun` 的用户 scope（`@zengzhaojun/*`）。每次改源码发布前记得**升版本号**（npm 不允许重复发布同一版本）。

## 卸载

1. 删除 `cordis.patch.yml` 里第 3 步加的 insert 块；
2. 移除依赖：

   ```powershell
   pnpm dsh plugin --profile web remove @zengzhaojun/dsh-client-frieren-zzj
   # 或手动：
   cd $env:USERPROFILE\.dsh\profiles\web
   pnpm remove @zengzhaojun/dsh-client-frieren-zzj
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
按顺序排查：① `pnpm dsh web --dump-config` 里有没有 `frieren-zzj` 行；② `node_modules\@zengzhaojun\dsh-client-frieren-zzj` 是否存在；③ 浏览器是否硬刷新（Ctrl+F5）；④ 是否完整重启过 `dsh web`。

**怎么临时关闭整个插件？**
设置 →「芙莉莲主题」→ 顶部**总开关**关闭，所有主题效果立即消失、界面恢复默认；再开一次即全部回来。想连设置一起重置，点底部**恢复默认设置**。

**朋友怎么用？**
一条命令：`pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.22"`，再按「安装」第 3 步注册名录行、重启即可；背景图已内嵌，无需额外文件。离线环境则用 `dist/` 里的 tgz 走第 2 步。

**离线能用吗？**
能。标题字体在线时从 Google Fonts 加载，离线自动回退本地衬线字体栈；背景与配色完全离线可用。

## 已知限制

- 背景图内嵌使客户端 bundle 约 0.5 MB（`lib/client.js`）
- 自定义壁纸以 JPEG data URL 存入用户设置文档（上传时自动压缩到最长边 1600px，一般 < 300 KB）
- 装饰层 `pointer-events: none`，不影响任何交互
- 名台词为粉丝整理的日文原句 + 意译，非官方翻译

## 版权与许可

- 插件代码：MIT License（见 `LICENSE`）
- 背景图版权归原作者所有（本仓库默认不含背景图源文件，图片已内嵌进构建产物）
- 《葬送的芙莉莲》（葬送のフリーレン）版权归 山田鐘人・アベツカサ 及动画制作方所有；本插件为粉丝自制装饰主题，与版权方无关













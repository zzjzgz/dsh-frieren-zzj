# dsh-芙莉莲-zzj

> 葬送的芙莉莲 × 勇者辛美尔 —— DeepSeek Harness Web 界面（`dsh web`）的芙莉莲主题插件
> 
> 安装：pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38"

把整个 Web 界面变成充满芙莉莲元素的水彩世界：蓝紫水彩配色、魔法阵、苍月草飘花、星光、勇者金戒指印章与辛美尔的名台词，输入框支持玻璃/普通两种材质（消息区保持透明，壁纸完整可见）。所有开关都收在设置里的独立「芙莉莲主题」分区：外观模式、自定义壁纸上传（含模糊度调节）、整体材质、逐层装饰开关、名台词轮换方式。初始状态为无壁纸，用户可自行上传图片作为整体背景。

插件是**部署级 bundle 插件**：装进 web profile 后随 `dsh web` 自动加载，**重启不丢失、无需批准、无需手动注册**。



> 截图占位：把界面截图放到 `screenshots/preview.png` 即可显示。

## 特性

- 🛑 **插件总开关**：一键关闭**全部**主题效果（壁纸、装饰、字体、印章、徽记、台词、玻璃、配色），界面立即恢复默认外观；再次开启全部回来。开关在「芙莉莲主题」分区顶部
- ♻️ **恢复默认设置**：一键把所有设置重置为默认值（无壁纸、玻璃材质、装饰全开、随机台词、模糊度恢复 0px、清除自定义壁纸与旧版残留字段）并重新开启插件。按钮在分区底部
- 🖼️ **自定义壁纸**：上传本地图片即作为整体背景（自动压缩到 1920px JPEG，**最多 6 张**，可逐张移除或一键清空）。上传的图片由插件自己的文件存储保存到 DSH 主目录下，**设置文档里只留一条短 URL**；若文件存储不可用（未重启 `dsh web`、磁盘写入失败等）会自动退回把图片内联进设置，功能不受影响。**画廊满额时会直接拒绝，不会写入任何文件**。初始状态为**无壁纸**，上传后壁纸以独立固定层渲染，不干扰界面布局
- 🎨 **双模式配色**：浅色 = 薰衣草羊皮纸，深色 = 靛蓝夜空；设置里可选**浅色 / 深色 / 跟随系统**三态（与内置「外观」设置同步）
- 🌫️ **壁纸模糊度**：上传壁纸后出现模糊度滑块和 4 个预设按钮（无模糊 / 轻度 / 中度 / 重度），实时调节壁纸背景的 CSS `filter: blur()`（0px 清晰～20px 重度模糊），变化时平滑过渡
- 🌑 **壁纸暗度**：上传壁纸后出现暗度滑块和 4 个预设按钮（无 / 轻度 / 中度 / 重度），在壁纸上叠加黑色遮罩（0%～80%），花哨背景上的文字也能看清；0% 时不产生任何额外图层，渲染与旧版完全一致
- 🔁 **壁纸轮播**：画廊有 2 张以上图片时出现「壁纸轮播」行，可设间隔（5 秒～10 分钟）与顺序（顺序 / 随机）；随机模式保证每次换到不同的一张
- 🧊 **整体材质**：玻璃 / 普通二选一。玻璃 = 输入框、任务清单、目标卡片、设置面板统一毛玻璃（参考 OceanAvenu Dark Glass 方法：低透明底 + 强模糊 + 白边 + 层次阴影，浅/深色固定配方，不可调节），消息区卡片保持默认表面；普通 = 全部恢复默认表面。消息区保持透明，壁纸完整可见
- ✨ **逐层装饰开关**：星光、苍月草飘花、魔法阵、彩带、暗角可单独开关
- 🎛️ **装饰微调**：数量（0.25×～2×，等距抽稀而非只砍一侧）、速度（0.25×～4×）、魔法阵大小（0.5×～2×）三个滑块，另有「恢复默认」按钮
- ⚡ **性能档位**：全效 / 标准 / 省电三档一键预设，同时设定装饰数量、动画速度与整体材质（省电档改用普通材质，避开昂贵的 `backdrop-filter`）；手动调整任意一项后显示为「自定义」
- 🌌 **深色星空层**：深色主题下在内容之后、壁纸之上叠加一层缓慢漂移的星空（浅色模式不显示，专注模式与「减少动态效果」都会让它停用）
- 🔮 **施法指示器**：模型生成回复时，输入框上方浮现一枚旋转的迷你魔法阵徽记「詠唱中…」，空闲时不占位
- 🧘 **专注模式**：一键隐藏全部飘浮装饰（星光、飘花、魔法阵、彩带、暗角），保留壁纸、配色、字体、金戒指与名台词；设置里有开关，**也可直接点击侧边栏底部的金戒指**快速切换（专注时戒指会变暗）
- 💾 **备份与分享**：把整套主题设置导出为 JSON 文件，或导入他人分享的配置；导入逐字段校验后**合并**到当前设置（旧版本文件缺少的字段、以及未包含的壁纸都不会被清掉），无法识别的字段会被列出并跳过
- 💍 **勇者辛美尔的金戒指印章**：侧边栏底部的金色徽记，内嵌一朵苍月草
- ❀ **会话头部徽记**：「蒼月草が咲く頃に」
- 📜 **名台词轮换**：输入栏下方台词支持**随机 / 固定台词**两种模式，内置台词库，支持自定义固定台词和随机台词表格（日文原句 + 中文释义悬浮提示）；**点击台词即可换下一句**（仅当前会话有效，不写入设置）
- 🔤 **奇幻衬线标题字体**（Cinzel + 思源宋体）、金紫渐变滚动条、鼠尾草紫选区与焦点环
- ⚙️ **独立设置分区**：设置面板新增「芙莉莲主题」页，所有开关集中管理
- ♿ **无障碍**：遵循系统「减少动态效果」设置（`prefers-reduced-motion`）——开启后所有装饰动画静止（星光停驻、飘花停在视口内、魔法阵不旋转、壁纸过渡移除），装饰本身依然显示
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
│   ├── cordis.patch.yml       # bundle patch 层（声明 dsh.bundle 后自动激活）
│   └── ...
└── dist/
    └── zengzhaojun-dsh-client-frieren-zzj-0.1.0-rc.38.tgz   # 打包产物（安装版用）
```

## 安装

> 和ai说：根据 https://github.com/zzjzgz/dsh-frieren-zzj 的仓库指引在本地安装这个壁纸插件。

> **原理**：从 `0.1.0-rc.24` 起，本插件同时声明 `dsh.bundle` 和 `dsh.client`，`dsh plugin add` 安装后会**自动**将其加入 `dsh.profile.bundles` 层列表并激活——**不再需要手动编辑 `cordis.patch.yml`**。一条命令装完，重启即生效。
>
> **设置为什么能写入**：dsh 的 API 网关对浏览器可写的 settings 命名空间有一份**硬编码白名单**（`agent-loop`、`shell`、`locale`、`permission`、`ui-conversation`、`ui-theme`、`web-search-deepseek` 等），第三方命名空间一律 `settings-not-exposed`，浏览器端写入会被静默丢弃（表现为设置里的开关点了没反应）。本插件因此不走该通道：node 半边直接向 settings 服务注册命名空间，并额外注册一条同源 HTTP 路由（`/plugins/@zengzhaojun/dsh-client-frieren-zzj/settings`）作为浏览器读写桥，设置仍持久化在用户设置文档（`~/.dsh/settings.yaml`），与内置插件一致。**该桥依赖 node 半边，所以升级后必须完整重启 `dsh web`。**

### 第 0 步：确认环境

1. `dsh` CLI 可用。本机是通过 DSH 源码目录启动的：在 `D:\dsh-dsp\deepseek-harness` 下执行 `pnpm dsh ...`；如果你的 `dsh` 已在 PATH 上，下文所有命令去掉 `pnpm` 前缀即可。
2. `pnpm --version` 能正常输出版本号（`dsh plugin` 内部要调用 pnpm）。
3. 至少成功启动过一次 `dsh web`——首次运行会自动初始化 web profile（组合 `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app`），profile 目录就出现在 `%USERPROFILE%\.dsh\profiles\web`。

### 第 1 步：安装插件（推荐：npm 一条命令）

插件已发布到 npm（`@zengzhaojun/dsh-client-frieren-zzj`），直接按包名安装：

```powershell
pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38"
```

- 本质是让 pnpm 从 npm registry 拉包，装进 profile 依赖（由 pnpm 管理）；
- `dsh plugin` 会检测到包声明了 `dsh.bundle`，**自动**将其加入 `dsh.profile.bundles` 层列表——**无需手动编辑 `cordis.patch.yml`**；
- 本机如果配的是腾讯镜像，新版本可能延迟几分钟才同步；遇到 404 就临时指定官方源：
  `pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38" --registry=https://registry.npmjs.org`

### 第 2 步（可选）：离线/本地 tgz 安装

没有 npm 网络时，可用仓库 `dist/` 里的 tgz 安装：

```powershell
pnpm dsh plugin --profile web add "file:D:/JavaCode/ds-h/dsh-frieren-zzj/dist/zengzhaojun-dsh-client-frieren-zzj-0.1.0-rc.38.tgz"
```

> ⚠️ 路径注意：`dsh plugin add` 会把**相对**路径锚定到「你运行命令的目录」，而手动 `pnpm add` 的相对路径会相对 **profile 目录**解析——所以一律写 **`file:` + 正斜杠的绝对路径**最稳妥，不会装错地方。

**验证装上了**（任选其一）：

```powershell
# 包本体已存在：
Get-ChildItem "$env:USERPROFILE\.dsh\profiles\web\node_modules\@zengzhaojun\dsh-client-frieren-zzj\lib"
# 或让 pnpm 解释为什么安装它：
pnpm dsh plugin --profile web why @zengzhaojun/dsh-client-frieren-zzj
```

> 小知识：pnpm 写进 `package.json` 的 spec 对本地 tgz 会变成 `"file:D://JavaCode//ds-h//dsh-frieren-zzj//dist//...tgz"` 这种盘符后带双斜杠的形式，这是 pnpm 自己的路径规范化，属正常现象；从 npm 安装则是标准的 `"@zengzhaojun/dsh-client-frieren-zzj": "0.1.0-rc.38"`。

### 第 3 步：验证组合配置

```powershell
pnpm dsh web --dump-config
```

- 输出整棵组合树，每一行带注释标明来源；应能看到 `frieren-zzj` 行，注释指向插件的 `cordis.patch.yml` bundle 层；
- `--dump-config` 只打印组合、**不启动服务**，随时可以运行；
- 看不到这行？回到第 1/2 步检查：`node_modules` 里有没有包、版本号对不对。

### 第 4 步：重启 `dsh web` 并刷新浏览器

1. 在运行 `pnpm dsh web` 的终端按 `Ctrl+C` 停掉旧实例；
2. 重新运行 `pnpm dsh web`；
3. 浏览器打开 `http://127.0.0.1:3080`，**硬刷新**（Windows: `Ctrl+F5`；macOS: `Cmd+Shift+R`）——客户端 bundle 有浏览器缓存，普通刷新可能还是旧页面。

> 小技巧：想先试试不打断现有实例，可以另开一个终端跑 `pnpm dsh web --port 3081`，用 3081 端口预览；确认没问题再切回正式实例。

### 第 5 步：确认效果

应看到：蓝紫水彩配色、右上角旋转魔法阵、苍月草飘花、金紫星光、顶部彩带、侧边栏金戒指印章、「蒼月草が咲く頃に」徽记、输入栏下方名台词。初始状态无壁纸，可到设置中上传自定义壁纸。如果配色变了但装饰没出现，多半是浏览器缓存，再硬刷新一次。

打开设置（左下角齿轮）→ 导航里会出现「芙莉莲主题」分区，从上到下依次是：**插件总开关**、外观模式（浅色/深色/跟随系统）、自定义壁纸上传（含模糊度滑块与暗度滑块，各带预设按钮）、壁纸轮播（2 张以上时出现）、整体材质（玻璃 / 普通）、逐层装饰开关、装饰微调（数量 / 速度 / 魔法阵大小）、性能档位、专注模式、名台词轮换方式、**备份与分享**（导出/导入），底部是**恢复默认设置**。改完立即生效，无需刷新。总开关关闭后分区里只保留开关与恢复按钮，方便随时开回来。

## 从旧版本升级（≤ rc.23）

如果之前安装过 `rc.23` 或更早版本，升级到 `rc.24` 后可以**删除** profile `cordis.patch.yml` 里手动注册的名录行（不再需要了）：

1. 升级安装：
   ```powershell
   pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38"
   ```
2. 打开 `%USERPROFILE%\.dsh\profiles\web\cordis.patch.yml`，删除之前手动加的块：
   ```yaml
   # 删掉这段（rc.24 起不再需要）
   - insert:
       - id: frieren-zzj
         name: '@zengzhaojun/dsh-client-frieren-zzj'
   ```
3. 重启 `dsh web`——`rc.24` 的 bundle 层会自动注册插件行。

> 不删也行：profile 的 `cordis.patch.yml` 层在 bundle 层之后应用，多写一行 `insert` 只会多一条同 id 的行（Loader 去重后等效），但建议清理以保持干净。

## 更新插件（发布新版本）

1. **升版本号**：改 `frieren-zzj/package.json` 的 `version`（如 `0.1.0-rc.33` → `0.1.0-rc.38`）。**必须升**：npm 不允许重复发布同一版本，pnpm 也按 lockfile 校验；
2. 重新构建 + 发布（见「从源码打包」和「发布到 npm」）：

   ```powershell
   cd D:\JavaCode\ds-h\dsh-frieren-zzj\frieren-zzj
   npm publish --tag rc        # 账号开 2FA 的话会提示输入验证码
   ```

3. 任何机器上按新版本号重装：

   ```powershell
   pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38"
   ```

4. 重启 `dsh web` + 浏览器硬刷新（设置桥依赖 node 半边，**必须完整重启**）。

## 从源码打包

`dist/` 里的 tgz 就是安装源；需要重新打包时：

1. 升版本号（见「更新插件」）；
2. 跑单元测试（Node 内置测试运行器，零额外依赖；需 Node ≥ 22.6，本机 v24 已支持直接运行 `.ts` 测试）：

   ```powershell
   cd D:\JavaCode\ds-h\dsh-frieren-zzj\frieren-zzj
   npm test          # 等价于 node --test，自动发现 test/ 下的用例
   ```

3. 构建出 `lib/` 再打包。本仓库自带一套**独立构建工具链**（`tsconfig.build.json` + `tsdown.config.build.ts` + `platform.build.ts`，仓库根的 `node_modules` 用 junction 复用本机 DSH 源码仓库的依赖，完全不改动 DSH 源码）：

   > **junction 前提**：`node_modules/@deepseek-ai/` 下需要指向本机 DSH 源码包的 junction。除既有的那批之外，当前源码还依赖两个：
   > - `dsh-client-ui-session` → `<DSH源码>/packages/client/ui-session`（施法指示器要用它的 `useSession` 标准属性类型）
   > - `dsh-home-paths` → `<DSH源码>/packages/util/home-paths`（node 半边用它解析 DSH 主目录；构建时会被**内联**进 `lib/index.js`，所以安装方无需该包）
   >
   > 换机器重建时若报 `Cannot find module '@deepseek-ai/dsh-...'`，按上面两条补 junction 即可。

   ```powershell
   cd D:\JavaCode\ds-h\dsh-frieren-zzj
   node node_modules/typescript/bin/tsc -p tsconfig.build.json
   node node_modules/tsdown/dist/run.mjs -c tsdown.config.build.ts
   cd frieren-zzj
   npm pack --pack-destination ..\dist
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

   > **版本标签（dist-tag）**：`--tag rc` 发布**不会**更新 `latest` 标签，所以不带版本号的安装命令装到的是 `latest`（可能落后于 rc）。建议安装时**显式写版本**（`@0.1.0-rc.38`）；想统一 latest 可补一条：`npm dist-tag add @zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38 latest`。

3. **任何机器上一条命令安装**（本机腾讯镜像会同步 npmjs，新包一般几分钟内可见）：

   ```powershell
   pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38"
   ```

   如果镜像还没同步到（404），可先临时指定官方源安装：

   ```powershell
   pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38" --registry=https://registry.npmjs.org
   ```

4. 重启 `dsh web` 即可——`dsh.bundle` 声明会让插件自动作为 profile 层激活，无需手动编辑 `cordis.patch.yml`。

> 包名规则：npm 上 scoped 包名 = 你拥有的 scope（用户名或组织）+ 包名。`@deepseek-ai/*` 是官方 scope，个人无法发布；本插件使用账号 `zengzhaojun` 的用户 scope（`@zengzhaojun/*`）。每次改源码发布前记得**升版本号**（npm 不允许重复发布同一版本）。

## 卸载

1. 移除依赖（`dsh plugin` 会自动从 `dsh.profile.bundles` 中移除该层）：

   ```powershell
   pnpm dsh plugin --profile web remove @zengzhaojun/dsh-client-frieren-zzj
   # 或手动：
   cd $env:USERPROFILE\.dsh\profiles\web
   pnpm remove @zengzhaojun/dsh-client-frieren-zzj
   ```

2. 如果之前手动在 `cordis.patch.yml` 里注册过名录行（≤ rc.23），也一并删掉；
3. 重启 `dsh web`，主题消失；
4. 想连壁纸文件一起清掉：删除 `%USERPROFILE%\.dsh\plugin-data\frieren-zzj\` 整个目录即可（卸载不会自动删除，避免误删你上传的原图转存）。

## 常见问题

**重启后主题还在吗？**
在。装进 profile 就是部署级插件，随组合加载，不像动态插件那样重启即失。

**需要批准吗？**
不需要。加载路径与 `ui-theme`、`ui-sidebar` 等内置插件相同。

**安装时会有 `no dsh.bundle` 警告吗？**
从 `rc.24` 起不会了。插件现在声明了 `dsh.bundle`，`dsh plugin add` 会自动将其作为 profile 层激活。（`rc.23` 及更早版本会有该警告，是正常的——那时还是客户端插件，需要手动注册。）

**主题没生效？**
按顺序排查：① `pnpm dsh web --dump-config` 里有没有 `frieren-zzj` 行；② `node_modules\@zengzhaojun\dsh-client-frieren-zzj` 是否存在；③ 浏览器是否硬刷新（Ctrl+F5）；④ 是否完整重启过 `dsh web`。

**怎么临时关闭整个插件？**
设置 →「芙莉莲主题」→ 顶部**总开关**关闭，所有主题效果立即消失、界面恢复默认；再开一次即全部回来。想连设置一起重置，点底部**恢复默认设置**。

**朋友怎么用？**
一条命令：`pnpm dsh plugin --profile web add "@zengzhaojun/dsh-client-frieren-zzj@0.1.0-rc.38"`，重启 `dsh web` 即可；初始无壁纸，到设置中上传自定义壁纸。离线环境则用 `dist/` 里的 tgz 走第 2 步。想连配置一起分享：设置 →「芙莉莲主题」→**备份与分享** →「导出设置」得到一个 JSON 文件，对方点「导入设置」选中它即可（壁纸也在文件里，可能较大）。

**离线能用吗？**
能。标题字体在线时从 Google Fonts 加载，离线自动回退本地衬线字体栈；配色完全离线可用，壁纸由用户上传后离线可用。

## 已知限制

- 自定义壁纸上传时自动压缩到最长边 1920px 的 JPEG；新上传的图片存为文件（见下），旧版本内联在设置文档里的 data URL 仍然可用（一般 < 300 KB）
- 壁纸文件存放在 `%USERPROFILE%\.dsh\plugin-data\frieren-zzj\wallpapers\`（或 `$DSH_HOME` 对应位置），文件名是图片内容哈希；**移除某张 / 清空 / 导入配置时会立即删掉不再被引用的文件**，插件每次启动还会再扫一遍兜底（5 分钟内写入的会保留，只用于保护"文件已写、设置还没落盘"的在途上传）。因为文件名是内容哈希，同一张图被两个画廊条目引用时，只有最后一个引用消失才会删文件
- 画廊上限 6 张；若文件存储不可用则退回内联存储，设置文档最多增加约 2 MB
- 壁纸轮播在画廊有 2 张以上时才出现；单张壁纸的行为与旧版完全一致（不启动定时器）
- ⚠️ **导出的备份里存的是图片 URL，不含图片本体**：同机恢复没问题，但发给别人、或删掉 `plugin-data` 后再导入，壁纸会加载不出来（需重新上传）。这是壁纸改存文件后的连带限制，后续计划在导出时把图片内联回去（届时备份会重新变大）
- 装饰层 `pointer-events: none`，不影响任何交互
- 名台词为粉丝整理的日文原句 + 意译，非官方翻译

## 版权与许可

- 插件代码：MIT License（见 `LICENSE`）
- 背景图版权归原作者所有（自定义壁纸由用户上传，插件不含内置背景图）
- 《葬送的芙莉莲》（葬送のフリーレン）版权归 山田鐘人・アベツカサ 及动画制作方所有；本插件为粉丝自制装饰主题，与版权方无关

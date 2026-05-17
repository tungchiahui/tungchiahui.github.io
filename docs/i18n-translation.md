# i18n 翻译生成流程

这个项目的多语言内容分成两条线：

```text
Markdown 正文：content/posts、content/wiki
Vue 页面 UI：utils/i18n-page-copy-source.ts
```

两条线都只把简体中文作为源内容维护。其他语言由脚本在构建前生成。

Markdown 正文会生成到：

```text
content/_i18n/zh-hant
content/_i18n/zh-hk
content/_i18n/zh-tw
content/_i18n/en-us
```

不要手动修改 `content/_i18n` 里的文件，它们是生成结果。

Vue UI 字典会生成到：

```text
utils/generated/i18n-page-copy.ts
```

不要手动修改 `utils/generated/i18n-page-copy.ts`，它也是生成结果。

## 命令

只根据已有 Markdown 缓存、术语表、人工覆盖生成 Markdown 多语言内容，不调用翻译 API：

```bash
npm run i18n:gen
```

只根据已有 UI 翻译记忆库生成 Vue 页面 UI 字典，不调用翻译 API：

```bash
npm run i18n:ui
```

生成 Markdown 多语言内容，并对英文缺失块调用已配置的翻译 API：

```bash
npm run i18n:translate
```

生成 Vue 页面 UI 英文记忆库，并对缺失 UI 文案调用已配置的翻译 API：

```bash
npm run i18n:ui:translate
```

如果本地想一次更新 Markdown 正文和 Vue UI 的英文翻译：

```bash
npm run i18n:translate:all
```

检查生成后的英文内容里是否还有未翻译标记：

```bash
npm run i18n:check
```

Pages 构建不需要手写 `npm run i18n:ui && npm run i18n:gen && ...`，因为 npm 生命周期脚本已经接好了。

如果 Pages 模板或平台默认构建命令是：

```bash
npm run build
```

可以直接使用。原因是 `prebuild` 已经会自动运行：

```bash
npm run i18n:ui && npm run i18n:gen
```

也就是说 Pages 执行 `npm run build` 时，实际会先生成 Vue UI 字典和 Markdown 多语言内容，再执行 `nuxt generate`。

如果是纯静态 Pages，并且你自己控制构建命令，仍然更推荐：

```bash
npm run generate
```

`pregenerate` 也会自动运行：

```bash
npm run i18n:ui && npm run i18n:gen
```

所以 `npm run generate` 前同样会先生成 Vue UI 字典和 Markdown 多语言内容。两种命令都不会在 Pages 正式构建时依赖翻译 API。

当前脚本链路是：

```text
npm run build
  -> prebuild
    -> npm run i18n:ui
    -> npm run i18n:gen
  -> nuxt generate

npm run generate
  -> pregenerate
    -> npm run i18n:ui
    -> npm run i18n:gen
  -> nuxt generate
```

## 英文翻译记忆库

这一节只针对 Markdown 正文，也就是 `content/posts` 和 `content/wiki`。

英文使用块级 Translation Memory，不按整篇 Markdown 做 hash。

记忆库文件是：

```text
i18n/memory/en-us.json
```

每个 Markdown block 会单独计算 hash。当前覆盖的 block 包括：

- Frontmatter 文本字段，例如 `title`、`description`、`summary`、`subtitle`、`excerpt`
- 标题
- 段落行
- 列表项
- 引用
- 表格单元格文本

这些内容会被保护，不会翻译：

- fenced code block
- inline code
- URL
- Markdown 链接目标
- 图片路径

如果某个 block 不在 memory 里，并且没有开启 API 翻译，或者 API 翻译失败，生成的英文文件会保留原中文，并加上缺失标记：

```html
<!-- i18n-missing: en-us -->
```

Frontmatter 里会使用 YAML 注释形式：

```yaml
# i18n-missing: en-us
```

## Vue 页面 UI 文案

`i18n:gen` 只处理 Markdown 内容：

```text
content/posts
content/wiki
```

它不会自动翻译 `.vue` 页面里的硬编码文案。原因是 Vue 文件是程序代码，里面混有 template、script、style、路径、配置、SEO 字段、数组数据和注释。直接用脚本扫描 `.vue` 并替换中文，容易把代码、链接、key 或配置改坏。

所以本项目采用两套策略：

```text
Markdown 正文：构建期脚本自动生成 content/_i18n
Vue 页面 UI：构建期脚本生成 locale-aware 文案字典
```

页面 UI 文案应该根据当前路由 locale 渲染，例如 `/en-us/about` 直接输出英文 HTML，而不是访问时再做 DOM 转换。

`utils/i18n-page-copy-source.ts` 不是自动扫描 `.vue` 生成的文件，它是 Vue UI 的简体中文源文案文件。新增或修改 Vue 页面 UI 文案时，推荐让 Codex 把可见文案从 `.vue` 接入这里；不要指望 `npm run i18n:ui` 自动扫描 `.vue`。

Vue UI 文案的生成链路是：

```text
utils/i18n-page-copy-source.ts
  -> npm run i18n:ui:translate
  -> i18n/ui-memory/en-us.json
  -> npm run i18n:ui
  -> utils/generated/i18n-page-copy.ts
  -> 页面通过 getPageCopy(page, locale) 读取
```

其中 `utils/i18n-page-copy-source.ts` 只手写维护简体中文 UI 文案。`zh-hant`、`zh-hk`、`zh-tw` 由 OpenCC 在构建期生成；`en-us` 由 `i18n/ui-memory/en-us.json` 生成。这样不会在浏览器访问期扫描 DOM，也不会在路由切换时做大范围转换。

`npm run i18n:ui` 永远只读本地文件，不调用翻译 API。新增中文 UI 文案后，如果没有运行 `npm run i18n:ui:translate`，英文会暂时回退到中文源文案；运行翻译命令后，新增英文会写入 `i18n/ui-memory/en-us.json`，后续纯静态构建直接复用。

`npm run build` 和 `npm run generate` 已经通过 `prebuild` / `pregenerate` 自动执行 `npm run i18n:ui && npm run i18n:gen`，Pages 默认使用 `npm run build` 时不需要额外配置。

目前已接入路由语言的页面包括：

```text
/
/about
/more
/stats
/cv
```

CV 页面不再维护独立的“中文 / English”状态，而是跟随全站语言：

```text
/cv 或 /zh-cn/cv -> 中文简历
/en-us/cv -> 英文简历
/zh-hant/cv、/zh-hk/cv、/zh-tw/cv -> 中文简历内容，外层页面跟随全站 locale
```

新增 Vue 页面时，不建议直接写死大量中文。推荐把页面文案放进 `utils/i18n-page-copy-source.ts`，再运行 `npm run i18n:ui:translate` 更新英文记忆库，最后运行 `npm run i18n:ui` 或 `npm run generate` 生成静态文案。只有接入这个源文件的 Vue UI 文案才会自动生成繁体和英文；没有接入的硬编码中文不会被脚本改动。

如果你不想手动维护 `utils/i18n-page-copy-source.ts` 的结构，可以每次新增 Vue 页面后让 Codex 处理：

```text
把这个 Vue 页面的硬编码中文 UI 文案接入 i18n-page-copy-source.ts，并更新英文 UI memory。
```

Codex 应该只搬迁用户可见 UI 文案、SEO 文案和 aria label；不要把注释、localStorage key、路由、URL、代码标识符或非展示配置当成翻译文案。

Vue UI 英文记忆库文件是：

```text
i18n/ui-memory/en-us.json
```

每条 UI 字符串会按页面路径和中文源文案计算 key。这样同一句中文在不同按钮、标题或 SEO 字段里可以保留不同译法。UI 翻译命令会优先使用现有 memory；如果源文件里临时存在旧的 `en` 字段，也会把旧英文导入 memory，方便迁移。

Vue UI 人工覆盖文件是：

```text
i18n/ui-overrides/en-us.json
```

覆盖 key 可以是 UI 路径、完整 memory key，也可以是源中文：

```json
{
  "more.cards.stats.0": "Stats",
  "数据统计": "Stats"
}
```

Vue UI 英文优先级是：

```text
ui-overrides > ui-memory > 源文件旧 en 字段迁移 > API 翻译 > fallback 原文
```

## 术语表

英文术语表文件是：

```text
i18n/glossary/en-us.json
```

它把中文术语映射到指定英文译法。调用翻译 API 时，术语表会放进 system prompt，尽量让模型稳定使用同一套翻译。

## 人工覆盖

人工覆盖文件放在：

```text
i18n/overrides/en-us/
```

覆盖文件是 JSON。key 可以是 block hash，也可以是源文本：

```json
{
  "单片机": "microcontroller",
  "sha256-block-hash": {
    "target": "Manual translation"
  }
}
```

优先级是：

```text
overrides > memory > API 翻译 > fallback 原文
```

## 翻译 Provider

Markdown 翻译 API 必须显式开启。两种方式任选一种：

```bash
npm run i18n:translate
```

或者：

```bash
I18N_TRANSLATE=1 npm run i18n:gen
```

支持的 provider 名称：

```bash
export TRANSLATE_PROVIDER=deepseek
export TRANSLATE_PROVIDER=openai
export TRANSLATE_PROVIDER=mimo
```

DeepSeek 示例：

```bash
export TRANSLATE_PROVIDER=deepseek
export TRANSLATE_BASE_URL=https://api.deepseek.com
export TRANSLATE_MODEL=deepseek-v4-flash
export TRANSLATE_API_KEY=sk-xxxx
npm run i18n:translate
npm run i18n:ui:translate
```

OpenAI 示例：

```bash
export TRANSLATE_PROVIDER=openai
export TRANSLATE_BASE_URL=https://api.openai.com/v1
export TRANSLATE_MODEL=gpt-4.1-mini
export TRANSLATE_API_KEY=sk-xxxx
npm run i18n:translate
npm run i18n:ui:translate
```

小米 MiMo 示例：

```bash
export TRANSLATE_PROVIDER=mimo
export TRANSLATE_BASE_URL=https://api.xiaomimimo.com/v1
export TRANSLATE_MODEL=mimo-v2-flash
export TRANSLATE_API_KEY=sk-xxxx
npm run i18n:translate
npm run i18n:ui:translate
```

脚本按 OpenAI-compatible `/chat/completions` 接口调用。小米 MiMo 的 OpenAI-compatible base URL 是 `https://api.xiaomimimo.com/v1`，完整请求地址会拼成 `https://api.xiaomimimo.com/v1/chat/completions`。

Vue UI 翻译使用同一组 provider 环境变量，但命令不同：

```bash
npm run i18n:ui:translate
```

如果没有配置 `TRANSLATE_API_KEY`，`npm run i18n:ui:translate` 不会联网，只会复用已有 `i18n/ui-memory/en-us.json`，并在存在旧 `en` 字段时导入旧英文。新增 UI 文案在没有 provider 时会以中文回退写入 memory，之后配置好 provider 后可以删除对应 fallback 项再重跑。

### 运行时反馈

`npm run i18n:gen` 和 `npm run i18n:translate` 会输出进度，避免长时间运行时看起来像卡死。

启动时会输出任务摘要：

```text
i18n: source files 127
i18n: target locales zh-hant, zh-hk, zh-tw, en-us
i18n: translate mode on
i18n: memory entries 3521
i18n: provider deepseek / deepseek-v4-flash
```

处理文件时会周期性输出：

```text
i18n: files 40/127, blocks 820, memory hits 760, api translated 60, missing 0, elapsed 01:25
```

API 翻译时会按请求数量或时间间隔输出：

```text
i18n: api 120/120, failed 0, elapsed 03:42
```

结束时会输出总结：

```text
i18n: done
i18n: files 127/127
i18n: blocks 2384
i18n: memory hits 2200
i18n: api translated 184
i18n: fallback missing 0
i18n: memory saved i18n/memory/en-us.json
```

如果 `fallback missing` 大于 0，说明仍有英文 block 没翻译成功，可以再检查 API 配置或运行 `npm run i18n:check` 看具体文件。

### 常用模型示例

`TRANSLATE_MODEL` 可以按实际 provider 支持情况替换。下面只是常见示例，最终以各平台控制台和官方文档为准。

DeepSeek：

```text
deepseek-v4-flash
deepseek-chat
```

OpenAI：

```text
gpt-4.1-mini
gpt-4o-mini
```

小米 MiMo：

```text
mimo-v2-flash
mimo-v2.5
mimo-v2.5-pro
mimo-v2-pro
```

批量翻译优先选速度快、价格低的模型；少量重要页面需要更高质量时，再换成更强的模型重跑。已经命中的 block 会优先使用 `i18n/memory/en-us.json`，如果要强制重翻某段，需要先删除对应 memory 项，或者用 overrides 覆盖。

Vue UI 翻译命令使用同一组 provider 环境变量和同一个术语表，但记忆库存放在 `i18n/ui-memory/en-us.json`，避免 UI 短文案和 Markdown 正文互相污染。

Vue UI 翻译命令结束时会输出类似：

```text
i18n-ui: translation memory updated
i18n-ui: strings 91
i18n-ui: memory hits 91
i18n-ui: legacy imported 0
i18n-ui: override hits 0
i18n-ui: api translated 0
i18n-ui: api failed 0
i18n-ui: fallback missing 0
i18n-ui: memory saved i18n/ui-memory/en-us.json
```

## 推荐工作流

平时写文章或改中文内容，本地检查可以用：

```bash
npm run i18n:ui
npm run i18n:gen
npm run build
```

纯静态预览或部署前也可以用：

```bash
npm run generate
```

本地批量更新英文翻译：

```bash
npm run i18n:translate
npm run i18n:ui:translate
npm run i18n:check
```

也可以用聚合命令：

```bash
npm run i18n:translate:all
```

建议提交这些翻译控制文件：

```text
i18n/memory/en-us.json
i18n/ui-memory/en-us.json
i18n/glossary/en-us.json
i18n/overrides/en-us/
i18n/ui-overrides/en-us.json
```

`content/_i18n/` 是生成目录，目前在这个仓库里被 `.gitignore` 忽略。Pages 构建时会通过 `prebuild` / `pregenerate` 运行 `npm run i18n:ui && npm run i18n:gen`，用已提交的中文源内容和翻译记忆库重新生成 Vue UI 字典与 Markdown 多语言内容。

如果 Pages 的构建命令是 `npm run build`，保持这个命令即可，`prebuild` 会自动生成 `utils/generated/i18n-page-copy.ts` 和 `content/_i18n/`。如果你能选择命令且目标是纯静态产物，优先用 `npm run generate`。两者都不需要在 Pages 上配置翻译 API Key。

不要把 Pages 构建机当成翻译缓存。稳定缓存应该是提交到 Git 的 `i18n/memory/en-us.json` 和 `i18n/ui-memory/en-us.json`。

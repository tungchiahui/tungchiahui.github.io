# i18n 翻译生成流程

这个项目只手写维护简体中文内容：

```text
content/posts
content/wiki
```

其他语言由脚本自动生成到：

```text
content/_i18n/zh-hant
content/_i18n/zh-hk
content/_i18n/zh-tw
content/_i18n/en-us
```

不要手动修改 `content/_i18n` 里的文件，它们是生成结果。

## 命令

只根据已有缓存、术语表、人工覆盖生成所有语言，不调用翻译 API：

```bash
npm run i18n:gen
```

生成所有语言，并对英文缺失块调用已配置的翻译 API：

```bash
npm run i18n:translate
```

检查生成后的英文内容里是否还有未翻译标记：

```bash
npm run i18n:check
```

Pages 构建不需要手写 `npm run i18n:gen && ...`，因为 npm 生命周期脚本已经接好了。

如果 Pages 模板或平台默认构建命令是：

```bash
npm run build
```

可以直接使用。原因是 `prebuild` 已经会自动运行 `npm run i18n:gen`。也就是说 Pages 执行 `npm run build` 时，实际会先生成 i18n 内容，再执行 `nuxt build`。

如果是纯静态 Pages，并且你自己控制构建命令，仍然更推荐：

```bash
npm run generate
```

`pregenerate` 也会自动运行 `npm run i18n:gen`，所以 `npm run generate` 前同样会先生成 i18n 内容。两种命令都不会在 Pages 正式构建时依赖翻译 API。

## 英文翻译记忆库

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

Vue UI 文案的生成链路是：

```text
utils/i18n-page-copy-source.ts
  -> npm run i18n:ui
  -> utils/generated/i18n-page-copy.ts
  -> 页面通过 getPageCopy(page, locale) 读取
```

其中 `zh-cn` 和 `en-us` 在源文件里人工维护，`zh-hant`、`zh-hk`、`zh-tw` 由 OpenCC 在构建期生成。这样不会在浏览器访问期扫描 DOM，也不会在路由切换时做大范围转换。

`npm run build` 和 `npm run generate` 已经通过 `prebuild` / `pregenerate` 自动执行 `npm run i18n:ui`，Pages 默认使用 `npm run build` 时不需要额外配置。

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

新增 Vue 页面时，不建议直接写死大量中文。推荐把页面文案放进 `utils/i18n-page-copy-source.ts`，再运行 `npm run i18n:ui` 生成静态文案。只有接入这个源文件的 Vue UI 文案才会自动生成繁体；没有接入的硬编码中文不会被脚本改动。

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

翻译 API 必须显式开启。两种方式任选一种：

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
```

OpenAI 示例：

```bash
export TRANSLATE_PROVIDER=openai
export TRANSLATE_BASE_URL=https://api.openai.com/v1
export TRANSLATE_MODEL=gpt-4.1-mini
export TRANSLATE_API_KEY=sk-xxxx
npm run i18n:translate
```

小米 MiMo 示例：

```bash
export TRANSLATE_PROVIDER=mimo
export TRANSLATE_BASE_URL=https://api.xiaomimimo.com/v1
export TRANSLATE_MODEL=mimo-v2-flash
export TRANSLATE_API_KEY=sk-xxxx
npm run i18n:translate
```

脚本按 OpenAI-compatible `/chat/completions` 接口调用。小米 MiMo 的 OpenAI-compatible base URL 是 `https://api.xiaomimimo.com/v1`，完整请求地址会拼成 `https://api.xiaomimimo.com/v1/chat/completions`。

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

## 推荐工作流

平时写文章或改中文内容，本地检查可以用：

```bash
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
npm run i18n:check
```

建议提交这些翻译控制文件：

```text
i18n/memory/en-us.json
i18n/glossary/en-us.json
i18n/overrides/en-us/
```

`content/_i18n/` 是生成目录，目前在这个仓库里被 `.gitignore` 忽略。Pages 构建时应该运行 `npm run i18n:gen`，用已提交的中文源内容和翻译记忆库重新生成它。

如果 Pages 的构建命令是 `npm run build`，保持这个命令即可，`prebuild` 会自动生成 `content/_i18n/`。如果你能选择命令且目标是纯静态产物，优先用 `npm run generate`。两者都不需要在 Pages 上配置翻译 API Key。

不要把 Pages 构建机当成翻译缓存。稳定缓存应该是提交到 Git 的 `i18n/memory/en-us.json`。

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

静态部署建议使用不依赖 API 的流程：

```bash
npm run i18n:gen && npm run generate
```

`prebuild` 和 `pregenerate` 已经会自动运行 `npm run i18n:gen`，所以 Pages 正式构建默认不会依赖翻译 API。

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

平时写文章或改中文内容：

```bash
npm run i18n:gen
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

不要把 Pages 构建机当成翻译缓存。稳定缓存应该是提交到 Git 的 `i18n/memory/en-us.json`。

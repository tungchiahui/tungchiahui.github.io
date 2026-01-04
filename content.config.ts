import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
      // 在这里定义你的字段格式
      schema: z.object({
        title: z.string(),
        date: z.string(), // 或者用 z.date()，但 Markdown 里写的是字符串，通常用 string 更省心
      })
    }),
  },
  // 高亮配置要放在 markdown 下
  markdown: {
    highlight: {
      theme: 'github-light' // 使用 github-light 主题
    }
  }
})
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
  // 强制配置高亮主题
  content: {
    highlight: {
      // 使用 github-light 主题，这样背景是浅色，代码是深色，绝对看得清
      theme: 'github-light'
    }
  }
})
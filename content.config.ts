import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
      schema: z.object({
        title: z.string(),
        date: z.string(),
      })
    }),
  },
  // highlight: false // 尝试先彻底关闭，看代码块是否变回最原始的黑色
  highlight: {
    theme: {
      default: 'github-light',
      dark: 'github-dark'
    },
    // ✅ 修改这里：显式列举更多常用语言，或者增加你需要的所有语言
    // 如果不写 langs 字段，Nuxt Content 默认会加载一批常用语言
    // 如果想涵盖绝大多数开发场景，建议添加以下全量列表：
    langs: [
      'ts', 'js', 'vue', 'json', 'bash', 'md', 'html', 'css', 'scss',
      'python', 'py', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 
      'php', 'sql', 'yaml', 'toml', 'docker', 'dockerfile', 'kotlin', 
      'swift', 'ruby', 'dart', 'lua', 'perl', 'r', 'zig'
    ]
  }
})
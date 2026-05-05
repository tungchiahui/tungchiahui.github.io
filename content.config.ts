import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**',
      schema: z.object({
        title: z.string(),
        date: z.string().optional(),
        layout: z.string().optional(),
        chapter: z.string().optional(),
        chapterSort: z.number().optional(),
        docKey: z.string().optional(),
        docRoot: z.string().optional(),
        docTitle: z.string().optional(),
        isWikiDoc: z.boolean().optional(),
        isWikiIndex: z.boolean().optional(),
        wikiDepth: z.number().optional(),
      })
    }),
  }
})

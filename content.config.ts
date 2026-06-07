import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['**/.*/**'],
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().optional(),
        layout: z.string().optional(),
        locale: z.string().optional(),
        localeSlug: z.string().optional(),
        i18nKey: z.string().optional(),
        canonicalPath: z.string().optional(),
        sourcePath: z.string().optional(),
        sourceStem: z.string().optional(),
        legacyPath: z.string().optional(),
        isBlogPost: z.boolean().optional(),
        chapterOrder: z.string().optional(),
        chapterDepth: z.number().optional(),
        docKey: z.string().optional(),
        docI18nKey: z.string().optional(),
        docRoot: z.string().optional(),
        docTitle: z.string().optional(),
        isWikiDoc: z.boolean().optional(),
        isWikiIndex: z.boolean().optional(),
        wikiDepth: z.number().optional(),
      })
    }),
  }
})

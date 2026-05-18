import { getLocalizedContentMeta } from './utils/wiki-content-meta'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ✅ 关闭 SSR
  // ssr: false,

  // ✅ 纯静态输出（nuxi generate）
  nitro: {
    preset: 'static'
  },

  modules: ['@nuxt/content', '@nuxt/image'],

  css: [
    '~/assets/css/app.css',
    '~/assets/css/index.css',
    '~/assets/css/blog.css',
    '~/assets/css/wiki.css',
    '~/assets/css/musicplayer.css',
    '~/assets/css/aplayer.css',
    '~/assets/css/friend.css',
    '~/assets/css/more.css',
  ],

  content: {
    build: {
      transformers: ['./transformers/wiki-pinyin-path.ts']
    }
  },

  hooks: {
    'content:file:afterParse'({ content }) {
      const contentMeta = getLocalizedContentMeta(content.stem, content)

      if (contentMeta) {
        Object.assign(content, contentMeta)
      }
    }
  },

  image: {
    // CDN 域名（静态完全没问题）
    domains: ['cdn.tungchiahui.cn']
  },

  // Nuxt 4 规范（可以保留）
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  compatibilityDate: '2025-01-01',

  app: {
    head: {
      script: [
        {
          src: 'https://umami.tungchiahui.cn/script.js',
          'data-website-id': '993e907c-7120-4da5-9eaf-85a914ffbc9c',
          defer: true
        },
        {
          src: 'https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.js'
        },
        {
          src: 'https://cdn.tungchiahui.cn/libs/font-awesome/7.1.0/all.min.js',
          defer: true
        }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.css'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.tungchiahui.cn/libs/font-awesome/7.1.0/fontawesome.min.css'
        }
      ]
    }
  },

  // ✅ 核心修改：在 v3 中，高亮配置必须写在 mdc 节点下，而不是 content 节点下
  mdc: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      },
      langs: [
        'ts', 'js', 'vue', 'json', 'bash', 'md', 'html', 'css', 'scss',
        'python', 'py', 'java','cmake', 'cpp', 'c', 'csharp', 'go', 'rust', 
        'php', 'sql', 'yaml','yml','xml', 'toml', 'docker', 'dockerfile', 'kotlin', 
        'swift', 'ruby', 'dart', 'lua', 'perl', 'r', 'zig'
      ]
    }
  },


  // ✅ 运行时 public 配置（静态可用）
  runtimeConfig: {
    public: {
      url: 'www.tungchiahui.cn',
      umami: {
        baseUrl: process.env.NUXT_PUBLIC_UMAMI_BASE_URL || 'https://umami.tungchiahui.cn',
        shareId: process.env.NUXT_PUBLIC_UMAMI_SHARE_ID || 'rCG6EZoHmlCmNnWn',
        startAt: process.env.NUXT_PUBLIC_UMAMI_START_AT || '2024-01-01T00:00:00.000Z',
        pathLimit: Number(process.env.NUXT_PUBLIC_UMAMI_PATH_LIMIT || 5000)
      },

      record:{
        icp: '鲁ICP备2025185601号-2',
        beian: '鲁公网安备37030302001121号',
      },

      // ✅ 社交/联系方式配置(没有的就注释掉那一行)
      social: {
        email: "mailto:tungchiahui@gmail.com",
        website: "https://www.tungchiahui.cn",
        github: "https://github.com/tungchiahui",
        qq: "https://qm.qq.com/q/JRhksaNK82?from=qq",
        telegram: "https://t.me/tungchiahui",
        douyin: "https://www.douyin.com/user/MS4wLjABAAAA3V6NoUIGPi3_EjzGc4Uxb-JZHOwWtuclAlrKF6SJTM7SET0PseLNV1bcDYwmcu9T",
        bilibili: "https://space.bilibili.com/141482453",
        coolapk: "http://www.coolapk.com/u/3224578",
        twitter: "https://twitter.com/tungchiahui",
        youtube: "https://www.youtube.com/@Chia-huiTung",
        facebook: "https://www.facebook.com/tungchiahui",
        instagram: "https://www.instagram.com/tungchiahui",
        tiktok: "https://www.tiktok.com/@tungchiahui"
      }
    }
  }
})

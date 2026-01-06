// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ✅ 关闭 SSR（纯静态核心）
  ssr: false,

  // ✅ 纯静态输出（nuxi generate）
  nitro: {
    preset: 'static'
  },

  modules: ['@nuxt/content', '@nuxt/image'],

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

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'meting-js'
    }
  },


  // // ✅ Nuxt 4 里添加 head
  // app: {
  //   head: {
  //     script: [
  //       { src: "https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.js", defer: true },
  //       { src: "https://cdn.tungchiahui.cn/libs/meting/1.2.0/Meting.min.js", defer: true }
  //     ],
  //     link: [
  //       { rel: "stylesheet", href: "https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.css" }
  //     ]
  //   }
  // },

  // ✅ 运行时 public 配置（静态可用）
  runtimeConfig: {
    public: {
      icp: '鲁ICP备2025185601号-2',
      beian: '鲁公网安备37030302001121号'
    }
  }
})

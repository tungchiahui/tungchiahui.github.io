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


  // ✅ 运行时 public 配置（静态可用）
  runtimeConfig: {
    public: {
      url: 'www.tungchiahui.cn',

      record:{
        icp: '鲁ICP备2025185601号-2',
        beian: '鲁公网安备37030302001121号',
      },

            // ✅ 社交/联系方式配置
      social: {
        email: "mailto:tungchiahui@gmail.com",
        website: "https://www.tungchiahui.cn",
        github: "https://github.com/tungchiahui",
        qq: "https://qm.qq.com/q/JRhksaNK82?from=qq",
        telegram: "https://t.me/tungchiahui",
        bilibili: "https://space.bilibili.com/141482453",
        coolapk: "http://www.coolapk.com/u/3224578",
        twitter: "https://twitter.com/tungchiahui",
        youtube: "https://www.youtube.com/@Chia-huiTung",
        facebook: "https://www.facebook.com/tungchiahui",
        instagram: "https://www.instagram.com/tungchiahui"
      }
    }
  }
})

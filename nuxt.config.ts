// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
  ],
  // 告诉 Nuxt 使用第 4 版的规范
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  compatibilityDate: '2025-01-01',
  
  runtimeConfig: {
    public: {
      icp: '鲁ICP备2025185601号-2',
      beian: '鲁公网安备37030302001121号'
    }
  }
})
<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <footer class="main-footer">
    <div>© 2025 东澈的折腾天地 - Powered by Nuxt</div>

    <div class="footer-records">
      <!-- 工信部 ICP 备案 -->
      <a
        v-if="config.public.icp"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener"
        class="footer-record"
      >
        <img
          src="https://cdn.tungchiahui.cn/tungwebsite/assets/images/footer/favicon-miit.webp"
          alt="工信部图标"
        />
        {{ config.public.icp }}
      </a>

      <!-- 公安备案 -->
      <a
        v-if="config.public.beian"
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=37030302001121"
        target="_blank"
        rel="noopener"
        class="footer-record"
      >
        <img
          src="https://cdn.tungchiahui.cn/tungwebsite/assets/images/footer/favicon-mps.webp"
          alt="公安备案图标"
        />
        {{ config.public.beian }}
      </a>
    </div>
  </footer>
</template>

<style src="~/assets/css/footer.css"></style>

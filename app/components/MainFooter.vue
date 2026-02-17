<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <footer class="main-footer">
    <div class="footer-brand">
      <span>© 2026 东澈的折腾天地</span>
      <span class="brand-sep">-</span>
      <a
        class="powered-link"
        href="https://nuxt.com"
        target="_blank"
        rel="noopener noreferrer"
        title="访问 Nuxt 官网"
      >
        <img
          class="nuxt-favicon"
          src="https://nuxt.com/icon.png"
          alt="Nuxt"
          loading="lazy"
          decoding="async"
        />
        <span>Powered by Nuxt</span>
      </a>
    </div>

    <!-- 社交图标 -->
    <div class="footer-social">
      <a
        v-if="config.public.social?.website"
        :href="config.public.social.website"
        target="_blank"
        rel="noopener"
        title="Website"
      >
        <i class="fas fa-link"></i>
      </a>

      <a
        v-if="config.public.social?.email"
        :href="config.public.social.email"
        target="_blank"
        rel="noopener"
        title="E-Mail"
      >
        <i class="fas fa-envelope"></i>
      </a>

      <a
        v-if="config.public.social?.github"
        :href="config.public.social.github"
        target="_blank"
        rel="noopener"
        title="GitHub"
      >
        <i class="fab fa-github"></i>
      </a>

      <a
        v-if="config.public.social?.qq"
        :href="config.public.social.qq"
        target="_blank"
        rel="noopener"
        title="QQ"
      >
        <i class="fab fa-qq"></i>
      </a>

      <a
        v-if="config.public.social?.telegram"
        :href="config.public.social.telegram"
        target="_blank"
        rel="noopener"
        title="Telegram"
      >
        <i class="fab fa-telegram"></i>
      </a>

      <a
        v-if="config.public.social?.douyin"
        :href="config.public.social.douyin"
        target="_blank"
        rel="noopener"
        title="抖音"
      >
      <i class="fab fa-tiktok"></i>
    </a>

      <a
        v-if="config.public.social?.bilibili"
        :href="config.public.social.bilibili"
        target="_blank"
        rel="noopener"
        title="Bilibili"
      >
        <i class="fa-brands fa-bilibili"></i>
      </a>

      <a
        v-if="config.public.social?.youtube"
        :href="config.public.social.youtube"
        target="_blank"
        rel="noopener"
        title="YouTube"
      >
        <i class="fab fa-youtube"></i>
      </a>

      <a
        v-if="config.public.social?.twitter"
        :href="config.public.social.twitter"
        target="_blank"
        rel="noopener"
        title="Twitter"
      >
        <i class="fab fa-twitter"></i>
      </a>

      <a
        v-if="config.public.social?.facebook"
        :href="config.public.social.facebook"
        target="_blank"
        rel="noopener"
        title="Facebook"
      >
        <i class="fab fa-facebook"></i>
      </a>

      <a
        v-if="config.public.social?.instagram"
        :href="config.public.social.instagram"
        target="_blank"
        rel="noopener"
        title="Instagram"
      >
        <i class="fab fa-instagram"></i>
      </a>

      <a
      v-if="config.public.social?.tiktok"
      :href="config.public.social.tiktok"
      target="_blank"
      rel="noopener"
      title="TikTok"
    >
      <i class="fab fa-tiktok"></i>
    </a>

      <a
        v-if="config.public.social?.coolapk"
        :href="config.public.social.coolapk"
        target="_blank"
        rel="noopener"
        title="CoolAPK"
      >
        <i class="fab fa-android"></i>
      </a>

    </div>

    <!-- IPv6 / SSL 认证徽章 -->
    <div class="footer-cert">
      <a 
        :href="`https://ipw.cn/ipv6webcheck/?site=${config.public.url}`" 
        title="本站支持IPv6访问" 
        target="_blank"
      >
        <img alt="本站支持IPv6访问"
            src="https://static.ipw.cn/icon/ipv6-certified-s1.svg">
      </a>

      <a 
        :href="`https://ipw.cn/ssl/?site=${config.public.url}`" 
        title="本站支持SSL安全访问" 
        target="_blank"
      >
        <img alt="本站支持SSL安全访问"
            src="https://static.ipw.cn/icon/ssl-s1.svg">
      </a>
    </div>

    <div class="footer-records">
      <!-- 工信部 ICP 备案 -->
      <a
        v-if="config.public.record?.icp"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener"
        class="footer-record"
      >
        <img
          src="https://cdn.tungchiahui.cn/tungwebsite/assets/images/footer/favicon-miit.webp"
          alt="工信部图标"
        />
        {{ config.public.record.icp }}
      </a>

      <!-- 公安备案 -->
      <a
        v-if="config.public.record?.beian"
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=37030302001121"
        target="_blank"
        rel="noopener"
        class="footer-record"
      >
        <img
          src="https://cdn.tungchiahui.cn/tungwebsite/assets/images/footer/favicon-mps.webp"
          alt="公安备案图标"
        />
        {{ config.public.record.beian }}
      </a>
    </div>
  </footer>
</template>

<style src="~/assets/css/footer.css"></style>

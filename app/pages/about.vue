<script setup lang="ts">
import { useHead } from '#app'

useHead({
  title: '关于',
  meta: [
    {
      name: 'description',
      content: '本站 CDN 服务、访问线路与部署说明'
    }
  ]
})
</script>

<template>
  <div class="about-page">
    <header class="about-hero">
      <p class="about-kicker">About</p>
      <h1>关于</h1>
      <p>本站 CDN 服务、访问线路与部署说明。</p>
    </header>

    <section class="about-section" aria-labelledby="cdn-title">
      <h2 id="cdn-title">🌍 本站 CDN 服务</h2>

      <div class="cdn-table-wrap">
        <table class="cdn-table">
          <thead>
            <tr>
              <th>对象存储</th>
              <th>CDN</th>
              <th>链接</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CF R2</td>
              <td>CF</td>
              <td>
                <a href="https://global.cdn.tungchiahui.cn/" target="_blank" rel="noopener noreferrer">
                  global.cdn.tungchiahui.cn
                </a>
              </td>
            </tr>
            <tr>
              <td>COS</td>
              <td>EO</td>
              <td>
                <a href="https://cdn.tungchiahui.cn/" target="_blank" rel="noopener noreferrer">
                  cdn.tungchiahui.cn
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="about-section" aria-labelledby="service-title">
      <h2 id="service-title">✨ 网站服务说明</h2>

      <div class="service-list">
        <article class="service-card">
          <h3>🇨🇳 中国大陆</h3>
          <p>
            由
            <span class="provider">
              <img src="https://www.tencentcloud.com/favicon.ico" alt="" loading="lazy" decoding="async">
              腾讯云 EO Pages
            </span>
            提供服务，使用
            <span class="provider">
              <img src="https://www.tencentcloud.com/favicon.ico" alt="" loading="lazy" decoding="async">
              EdgeOne CDN
            </span>
            加速，并通过
            <span class="provider">
              <img src="https://www.tencentcloud.com/favicon.ico" alt="" loading="lazy" decoding="async">
              DNSPod
            </span>
            解析，确保访问顺畅。
          </p>
        </article>

        <article class="service-card">
          <h3>🇭🇰🇲🇴🇨🇳 中国港澳台及 🌎 国际</h3>
          <p>
            由
            <span class="provider">
              <img src="https://www.cloudflare-cn.com/favicon.ico" alt="" loading="lazy" decoding="async">
              Cloudflare Pages
            </span>
            提供服务，结合
            <span class="provider">
              <img src="https://www.cloudflare-cn.com/favicon.ico" alt="" loading="lazy" decoding="async">
              Cloudflare CDN
            </span>
            加速，线路解析同样通过
            <span class="provider">
              <img src="https://www.tencentcloud.com/favicon.ico" alt="" loading="lazy" decoding="async">
              DNSPod
            </span>
            ，实现全球访问优化。
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 920px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.about-hero {
  margin-bottom: 2rem;
}

.about-kicker {
  margin: 0 0 0.5rem;
  color: #14b8a6;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.about-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}

.about-hero p:last-child {
  max-width: 620px;
  margin: 0.85rem 0 0;
  color: var(--text-secondary);
  line-height: 1.8;
}

.about-section {
  margin-top: 2rem;
}

.about-section h2 {
  margin: 0 0 1rem;
  font-size: 1.35rem;
}

.cdn-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
}

.cdn-table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  background: var(--bg-color);
}

.cdn-table th,
.cdn-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--nav-border);
  text-align: left;
}

.cdn-table th {
  background: var(--bg-secondary);
  color: var(--text-main);
  font-weight: 800;
}

.cdn-table tr:last-child td {
  border-bottom: 0;
}

.cdn-table a {
  color: #0f9f7f;
  font-weight: 700;
  text-decoration: none;
}

.cdn-table a:hover {
  text-decoration: underline;
}

.service-list {
  display: grid;
  gap: 1rem;
}

.service-card {
  padding: 1.1rem 1.2rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.service-card h3 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.service-card p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.9;
}

.provider {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-main);
  font-weight: 800;
  white-space: nowrap;
}

.provider img {
  width: 1em;
  height: 1em;
  border-radius: 3px;
}

@media (max-width: 640px) {
  .about-page {
    padding-inline: 0.75rem;
  }

  .service-card {
    padding: 1rem;
  }
}
</style>

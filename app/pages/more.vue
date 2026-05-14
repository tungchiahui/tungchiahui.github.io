<script setup lang="ts">
import { useHead } from '#app'

useHead({
  title: '更多页面',
  meta: [
    {
      name: 'description',
      content: '站内重要页面入口，包括数据统计、友链、技术足迹、简历与导航页。'
    }
  ]
})
</script>

<template>
  <div class="more-wrap">
    <h1>更多页面</h1>
    <p class="more-desc">这里收集站内的重要页面，方便快速访问。</p>

    <!-- 数据分析类 -->
    <div class="more-category">
      <h2 class="category-title">数据分析</h2>
      <div class="more-grid">

        <!-- 数据统计 -->
        <NuxtLink class="more-card" to="/stats">
          <div class="card-title">
            <i class="fas fa-chart-bar" aria-hidden="true"></i>
            <span>数据统计</span>
          </div>
          <div class="card-sub">网站数据分析与统计页面</div>
        </NuxtLink>

        <!-- Umami -->
        <a class="more-card" href="https://umami.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-globe" aria-hidden="true"></i>
            <span>Umami</span>
          </div>
          <div class="card-sub">网站访问统计平台</div>
        </a>

      </div>
    </div>

    <!-- 加速服务 -->
    <div class="more-category">
      <h2 class="category-title">加速服务</h2>
      <div class="more-grid">

        <!-- 中国大陆CDN -->
        <a class="more-card" href="https://cdn.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-server" aria-hidden="true"></i>
            <span>中国大陆 CDN</span>
          </div>
          <div class="card-sub">内容分发网络(Content Delivery Network,CDN)</div>
        </a>

        <!-- 国际CDN -->
        <a class="more-card" href="https://global.cdn.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-network-wired" aria-hidden="true"></i>
            <span>国际 CDN</span>
          </div>
          <div class="card-sub">内容分发网络(Content Delivery Network,CDN)</div>
        </a>

      </div>
    </div>

    <!-- 其他 -->
    <div class="more-category">
      <h2 class="category-title">其他</h2>
      <div class="more-grid">

        <!-- 友情链接 -->
        <NuxtLink class="more-card" to="/friend">
          <div class="card-title">
            <i class="fas fa-handshake" aria-hidden="true"></i>
            <span>友情链接</span>
          </div>
          <div class="card-sub">汇聚优质网站、社区和团队</div>
        </NuxtLink>
        
        <!-- 技术路线 -->
        <NuxtLink class="more-card" to="/tech-footprint">
          <div class="card-title">
            <i class="fas fa-tools" aria-hidden="true"></i>
            <span>技术足迹</span>
          </div>
          <div class="card-sub">个人机器人技术路线清单</div>
        </NuxtLink>

        <!-- 简历 -->
        <NuxtLink class="more-card" to="/cv">
          <div class="card-title">
            <i class="fas fa-file-alt" aria-hidden="true"></i>
            <span>简历</span>
          </div>
          <div class="card-sub">个人简历</div>
        </NuxtLink>

        <!-- 导航页 -->
        <NuxtLink class="more-card" to="/start">
          <div class="card-title">
            <i class="fas fa-compass" aria-hidden="true"></i>
            <span>导航页</span>
          </div>
          <div class="card-sub">导航页</div>
        </NuxtLink>

        <!-- LOGO介绍 -->
        <NuxtLink class="more-card" to="/mylogo">
          <div class="card-title">
            <i class="fas fa-shapes" aria-hidden="true"></i>
            <span>个人 LOGO</span>
          </div>
          <div class="card-sub">LOGO介绍</div>
        </NuxtLink>

        <!-- CHAT -->
        <a class="more-card" href="https://chat.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-comments" aria-hidden="true"></i>
            <span>CHAT</span>
          </div>
          <div class="card-sub"> 自建的类ChatGPT网站 </div>
        </a>

      </div>
    </div>


  </div>
</template>

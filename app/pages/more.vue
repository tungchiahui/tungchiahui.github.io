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
          <div class="card-title">📊 数据统计</div>
          <div class="card-sub">网站数据分析与统计页面</div>
        </NuxtLink>

        <!-- Umami -->
        <a class="more-card" href="https://umami.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">🌐 Umami</div>
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
          <div class="card-title">🇨🇳中国大陆CDN</div>
          <div class="card-sub">内容分发网络(Content Delivery Network,CDN)</div>
        </a>

        <!-- 国际CDN -->
        <a class="more-card" href="https://global.cdn.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">🇺🇳国际CDN</div>
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
          <div class="card-title">🤝 友情链接</div>
          <div class="card-sub">汇聚优质网站、社区和团队</div>
        </NuxtLink>

      </div>
    </div>


  </div>
</template>

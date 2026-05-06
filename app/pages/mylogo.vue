<script setup lang="ts">
import { useHead } from '#app'

const logoUrl = 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/logo.png'

useHead({
  title: '个人 LOGO - Tung Chia-hui',
  meta: [
    {
      name: 'description',
      content: 'Tung Chia-hui 个人 LOGO 介绍：以 T / C / H 为核心的绿色几何个人标识。'
    }
  ]
})
</script>

<template>
  <div class="mylogo-page">
    <nav class="logo-top-nav" aria-label="页面导航">
      <NuxtLink to="/more" class="logo-back-link">← 返回更多页面</NuxtLink>
    </nav>

    <header class="logo-hero">
      <div class="logo-visual-panel">
        <div class="logo-image-shell">
          <img
            class="logo-image"
            :src="logoUrl"
            alt="Tung Chia-hui 个人 LOGO"
            width="220"
            height="220"
            decoding="async"
          />
        </div>
        <div class="logo-identity">
          <span class="identity-label">Personal Mark</span>
          <strong>T / C / H</strong>
        </div>
      </div>

      <div class="logo-hero-copy">
        <p class="logo-kicker">Tung Chia-hui 的个人标识</p>
        <h1>个人 LOGO</h1>
        <p class="logo-summary">
          一个把名字、机器人方向和工程气质压缩在一起的绿色几何符号。
        </p>
      </div>
    </header>

    <main class="logo-content">
      <section class="logo-section">
        <h2>字母结构</h2>
        <p>
          这个 Logo 以我的名字 Tung Chia-hui 的首字母 T / C / H 为核心，将三个字母融合进一个类似立方体的几何结构中。它不只是一个简单的姓名缩写，而是一个带有工程感和系统感的个人标识：中间向上的 T 像一条主轴，代表技术方向、持续成长和向上探索；左侧的 C 像一个开放的结构框架，象征连接、协作与对外部世界的感知；右侧的 H 则像稳定的支撑模块，代表硬件、系统架构与工程实现能力。
        </p>
      </section>

      <section class="logo-key-grid" aria-label="LOGO 字母含义">
        <article class="logo-key-card">
          <span class="key-letter">T</span>
          <h3>技术主轴</h3>
          <p>向上的结构感，代表技术方向、持续成长和向上探索。</p>
        </article>

        <article class="logo-key-card">
          <span class="key-letter">C</span>
          <h3>开放框架</h3>
          <p>开放而有连接性的轮廓，象征协作与对外部世界的感知。</p>
        </article>

        <article class="logo-key-card">
          <span class="key-letter">H</span>
          <h3>工程支撑</h3>
          <p>稳定的支撑模块，代表硬件、系统架构与工程实现能力。</p>
        </article>
      </section>

      <section class="logo-section">
        <h2>绿色含义</h2>
        <p>
          绿色是这个 Logo 的主色。相比冷硬的工业色彩，绿色更强调成长、生命力与持续迭代。机器人并不只是机械、代码和电路的组合，它也承载着对现实世界的感知、行动与反馈。对我来说，绿色代表一种不断调试、不断优化、不断向前推进的状态：从一块开发板、一段驱动程序、一个节点，到一台能够自主运动的机器人，技术在一次次实践中逐渐生长。
        </p>
      </section>

      <section class="logo-section logo-attitude-section">
        <h2>技术态度</h2>
        <p>
          因此，这个 Logo 是我的个人符号，也是我的技术态度。它代表我对机器人系统的理解：既关注底层硬件，也重视上层软件；既追求工程实现，也保留创造力和探索欲。它将我的名字、技术方向和个人气质压缩进一个简洁的几何标识里，象征着我希望持续构建更完整、更可靠、更智能的机器人系统。
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.mylogo-page {
  width: min(1040px, 100%);
  margin: 0 auto;
  padding: 30px 20px 56px;
  color: var(--text-main, #1f1f1f);
}

.logo-top-nav {
  margin-bottom: 28px;
}

.logo-back-link {
  display: inline-flex;
  align-items: center;
  color: #00a878;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.logo-back-link:hover {
  opacity: 0.78;
}

.logo-hero {
  display: grid;
  grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1fr);
  gap: 34px;
  align-items: center;
  margin-bottom: 42px;
  padding: 34px;
  border: 1px solid rgba(0, 197, 142, 0.2);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(0, 197, 142, 0.08), rgba(59, 130, 246, 0.06)),
    var(--bg-secondary, #f7f7f8);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.logo-visual-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  min-height: 330px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 197, 142, 0.16);
}

.logo-image-shell {
  display: grid;
  place-items: center;
  width: clamp(178px, 24vw, 240px);
  aspect-ratio: 1;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 20px 42px rgba(0, 197, 142, 0.18),
    0 8px 18px rgba(15, 23, 42, 0.08);
}

.logo-image {
  display: block;
  width: 72%;
  height: 72%;
  object-fit: contain;
}

.logo-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.identity-label {
  color: var(--text-secondary, #666666);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.logo-identity strong {
  color: #00a878;
  font-size: 1.35rem;
}

.logo-hero-copy {
  min-width: 0;
}

.logo-kicker {
  margin: 0 0 12px;
  color: #00a878;
  font-size: 0.95rem;
  font-weight: 800;
}

.logo-hero h1 {
  margin: 0;
  font-size: clamp(2.15rem, 6vw, 4.2rem);
  line-height: 1.08;
}

.logo-summary {
  max-width: 620px;
  margin: 20px 0 0;
  color: var(--text-secondary, #666666);
  font-size: 1.12rem;
  line-height: 1.75;
}

.logo-content {
  display: grid;
  gap: 26px;
}

.logo-section {
  padding: 30px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-color, #ffffff);
}

.logo-section h2 {
  margin: 0 0 16px;
  color: var(--text-main, #1f1f1f);
  font-size: 1.55rem;
}

.logo-section p {
  margin: 0;
  color: var(--text-secondary, #666666);
  font-size: 1.02rem;
  line-height: 1.95;
  text-align: justify;
}

.logo-key-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.logo-key-card {
  padding: 24px;
  border: 1px solid rgba(0, 197, 142, 0.18);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(0, 197, 142, 0.07), rgba(0, 197, 142, 0.02));
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.logo-key-card:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 197, 142, 0.38);
  box-shadow: 0 12px 28px rgba(0, 197, 142, 0.12);
}

.key-letter {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 12px;
  background: #00a878;
  color: #ffffff;
  font-size: 1.45rem;
  font-weight: 900;
}

.logo-key-card h3 {
  margin: 0 0 10px;
  color: var(--text-main, #1f1f1f);
  font-size: 1.12rem;
}

.logo-key-card p {
  margin: 0;
  color: var(--text-secondary, #666666);
  line-height: 1.7;
}

.logo-attitude-section {
  border-color: rgba(0, 197, 142, 0.28);
  background: linear-gradient(135deg, rgba(0, 197, 142, 0.08), rgba(59, 130, 246, 0.05));
}

:global(html.dark) .logo-back-link,
:global(html.dark) .logo-kicker,
:global(html.dark) .logo-identity strong {
  color: #34d399;
}

:global(html.dark) .identity-label {
  color: #d1fae5;
}

:global(html.dark) .logo-hero {
  border-color: rgba(52, 211, 153, 0.26);
  background:
    linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(96, 165, 250, 0.09)),
    var(--bg-secondary, #1e293b);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
}

:global(html.dark) .logo-visual-panel {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(52, 211, 153, 0.22);
}

:global(html.dark) .logo-image-shell {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(52, 211, 153, 0.24);
  box-shadow:
    0 20px 46px rgba(16, 185, 129, 0.22),
    0 10px 24px rgba(0, 0, 0, 0.18);
}

:global(html.dark) .logo-section {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--nav-border, #334155);
}

:global(html.dark) .logo-key-card {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(96, 165, 250, 0.05));
  border-color: rgba(52, 211, 153, 0.22);
}

:global(html.dark) .logo-key-card:hover {
  border-color: rgba(52, 211, 153, 0.45);
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.16);
}

:global(html.dark) .key-letter {
  background: #34d399;
  color: #0f172a;
}

:global(html.dark) .logo-attitude-section {
  border-color: rgba(52, 211, 153, 0.32);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(96, 165, 250, 0.08));
}

@media (max-width: 820px) {
  .mylogo-page {
    padding: 22px 12px 42px;
  }

  .logo-hero {
    grid-template-columns: 1fr;
    gap: 26px;
    padding: 24px;
  }

  .logo-visual-panel {
    min-height: 280px;
  }

  .logo-key-grid {
    grid-template-columns: 1fr;
  }

  .logo-section {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .logo-hero {
    padding: 18px;
    border-radius: 14px;
  }

  .logo-visual-panel {
    min-height: 240px;
  }

  .logo-section {
    padding: 20px;
  }

  .logo-section p {
    text-align: left;
  }

  .logo-summary {
    font-size: 1rem;
  }
}
</style>

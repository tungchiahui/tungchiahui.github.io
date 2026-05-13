<script setup lang="ts">
import { useHead } from '#app'

const portraitUrl = 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/tungchiahui.webp'

useHead({
  title: '关于 - Tung Chia-hui',
  meta: [
    {
      name: 'description',
      content: '关于董佳辉、机器人学习方向、个人网站内容与部署服务说明。'
    }
  ]
})

const highlights = [
  { value: 'SLAM', label: '主要研究与项目方向' },
  { value: 'ROS2', label: '机器人系统平台' },
  { value: 'STM32', label: '嵌入式控制基础' },
  { value: 'Nuxt', label: '本站构建框架' }
] as const

const focusAreas = [
  {
    title: '移动机器人',
    description:
      '围绕四轮麦克纳姆 AMR 做底盘控制、里程计融合、SLAM 建图、AMCL 定位与 NAV2 路径规划。',
    tags: ['AMR', 'Mecanum', 'NAV2', 'AMCL']
  },
  {
    title: '三维建图与感知',
    description:
      '把 3D 建图、2D 导航、激光雷达、IMU、相机和 YOLO 识别串成一个能落地调试的机器人系统。',
    tags: ['3D Mapping', 'LiDAR', 'YOLO', 'OpenCV']
  },
  {
    title: '机械臂与操作',
    description:
      '继续学习 MoveIt2、机器人运动学与 ROS2 control，目标是让移动底盘、机械臂和视觉任务协同工作。',
    tags: ['MoveIt2', 'Kinematics', 'ROS2 Control']
  },
  {
    title: '嵌入式与实时控制',
    description:
      '保留并深化 STM32、FreeRTOS、CAN、PID、电机控制和传感器调试能力，让上层算法真正接得住硬件。',
    tags: ['STM32', 'FreeRTOS', 'CAN', 'PID']
  }
] as const

const projectRoadmap = [
  {
    step: '01',
    title: '四轮麦克纳姆 AMR 底盘',
    description: '完成全向运动解算、底盘闭环控制、轮式里程计、IMU 与激光雷达数据接入。'
  },
  {
    step: '02',
    title: 'ROS2 导航与建图系统',
    description: '围绕 SLAM、AMCL、NAV2、TF 坐标变换和 RViz2 调试建立一套可复用导航流程。'
  },
  {
    step: '03',
    title: '3D 建图与视觉识别',
    description: '引入三维点云建图与 YOLO 目标识别，让机器人不仅能走，还能理解环境中的对象。'
  },
  {
    step: '04',
    title: 'MoveIt2 机械臂联动',
    description: '把移动平台、机械臂规划和视觉感知组合起来，形成面向真实任务的移动操作系统。'
  }
] as const

const contentChannels = [
  {
    title: '博客',
    description: '记录项目复盘、折腾日志、工具经验和阶段性想法。',
    to: '/blog',
    label: '进入博客'
  },
  {
    title: 'Wiki',
    description: '沉淀 ROS2、Linux、STM32、FreeRTOS、C/C++、OpenCV、YOLO 等系统化笔记。',
    to: '/wiki',
    label: '进入 Wiki'
  },
  {
    title: '技术足迹',
    description: '追踪技术栈、长期目标、阶段任务和学习路线。',
    to: '/tech-footprint',
    label: '查看足迹'
  }
] as const

const siteServices = [
  {
    region: '中国大陆',
    stack: '腾讯云 EO Pages / EdgeOne CDN / DNSPod',
    description: '面向大陆访问做线路解析与静态页面加速，尽量减少跨区域访问带来的等待。'
  },
  {
    region: '港澳台及国际',
    stack: 'Cloudflare Pages / Cloudflare CDN / DNSPod',
    description: '使用 Cloudflare 的静态托管与全球 CDN，让海外访问保持稳定。'
  }
] as const

const cdnNodes = [
  {
    storage: 'CF R2',
    cdn: 'Cloudflare',
    host: 'global.cdn.tungchiahui.cn',
    href: 'https://global.cdn.tungchiahui.cn/'
  },
  {
    storage: 'COS',
    cdn: 'EdgeOne',
    host: 'cdn.tungchiahui.cn',
    href: 'https://cdn.tungchiahui.cn/'
  }
] as const

const contacts = [
  { label: 'Email', value: 'tungchiahui@gmail.com', href: 'mailto:tungchiahui@gmail.com' },
  { label: 'GitHub', value: 'tungchiahui', href: 'https://github.com/tungchiahui' },
  { label: 'QQ', value: '2225279276', href: null },
  { label: 'WeChat', value: 'tungchiahui', href: null }
] as const
</script>

<template>
  <main class="about-page">
    <section class="about-hero" aria-labelledby="about-title">
      <div class="hero-copy">
        <p class="about-kicker">About Tung Chia-hui</p>
        <h1 id="about-title">关于我和这个站点</h1>
        <p class="hero-lead">
          我是董佳辉(Tung Chia-hui) 。
          现在主要关注 SLAM、ROS2 自主导航、三维建图、机器人感知与移动操作系统，也持续保留 STM32、RTOS、CAN 与底盘控制这些贴近硬件的能力。
        </p>

        <div class="hero-actions">
          <NuxtLink class="about-button primary" to="/cv">查看简历</NuxtLink>
          <NuxtLink class="about-button secondary" to="/tech-footprint">技术足迹</NuxtLink>
        </div>
      </div>

      <figure class="portrait-panel">
        <img :src="portraitUrl" alt="董佳辉 Tung Chia-hui" loading="eager" decoding="async">
        <figcaption>
          <strong>Robot systems learner</strong>
          <span>SLAM / ROS2 / Embedded Control</span>
        </figcaption>
      </figure>
    </section>

    <section class="highlight-grid" aria-label="个人关键词">
      <div v-for="item in highlights" :key="item.label" class="highlight-item">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </section>

    <section class="about-section">
      <div class="section-head">
        <p class="section-kicker">Focus</p>
        <h2>现在重点关注的方向</h2>
        <p>
          我希望把“能跑的机器人系统”作为主线：不是只做某个孤立模块，而是让建图、导航、识别、控制和硬件调试真正连起来。
        </p>
      </div>

      <div class="focus-grid">
        <article v-for="area in focusAreas" :key="area.title" class="focus-card">
          <h3>{{ area.title }}</h3>
          <p>{{ area.description }}</p>
          <div class="tag-list">
            <span v-for="tag in area.tags" :key="tag">{{ tag }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="about-section roadmap-section">
      <div class="section-head compact">
        <p class="section-kicker">Project Line</p>
        <h2>接下来想做成的机器人项目</h2>
      </div>

      <div class="roadmap-list">
        <article v-for="item in projectRoadmap" :key="item.step" class="roadmap-item">
          <span class="roadmap-step">{{ item.step }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="about-section content-section">
      <div class="section-head">
        <p class="section-kicker">Content</p>
        <h2>这个网站会放什么</h2>
        <p>
          这里既是技术笔记库，也是项目日志和个人成长记录。内容会偏工程实践，尽量把踩坑、配置、复盘和路线都写清楚。
        </p>
      </div>

      <div class="channel-grid">
        <NuxtLink v-for="channel in contentChannels" :key="channel.title" class="channel-card" :to="channel.to">
          <span>{{ channel.title }}</span>
          <p>{{ channel.description }}</p>
          <strong>{{ channel.label }}</strong>
        </NuxtLink>
      </div>
    </section>

    <section class="about-section site-section">
      <div class="section-head">
        <p class="section-kicker">Site</p>
        <h2>站点服务与访问线路</h2>
        <p>
          本站是纯静态 Nuxt 站点，目标是能部署到 Pages 类平台，内容和页面尽量靠预渲染完成，减少服务器依赖。
        </p>
      </div>

      <div class="service-grid">
        <article v-for="service in siteServices" :key="service.region" class="service-card">
          <h3>{{ service.region }}</h3>
          <strong>{{ service.stack }}</strong>
          <p>{{ service.description }}</p>
        </article>
      </div>

      <div class="cdn-table-wrap">
        <table class="cdn-table">
          <thead>
            <tr>
              <th>对象存储</th>
              <th>CDN</th>
              <th>访问域名</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="node in cdnNodes" :key="node.host">
              <td>{{ node.storage }}</td>
              <td>{{ node.cdn }}</td>
              <td>
                <a :href="node.href" target="_blank" rel="noopener noreferrer">
                  {{ node.host }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="about-section contact-section">
      <div class="section-head compact">
        <p class="section-kicker">Contact</p>
        <h2>联系与交流</h2>
      </div>

      <div class="contact-grid">
        <component
          :is="item.href ? 'a' : 'div'"
          v-for="item in contacts"
          :key="item.label"
          class="contact-card"
          :href="item.href || undefined"
          :target="item.href ? '_blank' : undefined"
          :rel="item.href ? 'noopener noreferrer' : undefined"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </component>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-page {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  color: var(--text-main);
}

.about-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
  gap: 2rem;
  align-items: stretch;
  padding: 2rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.1), transparent 38%),
    linear-gradient(315deg, rgba(180, 83, 9, 0.08), transparent 34%),
    var(--bg-secondary);
}

.hero-copy {
  min-width: 0;
}

.about-kicker,
.section-kicker {
  margin: 0 0 0.65rem;
  color: #0f766e;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.about-hero h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(2.45rem, 6vw, 4.5rem);
  line-height: 1.04;
  letter-spacing: 0;
}

.hero-lead {
  max-width: 760px;
  margin: 1.25rem 0 0;
  color: var(--text-secondary);
  font-size: 1.04rem;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  min-width: 0;
  margin-top: 2rem;
}

.about-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  min-height: 2.7rem;
  padding: 0 1.1rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 850;
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.about-button:hover {
  transform: translateY(-1px);
}

.about-button.primary {
  background: #0f766e;
  color: #fff;
}

.about-button.secondary {
  border-color: #b45309;
  color: #92400e;
}

.portrait-panel {
  display: grid;
  grid-template-rows: minmax(320px, 1fr) auto;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 8px;
  background: var(--bg-color);
}

.portrait-panel img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.portrait-panel figcaption {
  display: grid;
  gap: 0.25rem;
  padding: 1rem;
  border-top: 1px solid var(--nav-border);
}

.portrait-panel strong {
  font-size: 1rem;
}

.portrait-panel span {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  margin: 1rem 0;
}

.highlight-item {
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-color);
}

.highlight-item strong {
  display: block;
  color: #0f766e;
  font-size: 1.45rem;
  line-height: 1.15;
}

.highlight-item span {
  display: block;
  margin-top: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.45;
}

.about-section {
  margin-top: 2.2rem;
}

.section-head {
  max-width: 780px;
  margin-bottom: 1.2rem;
}

.section-head.compact {
  margin-bottom: 1rem;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  line-height: 1.2;
}

.section-head p:last-child {
  margin: 0.75rem 0 0;
  color: var(--text-secondary);
  line-height: 1.85;
}

.focus-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.focus-card,
.service-card,
.channel-card,
.contact-card,
.roadmap-item {
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.focus-card {
  padding: 1.15rem;
}

.focus-card h3,
.service-card h3,
.roadmap-item h3 {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.45;
}

.focus-card p,
.service-card p,
.roadmap-item p,
.channel-card p {
  margin: 0.65rem 0 0;
  color: var(--text-secondary);
  line-height: 1.75;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.9rem;
}

.tag-list span {
  display: inline-flex;
  align-items: center;
  min-height: 1.85rem;
  padding: 0 0.62rem;
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: var(--text-main);
  font-size: 0.82rem;
  font-weight: 750;
}

.roadmap-list {
  display: grid;
  gap: 0.8rem;
}

.roadmap-item {
  display: grid;
  grid-template-columns: 4.1rem minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  padding: 1.05rem;
}

.roadmap-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  aspect-ratio: 1;
  border-radius: 8px;
  background: #0f766e;
  color: #fff;
  font-weight: 900;
}

.channel-grid,
.service-grid,
.contact-grid {
  display: grid;
  gap: 0.9rem;
}

.channel-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.service-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.contact-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.channel-card,
.contact-card {
  color: inherit;
  text-decoration: none;
}

.channel-card {
  display: grid;
  align-content: start;
  min-height: 12rem;
  padding: 1.1rem;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.channel-card:hover,
a.contact-card:hover {
  transform: translateY(-2px);
  border-color: rgba(15, 118, 110, 0.42);
}

.channel-card span,
.contact-card span {
  color: #0f766e;
  font-weight: 900;
}

.channel-card strong {
  margin-top: auto;
  padding-top: 1rem;
  color: #92400e;
}

.service-card {
  padding: 1.1rem;
}

.service-card strong {
  display: block;
  margin-top: 0.55rem;
  color: #92400e;
  line-height: 1.6;
}

.cdn-table-wrap {
  margin-top: 0.9rem;
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
  font-weight: 850;
}

.cdn-table tr:last-child td {
  border-bottom: 0;
}

.cdn-table a {
  color: #0f766e;
  font-weight: 800;
  text-decoration: none;
}

.cdn-table a:hover {
  text-decoration: underline;
}

.contact-card {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
  padding: 1rem;
}

.contact-card strong {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 0.98rem;
}

@media (max-width: 920px) {
  .about-hero,
  .focus-grid,
  .channel-grid,
  .service-grid {
    grid-template-columns: 1fr;
  }

  .portrait-panel {
    order: -1;
    grid-template-rows: auto auto;
  }

  .portrait-panel img {
    max-height: 420px;
  }

  .highlight-grid,
  .contact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .channel-card {
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .about-page {
    padding: 1rem 0.25rem 3rem;
  }

  .about-hero,
  .focus-card,
  .service-card,
  .channel-card,
  .contact-card,
  .roadmap-item {
    padding: 1rem;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .about-button {
    width: 100%;
  }

  .highlight-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .roadmap-item {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
html.dark .about-page .about-hero {
  background:
    linear-gradient(135deg, rgba(45, 212, 191, 0.09), transparent 38%),
    linear-gradient(315deg, rgba(251, 191, 36, 0.09), transparent 34%),
    var(--bg-secondary);
}

html.dark .about-page .about-kicker,
html.dark .about-page .section-kicker,
html.dark .about-page .highlight-item strong,
html.dark .about-page .channel-card span,
html.dark .about-page .contact-card span,
html.dark .about-page .cdn-table a {
  color: #5eead4;
}

html.dark .about-page .about-button.secondary,
html.dark .about-page .channel-card strong,
html.dark .about-page .service-card strong {
  color: #fbbf24;
}

html.dark .about-page .about-button.secondary {
  border-color: #f59e0b;
}

html.dark .about-page .tag-list span {
  border-color: rgba(94, 234, 212, 0.22);
  background: rgba(94, 234, 212, 0.08);
}
</style>

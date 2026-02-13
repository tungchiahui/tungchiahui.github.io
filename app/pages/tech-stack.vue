<script setup lang="ts">
import { useHead } from '#app'

useHead({
  title: '技术栈 - Tung Chia-hui',
  meta: [
    { name: 'description', content: '我的技术能力图谱与学习路线' }
  ]
})

// 定义熟练度类型
type SkillLevel = 'expert' | 'intermediate' | 'learning'

// 技术栈数据结构
interface Skill {
  name: string
  level: SkillLevel
  logo: string
}

interface TechStack {
  category: string
  icon: string
  description: string
  skills: Skill[]
}

const techStacks: TechStack[] = [
  {
    category: '编程语言',
    icon: '💻',
    description: '日常开发使用的编程语言',
    skills: [
      { name: 'C', level: 'expert', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
      { name: 'C++', level: 'expert', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
      { name: 'Python', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { name: 'JavaScript', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { name: 'Rust', level: 'learning', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg' }
    ]
  },
  {
    category: '前端开发',
    icon: '🎨',
    description: 'Web 界面设计与开发',
    skills: [
      { name: 'Vue.js', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
      { name: 'CSS3', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { name: 'HTML5', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { name: 'Nuxt.js', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg' }
    ]
  },
  {
    category: '嵌入式开发',
    icon: '🔌',
    description: '单片机与实时操作系统',
    skills: [
      { name: 'STM32', level: 'expert', logo: 'https://www.st.com.cn/content/dam/st-crew/st-logo-blue.svg' },
      { name: 'FreeRTOS', level: 'expert', logo: 'https://www.freertos.org/media/2023/logo.png' }
    ]
  },
  {
    category: '机器人与视觉',
    icon: '🤖',
    description: '机器人操作系统与计算机视觉',
    skills: [
      { name: 'ROS2', level: 'intermediate', logo: 'https://roboticsbackend.com/wp-content/uploads/2022/04/ros_logo.png' },
      { name: 'OpenCV', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg' }
    ]
  },
  {
    category: '应用开发',
    icon: '📱',
    description: '桌面与移动应用开发框架',
    skills: [
      { name: 'Qt6', level: 'intermediate', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/qt/qt-original.svg' },
      { name: 'Flutter', level: 'learning', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg' }
    ]
  },
  {
    category: '系统与工具',
    icon: '🛠️',
    description: '开发环境与工具链',
    skills: [
      { name: 'Linux', level: 'expert', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' },
      { name: 'Markdown', level: 'expert', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg' },
      { name: '立创EDA', level: 'intermediate', logo: 'https://image.lceda.cn/avatars/2022/5/hHXK4NNkCdJZmyW59sl0XiBLLiQSzGVswv4SWW6w.png' }
    ]
  }
]

// 熟练度配置
const levelConfig: Record<SkillLevel, { label: string; color: string }> = {
  expert: { label: '日常使用', color: '#00c58e' },
  intermediate: { label: '能做开发', color: '#3b82f6' },
  learning: { label: '规划学习', color: '#a855f7' }
}
</script>

<template>
  <div class="tech-stack-page">
    <!-- 顶部导航 -->
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">← 返回首页</NuxtLink>
    </nav>

    <!-- 页面标题 -->
    <header class="page-header">
      <h1 class="main-title">🚀 技术能力图谱</h1>
      <p class="subtitle">持续学习，不断进步</p>
    </header>

    <!-- 熟练度说明 -->
    <div class="level-legend">
      <div class="legend-item" v-for="(config, key) in levelConfig" :key="key">
        <span class="legend-dot" :style="{ backgroundColor: config.color }"></span>
        <span class="legend-label">{{ config.label }}</span>
      </div>
    </div>

    <!-- 技术栈分类展示 -->
    <div class="tech-categories">
      <section 
        v-for="stack in techStacks" 
        :key="stack.category" 
        class="category-section"
      >
        <div class="category-header">
          <span class="category-icon">{{ stack.icon }}</span>
          <h2 class="category-title">{{ stack.category }}</h2>
        </div>
        <p class="category-desc">{{ stack.description }}</p>
        
        <div class="skills-grid">
          <div 
            v-for="skill in stack.skills" 
            :key="skill.name" 
            class="skill-card"
          >
            <div class="skill-content">
              <img 
                :src="skill.logo" 
                :alt="skill.name" 
                class="skill-logo"
                loading="lazy"
              />
              <div class="skill-info">
                <span class="skill-name">{{ skill.name }}</span>
                <span 
                  class="skill-badge" 
                  :style="{ backgroundColor: levelConfig[skill.level].color }"
                >
                  {{ levelConfig[skill.level].label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 学习路线 -->
    <section class="learning-roadmap">
      <h2 class="roadmap-title">📚 持续学习计划</h2>
      <div class="roadmap-content">
        <div class="roadmap-item">
          <div class="roadmap-stage">当前阶段</div>
          <div class="roadmap-text">
            深化嵌入式开发经验，提升 ROS2 机器人开发能力，完善前端技术栈
          </div>
        </div>
        <div class="roadmap-arrow">→</div>
        <div class="roadmap-item">
          <div class="roadmap-stage">下一步</div>
          <div class="roadmap-text">
            学习 Rust 系统编程，掌握 Flutter 跨平台开发
          </div>
        </div>
        <div class="roadmap-arrow">→</div>
        <div class="roadmap-item">
          <div class="roadmap-stage">长远目标</div>
          <div class="roadmap-text">
            构建完整的全栈开发能力，在嵌入式与机器人领域深耕
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style src="~/assets/css/tech-stack.css" scoped></style>

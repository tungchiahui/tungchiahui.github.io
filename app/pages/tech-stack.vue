<script setup lang="ts">
import { useHead } from '#app'
import { techStacks, levelConfig, weeklyPlans, priorityConfig, longTermGoals, goalStatusConfig } from '~/data/techstack.js'
import { computed, ref } from 'vue'

useHead({
  title: '技术栈 - Tung Chia-hui',
  meta: [
    { name: 'description', content: '我的技术能力图谱与学习路线' }
  ]
})

// 定义熟练度类型
type SkillLevel = 'expert' | 'intermediate' | 'learning'

// 当前选中的视图 tab
const activeTab = ref<'current' | 'history' | 'all'>('current')

// 当前周标识（根据数据文件中的最新周次）
const currentWeek = '2026-W07'

// 按视图过滤计划
const filteredPlans = computed(() => {
  if (activeTab.value === 'current') {
    // 本周任务
    return weeklyPlans.filter(p => p.week === currentWeek)
  } else if (activeTab.value === 'history') {
    // 历史记录（本周之前的）
    return weeklyPlans.filter(p => p.week !== currentWeek)
  } else {
    // 全部任务
    return weeklyPlans
  }
})

// 按周分组（用于历史记录视图）
const plansByWeek = computed(() => {
  const groups: Record<string, any[]> = {}
  filteredPlans.value.forEach(plan => {
    if (!groups[plan.week]) {
      groups[plan.week] = []
    }
    groups[plan.week].push(plan)
  })
  return groups
})

// 计算完成状态统计（仅针对当前视图）
const planStats = computed(() => {
  const plans = filteredPlans.value
  const total = plans.length
  const completed = plans.filter(p => p.completed).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, percentage }
})

// 按优先级排序计划
const sortedPlans = computed(() => {
  const priorityOrder = { high: 1, medium: 2, low: 3 }
  return [...filteredPlans.value].sort((a, b) => {
    // 先按完成状态排序（未完成的在前）
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // 再按优先级排序
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})
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

    <!-- 长期目标 -->
    <section class="long-term-goals">
      <h2 class="goals-title">🎯 长期目标</h2>
      <div class="goals-grid">
        <div 
          v-for="goal in longTermGoals" 
          :key="goal.id" 
          class="goal-card"
          :class="'status-' + goal.status"
        >
          <div class="goal-header">
            <span class="goal-period">{{ goal.period }}</span>
            <span 
              class="goal-status" 
              :style="{ color: goalStatusConfig[goal.status].color }"
            >
              {{ goalStatusConfig[goal.status].icon }} {{ goalStatusConfig[goal.status].label }}
            </span>
          </div>
          <h3 class="goal-title">{{ goal.title }}</h3>
          <ul class="goal-list">
            <li v-for="(item, index) in goal.goals" :key="index">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 任务管理 -->
    <section class="task-management">
      <div class="task-header">
        <h2 class="task-title">📋 任务管理</h2>
        
        <!-- Tab 切换 -->
        <div class="task-tabs">
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'current' }"
            @click="activeTab = 'current'"
          >
            本周任务
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            历史记录
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            全部任务
          </button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="task-stats">
        <span class="stat-item">
          总计 <strong>{{ planStats.total }}</strong> 项
        </span>
        <span class="stat-divider">•</span>
        <span class="stat-item">
          已完成 <strong class="completed-count">{{ planStats.completed }}</strong> 项
        </span>
        <span class="stat-divider">•</span>
        <span class="stat-item">
          完成率 <strong class="percentage">{{ planStats.percentage }}%</strong>
        </span>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar-wrapper">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: planStats.percentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- 任务列表 - 本周/全部视图 -->
      <div v-if="activeTab === 'current' || activeTab === 'all'" class="plans-grid">
        <div 
          v-for="plan in sortedPlans" 
          :key="plan.id" 
          class="plan-card"
          :class="{ 'completed': plan.completed }"
        >
          <div class="plan-header">
            <div class="plan-checkbox">
              <span v-if="plan.completed" class="check-icon">✓</span>
            </div>
            <div class="plan-priority" :style="{ color: priorityConfig[plan.priority].color }">
              {{ priorityConfig[plan.priority].icon }}
            </div>
          </div>
          
          <div class="plan-content">
            <h3 class="plan-title" :class="{ 'line-through': plan.completed }">
              {{ plan.title }}
            </h3>
            <p class="plan-description">{{ plan.description }}</p>
            
            <div class="plan-meta">
              <span class="plan-category">{{ plan.category }}</span>
              <span class="plan-date">📆 {{ plan.dueDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务列表 - 历史记录视图（按周分组） -->
      <div v-if="activeTab === 'history'" class="history-view">
        <div 
          v-for="(plans, week) in plansByWeek" 
          :key="week"
          class="week-group"
        >
          <h3 class="week-title">{{ plans[0].weekLabel }}</h3>
          <div class="plans-grid">
            <div 
              v-for="plan in plans" 
              :key="plan.id" 
              class="plan-card"
              :class="{ 'completed': plan.completed }"
            >
              <div class="plan-header">
                <div class="plan-checkbox">
                  <span v-if="plan.completed" class="check-icon">✓</span>
                </div>
                <div class="plan-priority" :style="{ color: priorityConfig[plan.priority].color }">
                  {{ priorityConfig[plan.priority].icon }}
                </div>
              </div>
              
              <div class="plan-content">
                <h3 class="plan-title" :class="{ 'line-through': plan.completed }">
                  {{ plan.title }}
                </h3>
                <p class="plan-description">{{ plan.description }}</p>
                
                <div class="plan-meta">
                  <span class="plan-category">{{ plan.category }}</span>
                  <span class="plan-date">📆 {{ plan.dueDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style src="~/assets/css/tech-stack.css" scoped></style>

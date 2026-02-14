<script setup lang="ts">
import { useHead } from '#app'
import { techStacks, levelConfig, weeklyPlans, priorityConfig, longTermGoals, goalStatusConfig } from '~/data/tech-footprint.js'
import { computed, ref } from 'vue'

useHead({
  title: '技术足迹 - Tung Chia-hui',
  meta: [
    { name: 'description', content: '我的技术成长轨迹 - 技能图谱、长期目标与任务管理' }
  ]
})

// 定义类型
type SkillLevel = 'expert' | 'intermediate' | 'learning'
type Priority = 'high' | 'medium' | 'low'
type GoalStatus = 'in-progress' | 'completed' | 'planned'

// 当前选中的视图 tab
const activeTab = ref<'current' | 'history'>('current')

// 当前周标识（根据数据文件中的最新周次）
const currentWeek = '2026-W07'

// 历史记录分页 - 每页显示的周数
const WEEKS_PER_PAGE = 10
const displayedWeeksCount = ref(WEEKS_PER_PAGE)

// 手风琴展开状态（记录哪些周是展开的）
const expandedWeeks = ref<Set<string>>(new Set(['2026-W06'])) // 默认展开最近一周

// 切换周的展开/收起
const toggleWeek = (week: string) => {
  if (expandedWeeks.value.has(week)) {
    expandedWeeks.value.delete(week)
  } else {
    expandedWeeks.value.add(week)
  }
}

// 加载更多历史记录
const loadMore = () => {
  displayedWeeksCount.value += WEEKS_PER_PAGE
}

// 按视图过滤计划
const filteredPlans = computed(() => {
  if (activeTab.value === 'current') {
    // 本周任务
    return weeklyPlans.filter(p => p.week === currentWeek)
  } else {
    // 历史记录（本周之前的）
    return weeklyPlans.filter(p => p.week !== currentWeek)
  }
})

// 按周分组 - 按周次倒序排列，并应用分页限制
const plansByWeek = computed(() => {
  const groups: Record<string, any[]> = {}
  filteredPlans.value.forEach(plan => {
    if (!groups[plan.week]) {
      groups[plan.week] = []
    }
    // 修复：添加类型断言，确保 groups[plan.week] 不是 undefined
    groups[plan.week]!.push(plan)
  })
  
  // 转换成数组并按周次倒序排列（最新的在前），然后应用分页
  const sortedWeeks = Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([week, plans]) => ({ week, plans }))
  
  // 只返回当前显示数量的周
  return sortedWeeks.slice(0, displayedWeeksCount.value)
})

// 是否还有更多历史记录可加载
const hasMoreHistory = computed(() => {
  const totalHistoryWeeks = new Set(
    weeklyPlans.filter(p => p.week !== currentWeek).map(p => p.week)
  ).size
  return displayedWeeksCount.value < totalHistoryWeeks
})

// 计算完成状态统计（仅针对当前视图）
const planStats = computed(() => {
  const plans = filteredPlans.value
  const total = plans.length
  const completed = plans.filter(p => p.completed).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, percentage }
})

// 按优先级排序计划（用于本周任务）
const sortedPlans = computed(() => {
  const priorityOrder: Record<Priority, number> = { 
    high: 1, 
    medium: 2, 
    low: 3 
  }
  return [...filteredPlans.value].sort((a, b) => {
    // 先按完成状态排序（未完成的在前）
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // 修复：添加类型断言
    const aPriority = a.priority as Priority
    const bPriority = b.priority as Priority
    return priorityOrder[aPriority] - priorityOrder[bPriority]
  })
})

// 类型安全的辅助函数
const getLevelConfig = (level: string) => {
  return levelConfig[level as SkillLevel]
}

const getPriorityConfig = (priority: string) => {
  return priorityConfig[priority as Priority]
}

const getGoalStatusConfig = (status: string) => {
  return goalStatusConfig[status as GoalStatus]
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
      <h1 class="main-title">🚀 技术足迹</h1>
      <p class="subtitle">记录成长，见证进步</p>
    </header>

    <!-- 长期目标 -->
    <section class="long-term-goals">
      <h2 class="section-title">🎯 长期目标</h2>
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
              :style="{ color: getGoalStatusConfig(goal.status).color }"
            >
              {{ getGoalStatusConfig(goal.status).icon }} {{ getGoalStatusConfig(goal.status).label }}
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
        <h2 class="section-title">📋 任务管理</h2>
        
        <!-- Tab 切换（只保留2个） -->
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

      <!-- 本周任务视图 -->
      <div v-if="activeTab === 'current'" class="plans-grid">
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
            <div class="plan-priority" :style="{ color: getPriorityConfig(plan.priority).color }">
              {{ getPriorityConfig(plan.priority).icon }}
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

      <!-- 历史记录视图（手风琴折叠模式 + 分页加载） -->
      <div v-if="activeTab === 'history'" class="history-view">
        <div 
          v-for="{ week, plans } in plansByWeek" 
          :key="week"
          class="week-accordion"
        >
          <!-- 可点击的周标题 -->
          <div 
            class="week-header" 
            @click="toggleWeek(week)"
            :class="{ 'expanded': expandedWeeks.has(week) }"
          >
            <div class="week-header-left">
              <span class="expand-icon">{{ expandedWeeks.has(week) ? '▼' : '▶' }}</span>
              <h3 class="week-title">{{ plans[0].weekLabel }}</h3>
            </div>
            <div class="week-stats">
              <span class="week-complete-count">
                {{ plans.filter(p => p.completed).length }}/{{ plans.length }} 完成
              </span>
            </div>
          </div>
          
          <!-- 可展开的任务列表 -->
          <transition name="accordion">
            <div v-if="expandedWeeks.has(week)" class="week-content">
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
                    <div class="plan-priority" :style="{ color: getPriorityConfig(plan.priority).color }">
                      {{ getPriorityConfig(plan.priority).icon }}
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
          </transition>
        </div>

        <!-- 加载更多按钮 -->
        <div v-if="hasMoreHistory" class="load-more-container">
          <button class="load-more-btn" @click="loadMore">
            <span class="load-more-icon">⬇</span>
            加载更多历史记录
          </button>
        </div>

        <!-- 已加载全部提示 -->
        <div v-else-if="plansByWeek.length > 0" class="all-loaded-hint">
          <span class="hint-icon">✓</span>
          已显示全部历史记录
        </div>
      </div>
    </section>

    <!-- 技术栈 -->
    <section class="tech-stack-section">
      <h2 class="section-title">💻 技术栈</h2>
      
      <!-- 熟练度说明 -->
      <div class="level-legend">
        <div class="legend-item" v-for="(config, key) in levelConfig" :key="key">
          <span class="legend-dot" :style="{ backgroundColor: config.color }"></span>
          <span class="legend-label">{{ config.label }}</span>
        </div>
      </div>

      <!-- 技术栈分类展示 -->
      <div class="tech-categories">
        <div 
          v-for="stack in techStacks" 
          :key="stack.category" 
          class="category-section"
        >
          <div class="category-header">
            <span class="category-icon">{{ stack.icon }}</span>
            <h3 class="category-title">{{ stack.category }}</h3>
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
                    :style="{ backgroundColor: getLevelConfig(skill.level).color }"
                  >
                    {{ getLevelConfig(skill.level).label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style src="~/assets/css/tech-footprint.css" scoped></style>
// data/techstack.js

// 技术栈数据
export const techStacks = [
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
export const levelConfig = {
  expert: { label: '日常使用', color: '#00c58e' },
  intermediate: { label: '能做开发', color: '#3b82f6' },
  learning: { label: '规划学习', color: '#a855f7' }
}

// 长期目标数据
export const longTermGoals = [
  {
    id: 1,
    period: '2026 Q1',
    title: '基础能力巩固',
    goals: [
      '深化 C/C++ 在嵌入式项目中的应用',
      '完成 ROS2 机器人导航项目实战',
      '学习 Rust 基础语法和所有权系统'
    ],
    status: 'in-progress' // in-progress, completed, planned
  },
  {
    id: 2,
    period: '2026 Q2',
    title: '跨平台开发',
    goals: [
      '掌握 Flutter 跨平台开发',
      '构建完整的机器人上位机应用',
      '提升前端工程化能力（Vue3 + TypeScript）'
    ],
    status: 'planned'
  },
  {
    id: 3,
    period: '2026 下半年',
    title: '技术深耕',
    goals: [
      '深入 Rust 系统编程和异步编程',
      '探索嵌入式 Linux 和 Yocto 项目',
      '参与开源机器人项目贡献'
    ],
    status: 'planned'
  },
  {
    id: 4,
    period: '长期愿景',
    title: '全栈机器人工程师',
    goals: [
      '精通嵌入式底层开发到上层应用全栈',
      '构建个人技术品牌和开源项目',
      '在机器人和嵌入式领域持续输出'
    ],
    status: 'planned'
  }
]

// 周计划数据（增加 week 字段标识是哪一周）
export const weeklyPlans = [
  // 2026年第7周（本周）
  {
    id: 1,
    week: '2026-W07',
    weekLabel: '2月10日 - 2月16日',
    title: '学习 Rust 基础语法',
    description: '完成 The Rust Programming Language 前 5 章内容',
    completed: false,
    priority: 'high',
    category: '学习',
    dueDate: '2026-02-16'
  },
  {
    id: 2,
    week: '2026-W07',
    weekLabel: '2月10日 - 2月16日',
    title: '完成博客 ROS2 导航教程',
    description: '编写 ROS2 Nav2 导航框架使用指南',
    completed: true,
    priority: 'medium',
    category: '创作',
    dueDate: '2026-02-14'
  },
  {
    id: 3,
    week: '2026-W07',
    weekLabel: '2月10日 - 2月16日',
    title: 'STM32 项目代码重构',
    description: '优化 FreeRTOS 任务调度，减少 CPU 占用',
    completed: true,
    priority: 'high',
    category: '开发',
    dueDate: '2026-02-15'
  },
  {
    id: 4,
    week: '2026-W07',
    weekLabel: '2月10日 - 2月16日',
    title: '研究 Flutter 状态管理',
    description: '学习 Provider 和 Riverpod 使用方法',
    completed: false,
    priority: 'medium',
    category: '学习',
    dueDate: '2026-02-17'
  },
  {
    id: 5,
    week: '2026-W07',
    weekLabel: '2月10日 - 2月16日',
    title: '更新博客技术栈页面',
    description: '添加新学习的技术和本周计划功能',
    completed: false,
    priority: 'low',
    category: '维护',
    dueDate: '2026-02-18'
  },
  
  // 2026年第6周（上周）
  {
    id: 6,
    week: '2026-W06',
    weekLabel: '2月3日 - 2月9日',
    title: '完成 OpenCV 图像处理项目',
    description: '实现实时物体检测和跟踪功能',
    completed: true,
    priority: 'high',
    category: '开发',
    dueDate: '2026-02-07'
  },
  {
    id: 7,
    week: '2026-W06',
    weekLabel: '2月3日 - 2月9日',
    title: '学习 Qt Quick QML',
    description: '掌握 Qt Quick 声明式 UI 开发',
    completed: true,
    priority: 'medium',
    category: '学习',
    dueDate: '2026-02-08'
  },
  {
    id: 8,
    week: '2026-W06',
    weekLabel: '2月3日 - 2月9日',
    title: '博客性能优化',
    description: '优化 Nuxt 页面加载速度和 SEO',
    completed: false,
    priority: 'low',
    category: '维护',
    dueDate: '2026-02-09'
  },

  // 2026年第5周（前两周）
  {
    id: 9,
    week: '2026-W05',
    weekLabel: '1月27日 - 2月2日',
    title: 'ROS2 节点通信优化',
    description: '优化多节点间的 Topic 通信效率',
    completed: true,
    priority: 'high',
    category: '开发',
    dueDate: '2026-01-31'
  },
  {
    id: 10,
    week: '2026-W05',
    weekLabel: '1月27日 - 2月2日',
    title: '学习 Linux 内核模块',
    description: '编写简单的字符设备驱动',
    completed: true,
    priority: 'medium',
    category: '学习',
    dueDate: '2026-02-01'
  }
]

// 优先级配置
export const priorityConfig = {
  high: { label: '高优先级', color: '#ef4444', icon: '🔥' },
  medium: { label: '中优先级', color: '#f59e0b', icon: '⭐' },
  low: { label: '低优先级', color: '#6b7280', icon: '📌' }
}

// 目标状态配置
export const goalStatusConfig = {
  'in-progress': { label: '进行中', color: '#00c58e', icon: '🚀' },
  'completed': { label: '已完成', color: '#3b82f6', icon: '✅' },
  'planned': { label: '计划中', color: '#a855f7', icon: '📋' }
}

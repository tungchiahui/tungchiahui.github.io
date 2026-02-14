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
      { name: 'Rust', level: 'learning', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg' },
      { name: 'Dart', level: 'learning', logo: 'https://dart.cn/assets/img/logo/dart-192.svg' }
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
      '学习 Dart 语言 与 Flutter 框架入门'
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
      '完善 ROS2 导航项目并开源分享'
    ],
    status: 'planned'
  },
  {
    id: 3,
    period: '2026 下半年',
    title: '技术深耕',
    goals: [
      '系统学习 OpenCV 计算机视觉算法',
      '探索嵌入式 Linux',
      '学习 YOLO 目标检测算法并应用于机器人视觉'
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
    // 2026年第5周（前两周）
  {
    id: 1,
    week: '2026-W05',
    weekLabel: '1月27日 - 2月2日',
    title: 'ESP32 IDF库基础学习1',
    description: '完成 ESP32 GPIO 和 EXIT 的基本使用',
    completed: true,
    priority: 'high',
    category: '学习',
    dueDate: '2026-01-31'
  },
    // 2026年第6周（上周）
  {
    id: 2,
    week: '2026-W06',
    weekLabel: '2月3日 - 2月9日',
    title: 'ESP32 IDF库基础学习2',
    description: '完成 ESP32 UART 和 PWM 的基本使用',
    completed: true,
    priority: 'high',
    category: '学习',
    dueDate: '2026-02-07'
  },
  // 2026年第7周（本周）
  {
    id: 3,
    week: '2026-W07',
    weekLabel: '2月10日 - 2月16日',
    title: 'Nuxt博客技术栈页面重构',
    description: '重构博客技术栈页面，提升性能和用户体验',
    completed: true,
    priority: 'high',
    category: '开发',
    dueDate: '2026-02-15'
  },
  {
    id: 4,
    week: '2026-W07',
    weekLabel: '2月10日 - 2月16日',
    title: '修复 Serial_Port库数据错误问题',
    description: '修复 Serial_Port库中数据解析错误问题，提升稳定性',
    completed: false,
    priority: 'medium',
    category: '维护',
    dueDate: '2026-02-16'
  },
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
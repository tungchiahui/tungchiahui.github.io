export const pageCopySource = {
  ui: {
    zh: {
      language: '语言',
      languageMenu: '语言切换',
      flagSuffix: '旗帜',
      home: '首页',
      blog: '博客',
      blogList: '博客列表',
      wiki: 'Wiki',
      wikiHome: 'Wiki 知识库',
      about: '关于',
      morePages: '更多页面',
      siteSearch: '全站搜索',
      search: '搜索',
      searchSiteContent: '搜索全站内容',
      toggleLight: '切换到白天模式',
      toggleDark: '切换到黑暗模式',
      siteInfo: '站点信息',
      backHome: '返回首页',
      siteName: '东澈的折腾天地',
      footerDescription: '记录学习、开发和生活里的折腾过程，把工程实践和踩坑经验整理成可以反复查阅的笔记。',
      visitNuxt: '访问 Nuxt 官网',
      footerNav: '页脚导航',
      siteNav: '站内导航',
      languageSettings: '语言设置',
      footerTools: '页脚工具',
      contact: '联系方式',
      stats: '数据统计',
      friends: '友情链接',
      aboutSite: '关于本站',
      searchPostTitle: '搜索文章标题...',
      scanningFiles: '正在扫描文件...',
      untitled: '无标题',
      noDate: '未标注日期',
      noPostMatch: '没有找到包含 "{query}" 的文章',
      noPosts: '仓库中似乎还没有文章...',
      pageviewsLoading: '总浏览 加载中...',
      visitsLoading: '总访问 加载中...',
      totalPageviews: '总浏览 {value}',
      totalVisits: '总访问 {value}',
      searchWiki: '搜索 Wiki 或章节...',
      scanningWiki: '正在扫描 Wiki...',
      chapterCount: '{count} 个章节',
      expand: '展开',
      collapse: '收起',
      wikiDoc: 'Wiki 文档',
      noWikiMatch: '没有找到相关 Wiki',
      noWiki: 'Wiki 还没有内容',
      loading: '加载中...',
      trafficInline: '{pageviews} 浏览 · {visits} 访问',
      loadingDefault: '正在加载',
      loadingReaderWiki: '正在整理 Wiki 阅读视图',
      loadingReaderBlog: '正在整理博文阅读视图',
      loadingHome: '正在进入首页',
      loadingWiki: '正在打开 Wiki 知识库',
      loadingBlog: '正在打开博客列表',
      loadingSearch: '正在检索内容',
      loadingPage: '正在切换页面',
      blogDescription: '东澈的博客文章列表，记录学习、开发与折腾过程。',
      wikiDescription: '按教程和章节组织的技术文档。',
      wikiMetaDescription: '按教程和章节组织的技术文档与学习笔记。',
      copyrightSiteName: '东澈的折腾天地',
      douyin: '抖音',
      miitIconAlt: '工信部图标',
      mpsIconAlt: '公安备案图标'
    }
  },
  home: {
    zh: {
      title: '欢迎来到东澈的折腾天地',
      description: '这里是我的个人主页，记录学习、开发和生活里的折腾过程: 从机器人与嵌入式，到 Web、工具和一些日常思考。',
      metaTitle: '东澈的折腾天地',
      metaDescription: '探索、学习与创造的记录',
      tags: ['技术折腾', '项目记录', '学习笔记', '生活随想'],
      actions: {
        blog: '浏览博客文章',
        wiki: '进入 Wiki 知识库',
        more: '查看更多页面'
      },
      focusTitle: '本站内容方向',
      focusDescription: '聚焦工程实践与可落地经验，而不是只停留在概念。',
      latestLabel: '最新内容',
      latestBlog: '最新博客',
      latestWiki: '最新 Wiki',
      viewAll: '查看全部',
      focusAreas: [
        {
          icon: 'fas fa-microchip',
          title: '编程与嵌入式开发',
          summary: '围绕 C/C++、Python 与 Linux 环境，沉淀 STM32、ESP32、FreeRTOS 与驱动开发实践。'
        },
        {
          icon: 'fas fa-robot',
          title: '机器人与自动化',
          summary: '持续实践 ROS1 / ROS2 的运动控制、导航建图与传感器融合，并结合 OpenCV 做环境感知。'
        },
        {
          icon: 'fas fa-display',
          title: '图形界面与工具开发',
          summary: '使用 Qt6 构建上位机与可视化调试工具，提升机器人项目的开发效率与可维护性。'
        },
        {
          icon: 'fas fa-globe',
          title: 'Web 与博客工程',
          summary: '基于 Nuxt 打造内容系统，持续优化内容组织、检索体验与前端性能。'
        },
        {
          icon: 'fas fa-mobile-screen-button',
          title: '移动端工具实践',
          summary: '在 Android 平台开发控制与监控工具，实现设备联动、状态可视化与流程提效。'
        },
        {
          icon: 'fas fa-pen-ruler',
          title: '学习笔记与思考复盘',
          summary: '以可复用的方式记录踩坑、设计取舍与项目反思，方便后续快速回顾与迭代。'
        }
      ]
    }
  },
  more: {
    zh: {
      title: '更多页面',
      description: '这里收集站内的重要页面，方便快速访问。',
      metaDescription: '站内重要页面入口，包括数据统计、友链、技术足迹、简历与导航页。',
      categories: {
        analytics: '数据分析',
        acceleration: '加速服务',
        other: '其他'
      },
      cards: {
        stats: ['数据统计', '网站数据分析与统计页面'],
        umami: ['Umami', '网站访问统计平台'],
        cnCdn: ['中国大陆 CDN', '内容分发网络(Content Delivery Network,CDN)'],
        globalCdn: ['国际 CDN', '内容分发网络(Content Delivery Network,CDN)'],
        music: ['音乐播放器', '和悬浮播放器同步的完整音乐控制台'],
        friends: ['友情链接', '汇聚优质网站、社区和团队'],
        footprint: ['技术足迹', '个人机器人技术路线清单'],
        weightLoss: ['减脂计划', '目标体重与每周身体数据记录'],
        cv: ['简历', '个人简历'],
        start: ['导航页', '导航页'],
        logo: ['个人 LOGO', 'LOGO介绍'],
        chat: ['CHAT', '自建的类ChatGPT网站']
      }
    },
    en: {
      cards: {
        music: ['Music Player', 'Full music console synced with the floating player'],
        weightLoss: ['Weight-loss Plan', 'Goal weights and weekly body metrics']
      }
    }
  },
  weightLoss: {
    zh: {
      metaTitle: '减脂计划与体重记录',
      metaDescription: '个人减脂阶段目标、每周实际体重及选填身体数据记录。',
      navLabel: '页面导航',
      backMore: '返回更多页面',
      navCurrent: '减脂计划',
      eyebrow: '2026.06 - 2027.02',
      title: '减脂计划与进度记录',
      intro: '把减脂执行模板、每两周目标和每周实际变化放在同一页。数据仅保存在当前浏览器。',
      startWeight: '起始体重',
      firstGoal: '第一阶段',
      finalGoal: '最终目标',
      planDuration: '计划周期',
      weeks: '周',
      currentWeight: '最近体重',
      totalChange: '累计变化',
      goalProgress: '总目标进度',
      nextMilestone: '下个节点',
      noRecord: '暂无记录',
      healthTitle: '先保证身体状态，再追求速度',
      healthBody: '1300-1400 kcal 对当前体重属于偏积极方案。更稳妥的常见减重速度约为每周 0.45-0.9 kg；若连续数周明显更快，或出现头晕、心慌、手抖、腿软、睡眠变差、半夜饿醒等情况，应增加摄入并考虑咨询医生或注册营养师。',
      healthSource: '查看 CDC 渐进减重建议',
      planTitle: '当前执行模板',
      summerPlan: '暑假积极减脂版',
      schoolPlan: '开学学习与跑步版',
      restPlan: '休息日',
      calories: '每日热量',
      activity: '活动目标',
      meals: '饮食重点',
      summerCalories: '1300-1400 kcal',
      summerActivity: '普通日 8000-10000 步；高活动日不必刻意加练',
      summerMeals: '豆浆与鸡蛋早餐；午晚餐控制米饭，保证蛋白质和蔬菜',
      schoolCalories: '1500-1600 kcal',
      schoolActivity: '低速骑车通勤；每周 2-3 次跑走结合',
      schoolMeals: '三餐增加少量主食，优先保证上课、科研和跑步精力',
      restCalories: '1200-1350 kcal',
      restActivity: '不强求步数，愿意时饭后走 5-10 分钟',
      restMeals: '仍然吃三餐，不靠整天断食补偿',
      recordTitle: '每周数据记录',
      recordDescription: '建议填写同一称重条件下的 7 日平均体重。体脂率、肌肉量、腰围和备注均为选填。',
      autoSaved: '自动保存到当前浏览器',
      selectWeek: '选择记录周',
      averageWeight: '7 日平均体重',
      bodyFat: '体脂率',
      muscleMass: '肌肉量',
      waist: '腰围',
      note: '备注',
      optional: '选填',
      weightUnit: 'kg',
      percentUnit: '%',
      waistUnit: 'cm',
      notePlaceholder: '睡眠、饮食、运动或身体感受',
      targetRange: '本周目标',
      recordStatus: '目标对比',
      importCsv: '导入 CSV',
      exportCsv: '导出 CSV',
      importSuccess: '已导入 {imported} 条记录，跳过 {skipped} 条。',
      importFailed: '没有找到可导入的有效记录，请使用本页面导出的 CSV 文件。',
      importReadFailed: 'CSV 文件读取失败，请重新选择文件。',
      clearData: '清空个人记录',
      clearConfirm: '确定清空所有体重和身体数据吗？此操作无法撤销。',
      trendTitle: '目标与实际趋势',
      trendDescription: '绿色线为目标区间中值，蓝色线为已填写的实际 7 日平均体重。',
      targetLine: '目标趋势',
      actualLine: '实际体重',
      milestoneTitle: '每两周体重目标表',
      milestoneDescription: '完整保留原计划中的阶段目标，并使用对应周的实际数据自动判断进度。',
      stage: '阶段',
      date: '日期',
      focus: '重点',
      actual: '实际',
      status: '状态',
      statusPending: '待记录',
      statusOnTarget: '处于目标区间',
      statusAhead: '下降偏快，注意恢复',
      statusBehind: '距区间上限 {difference} kg',
      startPoint: '起点',
      milestoneFocus: [
        '起点',
        '暑假前期，饮食收紧，早期水分变化可能较快',
        '继续稳定三餐，不乱吃零食',
        '稳定减脂，不极端节食',
        '保持站岗、走路和骑车活动',
        '开学前关键节点，接近 90 kg',
        '开学适应期，饮食提高到 1500-1600 kcal',
        '开始跑走结合，每周 2-3 次',
        '保护膝盖，不追速度',
        '中段减脂，关注体型和精力',
        '保证学习精力，不要饿到虚',
        '接近 80 kg，下降速度自然放慢',
        '重点看腰围和长期趋势',
        '年底前进入较轻体重区间',
        '不硬冲，保持稳定',
        '接近目标，开始关注防反弹',
        '基本达到目标区间',
        '转入维持期'
      ],
      dataNote: '隐私提示：这些记录不会上传服务器。可用 CSV 导出备份，并在其他浏览器中重新导入。',
      tableWeek: '周次',
      allRecords: '完整每周记录',
      showRecords: '展开完整记录表',
      hideRecords: '收起完整记录表'
    },
    en: {
      metaTitle: 'Weight-loss Plan and Progress',
      metaDescription: 'Personal weight-loss milestones, weekly weight, and optional body metrics.',
      navLabel: 'Page navigation',
      backMore: 'Back to More',
      navCurrent: 'Weight-loss Plan',
      eyebrow: 'Jun 2026 - Feb 2027',
      title: 'Weight-loss Plan and Progress',
      intro: 'Plan templates, biweekly targets, and weekly progress in one place. Data stays in this browser.',
      startWeight: 'Starting weight',
      firstGoal: 'First goal',
      finalGoal: 'Final goal',
      planDuration: 'Plan length',
      weeks: 'weeks',
      currentWeight: 'Latest weight',
      totalChange: 'Total change',
      goalProgress: 'Goal progress',
      nextMilestone: 'Next milestone',
      noRecord: 'No record',
      healthTitle: 'Protect your health before chasing speed',
      healthBody: 'At the current weight, 1,300-1,400 kcal is an aggressive target. A commonly recommended gradual pace is about 0.45-0.9 kg per week. If loss stays much faster for several weeks, or dizziness, palpitations, shaking, weak legs, poor sleep, or waking hungry occurs, increase intake and consider speaking with a physician or registered dietitian.',
      healthSource: 'Read the CDC guidance on gradual weight loss',
      planTitle: 'Current Templates',
      summerPlan: 'Summer active-loss plan',
      schoolPlan: 'School and running plan',
      restPlan: 'Rest day',
      calories: 'Daily calories',
      activity: 'Activity',
      meals: 'Meal focus',
      summerCalories: '1,300-1,400 kcal',
      summerActivity: '8,000-10,000 steps on regular days; no need to add workouts on active days',
      summerMeals: 'Soy milk and eggs for breakfast; controlled rice with protein and vegetables later',
      schoolCalories: '1,500-1,600 kcal',
      schoolActivity: 'Easy cycling commute and 2-3 run-walk sessions each week',
      schoolMeals: 'Add some staple food to support classes, research, and running',
      restCalories: '1,200-1,350 kcal',
      restActivity: 'No step requirement; optionally walk 5-10 minutes after meals',
      restMeals: 'Still eat three meals instead of compensating with a full-day fast',
      recordTitle: 'Weekly Metrics',
      recordDescription: 'Use a 7-day average measured under consistent conditions. Body fat, muscle mass, waist, and notes are optional.',
      autoSaved: 'Automatically saved in this browser',
      selectWeek: 'Select week',
      averageWeight: '7-day average weight',
      bodyFat: 'Body fat',
      muscleMass: 'Muscle mass',
      waist: 'Waist',
      note: 'Notes',
      optional: 'optional',
      weightUnit: 'kg',
      percentUnit: '%',
      waistUnit: 'cm',
      notePlaceholder: 'Sleep, meals, activity, or how you felt',
      targetRange: 'Weekly target',
      recordStatus: 'Comparison',
      importCsv: 'Import CSV',
      exportCsv: 'Export CSV',
      importSuccess: 'Imported {imported} records and skipped {skipped}.',
      importFailed: 'No valid records were found. Use a CSV exported from this page.',
      importReadFailed: 'The CSV file could not be read. Please choose it again.',
      clearData: 'Clear personal data',
      clearConfirm: 'Clear all weight and body metrics? This cannot be undone.',
      trendTitle: 'Target vs. Actual',
      trendDescription: 'The green line is the midpoint of the target range. The blue line is your recorded 7-day average.',
      targetLine: 'Target trend',
      actualLine: 'Actual weight',
      milestoneTitle: 'Biweekly Goal Table',
      milestoneDescription: 'The original milestone targets are preserved and compared with the matching weekly record.',
      stage: 'Stage',
      date: 'Date',
      focus: 'Focus',
      actual: 'Actual',
      status: 'Status',
      statusPending: 'Not recorded',
      statusOnTarget: 'Within target range',
      statusAhead: 'Dropping quickly; watch recovery',
      statusBehind: '{difference} kg above range',
      startPoint: 'Start',
      milestoneFocus: [
        'Starting point',
        'Early summer phase; water weight may change quickly',
        'Keep meals steady and avoid snacks',
        'Lose steadily without crash dieting',
        'Maintain standing, walking, and cycling',
        'Key pre-school milestone near 90 kg',
        'Raise intake to 1,500-1,600 kcal while adapting to school',
        'Begin run-walk sessions 2-3 times weekly',
        'Protect knees and ignore pace',
        'Mid-plan phase; watch shape and energy',
        'Protect study energy and avoid feeling depleted',
        'Near 80 kg, expect a naturally slower pace',
        'Focus on waist and the long-term trend',
        'Enter a lighter range before year-end',
        'Stay steady without forcing the pace',
        'Approach the goal and prepare against regain',
        'Reach the main goal range',
        'Move into maintenance'
      ],
      dataNote: 'Privacy: nothing is uploaded. Export a CSV backup and import it in another browser when needed.',
      tableWeek: 'Week',
      allRecords: 'All weekly records',
      showRecords: 'Show full table',
      hideRecords: 'Hide full table'
    }
  },
  friend: {
    zh: {
      title: '友情链接',
      metaDescription: '汇聚技术资源、开源社区、竞赛团队及优质网站。',
      description: '汇聚技术资源、开源社区、竞赛团队及优质网站，方便学习、交流与探索更多创新内容。',
      visit: '访问网站',
      categories: {
        '高校团队': '高校团队',
        '赛事': '赛事',
        '社区': '社区',
        '博主': '博主'
      },
      tags: {
        '竞赛': '竞赛',
        '资源': '资源',
        '讨论': '讨论',
        '个人': '个人'
      },
      friends: {
        vinci: {
          name: 'Vinci机器人队',
          desc: '山东理工大学CURC-Robocon团队'
        },
        qiqi: {
          name: '齐奇战队',
          desc: '山东理工大学CURC-RoboMaster团队'
        },
        robocon: {
          name: 'CURC-Robocon赛事官网',
          desc: '全国大学生机器人大赛RC 官方站点'
        },
        robomaster: {
          name: 'CURC-RoboMaster赛事官网',
          desc: '全国大学生机器人大赛RM 官方站点'
        },
        rcbbs: {
          name: 'RCBBS-Robocon开源论坛',
          desc: '开源机器人与 RC 社区'
        },
        rmBbs: {
          name: 'RoboMaster开源论坛',
          desc: '开源机器人与 RC 社区'
        },
        cherish: {
          name: 'Cherish个人博客',
          desc: '记录生活，分享知识，定格美好'
        },
        timeStation: {
          name: '时光驿站',
          desc: '记录生活，分享知识，定格美好'
        }
      }
    }
  },
  mylogo: {
    zh: {
      metaTitle: '个人 LOGO - Tung Chia-hui',
      metaDescription: 'Tung Chia-hui 个人 LOGO 介绍：以 T / C / H 为核心的绿色几何个人标识。',
      navLabel: '页面导航',
      back: '返回更多页面',
      imageAlt: 'Tung Chia-hui 个人 LOGO',
      kicker: 'Tung Chia-hui 的个人标识',
      title: '个人 LOGO',
      summary: '一个把名字、机器人方向和工程气质压缩在一起的绿色几何符号。',
      letterSectionTitle: '字母结构',
      letterSectionBody: '这个 Logo 以我的名字 Tung Chia-hui 的首字母 T / C / H 为核心，将三个字母融合进一个类似立方体的几何结构中。它不只是一个简单的姓名缩写，而是一个带有工程感和系统感的个人标识：中间向上的 T 像一条主轴，代表技术方向、持续成长和向上探索；左侧的 C 像一个开放的结构框架，象征连接、协作与对外部世界的感知；右侧的 H 则像稳定的支撑模块，代表硬件、系统架构与工程实现能力。',
      keyGridLabel: 'LOGO 字母含义',
      cards: [
        {
          letter: 'T',
          title: '技术主轴',
          body: '向上的结构感，代表技术方向、持续成长和向上探索。'
        },
        {
          letter: 'C',
          title: '开放框架',
          body: '开放而有连接性的轮廓，象征协作与对外部世界的感知。'
        },
        {
          letter: 'H',
          title: '工程支撑',
          body: '稳定的支撑模块，代表硬件、系统架构与工程实现能力。'
        }
      ],
      greenTitle: '绿色含义',
      greenBody: '绿色是这个 Logo 的主色。相比冷硬的工业色彩，绿色更强调成长、生命力与持续迭代。机器人并不只是机械、代码和电路的组合，它也承载着对现实世界的感知、行动与反馈。对我来说，绿色代表一种不断调试、不断优化、不断向前推进的状态：从一块开发板、一段驱动程序、一个节点，到一台能够自主运动的机器人，技术在一次次实践中逐渐生长。',
      attitudeTitle: '技术态度',
      attitudeBody: '因此，这个 Logo 是我的个人符号，也是我的技术态度。它代表我对机器人系统的理解：既关注底层硬件，也重视上层软件；既追求工程实现，也保留创造力和探索欲。它将我的名字、技术方向和个人气质压缩进一个简洁的几何标识里，象征着我希望持续构建更完整、更可靠、更智能的机器人系统。'
    }
  },
  techFootprint: {
    zh: {
      metaTitle: '技术足迹 - 个人机器人技术路线',
      metaDescription: '个人机器人技术路线清单，覆盖 ROS2、SLAM、Nav2、ros2_control、多传感器融合、MoveIt2 与部署。',
      navLabel: '页面导航',
      backHome: '返回首页',
      navCurrent: '技术足迹',
      mainTrack: '主线',
      sideTrack: '副线',
      goalLabel: '路线目标',
      toolchainLabel: '核心工具链',
      systemMap: 'System Map',
      architectureTitle: '从底盘到部署的能力链路',
      architectureDescription: '这张图来自同一份阶段数据：以后调整阶段时，路线图和任务清单会一起跟着变。',
      checklist: 'Checklist',
      roadmapTitle: '个人路线任务清单',
      roadmapDescription: '{total} 个长期任务里，先抓住 {core} 个主线任务；页面上的统计、分组和优先级都从任务清单自动生成。',
      totalTasks: '总任务',
      taskStatsLabel: '任务统计',
      roadmapViewLabel: '路线图视图',
      coreTasks: '主线',
      doingTasks: '进行中',
      doneTasks: '已完成',
      taskPrefix: 'Task',
      deliverables: '阶段成果',
      keywordsTitle: '能力关键词',
      maintenanceTitle: '维护规则',
      priority: 'Priority',
      priorityTitle: '路线优先级',
      priorityDescription: '这里不用单独维护，分组会从任务的 priority 字段自动生成。',
      tabs: {
        tasks: '路线待办',
        stages: '阶段清单',
        archive: '沉淀归档',
        tasksEyebrow: '{count} 个任务',
        stagesEyebrow: '{count} 个能力层',
        archiveEyebrow: '长期维护区'
      }
    }
  },
  start: {
    zh: {
      metaTitle: 'Start Page',
      backHome: '返回首页',
      displayMode: '显示模式',
      simple: '简洁',
      detailed: '完整',
      switchBackground: '切换背景',
      currentEngineLabel: '当前搜索引擎：{engine}，点击切换',
      currentEngineTitle: '当前搜索引擎：{engine}',
      engineNames: {
        baidu: '百度',
        google: '谷歌',
        bing: '必应'
      },
      searchPlaceholder: '搜索，或者输入一个网址',
      searchAria: '搜索或输入网址',
      clearSearch: '清空搜索',
      clear: '清空',
      startSearch: '开始搜索',
      search: '搜索',
      suggestions: '搜索建议',
      recentSearches: '最近搜索',
      clearHistory: '清除历史',
      removeHistory: '移除此条历史',
      loadingSuggestions: '正在获取建议',
      launchpad: 'Launchpad',
      bookmarksTitle: '常用入口',
      finishEdit: '完成编辑',
      editBookmarks: '编辑书签',
      addSection: '新增分类',
      resetDefaults: '恢复默认',
      sectionName: '分类名称',
      entryCount: '{count} 个入口',
      addBookmark: '添加书签',
      namePlaceholder: '名称',
      descPlaceholder: '描述',
      bookmarkName: '书签名称',
      bookmarkDesc: '书签描述',
      bookmarkUrl: '书签链接',
      deleteBookmark: '删除书签',
      startStatus: '启动页状态',
      currentEngine: '当前引擎',
      readySearch: '准备搜索',
      waitingInput: '等待输入',
      categories: '分类',
      entries: '入口',
      history: '历史',
      recent: '最近',
      defaultEntryName: '新入口',
      defaultEntryDesc: '添加描述',
      defaultSectionTitle: '新分类',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      weekdayPrefix: '星期',
      greetings: {
        early: '早上好，先找到今天的节奏。',
        morning: '上午好，适合做一点需要专注的事。',
        noon: '中午好，慢一点也没关系。',
        afternoon: '下午好，把下一步打开就行。',
        evening: '晚上好，收束今天，也留点余地。',
        night: '夜深了，做完这一件就早点休息。'
      },
      defaultSections: [
        {
          title: '日常工具',
          items: [
            { id: 'tool-gmail', name: 'Gmail', desc: '邮件收件箱', url: 'https://mail.google.com', key: '1', color: '#ef5b4d' },
            { id: 'tool-github', name: 'GitHub', desc: '代码与项目', url: 'https://github.com', key: '2', color: '#6f66d8' },
            { id: 'tool-notion', name: 'Notion', desc: '笔记与资料', url: 'https://notion.so', key: '3', color: '#2f3437' },
            { id: 'tool-chatgpt', name: 'ChatGPT', desc: 'AI 助手', url: 'https://chat.openai.com', key: '4', color: '#10a37f' }
          ]
        },
        {
          title: '开发资源',
          items: [
            { id: 'dev-mdn', name: 'MDN', desc: 'Web 文档', url: 'https://developer.mozilla.org', color: '#2f80ed' },
            { id: 'dev-stack', name: 'Stack Overflow', desc: '技术问答', url: 'https://stackoverflow.com', color: '#f48225' },
            { id: 'dev-caniuse', name: 'Can I Use', desc: '兼容性查询', url: 'https://caniuse.com', color: '#7bbf47' },
            { id: 'dev-codepen', name: 'CodePen', desc: '前端实验', url: 'https://codepen.io', color: '#47b8a6' }
          ]
        },
        {
          title: '阅读灵感',
          items: [
            { id: 'read-hn', name: 'Hacker News', desc: '技术热榜', url: 'https://news.ycombinator.com', color: '#ff6600' },
            { id: 'read-producthunt', name: 'Product Hunt', desc: '产品发现', url: 'https://www.producthunt.com', color: '#da3b28' },
            { id: 'read-v2ex', name: 'V2EX', desc: '创意社区', url: 'https://www.v2ex.com', color: '#308eda' },
            { id: 'read-zhihu', name: '知乎', desc: '知识问答', url: 'https://www.zhihu.com', color: '#0084ff' }
          ]
        },
        {
          title: '媒体娱乐',
          items: [
            { id: 'media-youtube', name: 'YouTube', desc: '视频频道', url: 'https://www.youtube.com', color: '#ff0033' },
            { id: 'media-bilibili', name: 'Bilibili', desc: '弹幕视频', url: 'https://www.bilibili.com', color: '#00aeec' },
            { id: 'media-spotify', name: 'Spotify', desc: '音乐电台', url: 'https://open.spotify.com', color: '#1ed760' },
            { id: 'media-douban', name: '豆瓣', desc: '书影音', url: 'https://www.douban.com', color: '#1b813e' }
          ]
        }
      ]
    }
  },
  stats: {
    zh: {
      title: '数据统计',
      metaDescription: '网站访问数据统计',
      note: '以下数据来自 Umami API，支持实时刷新。',
      refresh: '刷新数据',
      refreshing: '刷新中...',
      unavailable: '统计数据暂时不可用，请稍后再试。',
      loading: '正在加载统计数据...',
      overviewLabel: '全站指标',
      frameLabel: 'Umami 共享面板',
      frameTitle: '网站访问数据统计',
      direct: '直接访问',
      empty: '暂无数据',
      units: {
        hours: '小时',
        minutes: '分',
        seconds: '秒',
        page: '页',
        pageviews: '浏览',
        visits: '访问',
        visitors: '访客',
        times: '次'
      },
      summary: {
        visitors: '访客人数',
        visits: '访问次数',
        pageviews: '浏览次数',
        bounces: '跳出次数',
        bounceRate: '跳出率',
        avgVisitDuration: '平均停留',
        pagesPerVisit: '平均每次浏览',
        totaltime: '累计停留'
      },
      sections: {
        paths: '热门页面',
        referrers: '来源网站',
        channels: '渠道',
        countries: '国家',
        regions: '地区',
        cities: '城市',
        browsers: '浏览器',
        os: '操作系统',
        devices: '设备',
        events: '事件'
      }
    }
  }
} as const

export type PageCopySource = typeof pageCopySource

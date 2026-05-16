export const pageCopySource = {
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
    },
    en: {
      title: "Welcome to Dongche's Tinkering Notes",
      description: 'A personal homepage for learning, development, and everyday tinkering: from robotics and embedded systems to web tools and practical notes.',
      metaTitle: "Dongche's Tinkering Notes",
      metaDescription: 'Notes on exploring, learning, and building.',
      tags: ['Technical tinkering', 'Project logs', 'Study notes', 'Life thoughts'],
      actions: {
        blog: 'Browse blog posts',
        wiki: 'Open Wiki knowledge base',
        more: 'View more pages'
      },
      focusTitle: 'What This Site Covers',
      focusDescription: 'Focused on engineering practice and reusable experience, not just concepts.',
      latestLabel: 'Latest content',
      latestBlog: 'Latest Blog',
      latestWiki: 'Latest Wiki',
      viewAll: 'View all',
      focusAreas: [
        {
          icon: 'fas fa-microchip',
          title: 'Programming and Embedded Development',
          summary: 'C/C++, Python, Linux, STM32, ESP32, FreeRTOS, and driver development practice.'
        },
        {
          icon: 'fas fa-robot',
          title: 'Robotics and Automation',
          summary: 'ROS1 / ROS2 motion control, navigation, mapping, sensor fusion, and OpenCV-based perception.'
        },
        {
          icon: 'fas fa-display',
          title: 'GUI and Tool Development',
          summary: 'Qt6 host tools and visual debugging utilities that make robotics projects easier to maintain.'
        },
        {
          icon: 'fas fa-globe',
          title: 'Web and Blog Engineering',
          summary: 'A Nuxt-based content system with better organization, search, and frontend performance.'
        },
        {
          icon: 'fas fa-mobile-screen-button',
          title: 'Mobile Tool Practice',
          summary: 'Android control and monitoring tools for device integration, status visualization, and workflow efficiency.'
        },
        {
          icon: 'fas fa-pen-ruler',
          title: 'Study Notes and Retrospectives',
          summary: 'Reusable notes on pitfalls, design tradeoffs, and project reviews for later iteration.'
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
        friends: ['友情链接', '汇聚优质网站、社区和团队'],
        footprint: ['技术足迹', '个人机器人技术路线清单'],
        cv: ['简历', '个人简历'],
        start: ['导航页', '导航页'],
        logo: ['个人 LOGO', 'LOGO介绍'],
        chat: ['CHAT', '自建的类ChatGPT网站']
      }
    },
    en: {
      title: 'More Pages',
      description: 'Important site pages collected for quick access.',
      metaDescription: 'Important site entries, including analytics, friends, tech footprint, resume, and navigation.',
      categories: {
        analytics: 'Analytics',
        acceleration: 'Acceleration Services',
        other: 'Other'
      },
      cards: {
        stats: ['Stats', 'Website analytics and statistics'],
        umami: ['Umami', 'Website traffic analytics platform'],
        cnCdn: ['Mainland China CDN', 'Content Delivery Network (CDN)'],
        globalCdn: ['Global CDN', 'Content Delivery Network (CDN)'],
        friends: ['Friends', 'Useful websites, communities, and teams'],
        footprint: ['Tech Footprint', 'Personal robotics technology roadmap'],
        cv: ['Resume', 'Personal resume'],
        start: ['Start Page', 'Navigation page'],
        logo: ['Personal Logo', 'Logo introduction'],
        chat: ['CHAT', 'Self-hosted ChatGPT-like website']
      }
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
    },
    en: {
      title: 'Stats',
      metaDescription: 'Website traffic analytics.',
      note: 'The data below comes from the Umami API and supports live refresh.',
      refresh: 'Refresh data',
      refreshing: 'Refreshing...',
      unavailable: 'Analytics data is temporarily unavailable. Please try again later.',
      loading: 'Loading analytics data...',
      overviewLabel: 'Site metrics',
      frameLabel: 'Umami shared dashboard',
      frameTitle: 'Website traffic analytics',
      direct: 'Direct',
      empty: 'No data',
      units: {
        hours: 'h',
        minutes: 'm',
        seconds: 's',
        page: 'pages',
        pageviews: 'views',
        visits: 'visits',
        visitors: 'visitors',
        times: 'times'
      },
      summary: {
        visitors: 'Visitors',
        visits: 'Visits',
        pageviews: 'Pageviews',
        bounces: 'Bounces',
        bounceRate: 'Bounce rate',
        avgVisitDuration: 'Avg. duration',
        pagesPerVisit: 'Pages per visit',
        totaltime: 'Total time'
      },
      sections: {
        paths: 'Top Pages',
        referrers: 'Referrers',
        channels: 'Channels',
        countries: 'Countries',
        regions: 'Regions',
        cities: 'Cities',
        browsers: 'Browsers',
        os: 'Operating Systems',
        devices: 'Devices',
        events: 'Events'
      }
    }
  }
} as const

export type PageCopySource = typeof pageCopySource

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

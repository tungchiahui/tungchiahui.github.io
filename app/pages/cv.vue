<script setup lang="ts">
import { useHead } from '#app'
import { computed, ref } from 'vue'

type Locale = 'zh' | 'en'

const locale = ref<Locale>('zh')
const photoUrl = 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/tungchiahui.webp'

const resumeCopies = {
  zh: {
    metaTitle: '个人简历 - 董佳辉',
    metaDescription: '董佳辉的个人简历，聚焦 SLAM、三维建图、ROS2 自主导航与机器人智能感知。',
    languageLabel: '简历语言',
    kicker: 'Personal Resume',
    name: '董佳辉',
    headline: 'SLAM 与机器人自主导航方向',
    status: '燕山大学电气工程学院自动化系 · 人工智能硕士',
    summary:
      '长期参与机器人竞赛与实验室建设，重点关注 SLAM、三维建图、ROS2 自主导航与机器人智能感知，同时具备 STM32、RTOS、CAN 通信与底盘控制等嵌入式开发能力。计划推进 3D 建图、2D 导航、MoveIt2 机械臂控制与 YOLO 目标识别融合的机器人系统项目。',
    contactTitle: '联系方式',
    skillsTitle: '专业技能',
    educationTitle: '教育背景',
    awardsTitle: '荣誉证书',
    experienceTitle: '个人经历',
    coursesTitle: '主修课程',
    researchTitle: '研究方向',
    contact: [
      { label: '邮箱', value: 'tungchiahui@gmail.com', href: 'mailto:tungchiahui@gmail.com' },
      { label: 'GitHub', value: 'tungchiahui', href: 'https://github.com/tungchiahui' },
      { label: 'QQ', value: '2225279276', href: null },
      { label: '微信', value: 'tungchiahui', href: null }
    ],
    metrics: [
      { value: 'Top 20%', label: '本科智育专业排名' },
      { value: 'Top 10%', label: '本科综测专业排名' },
      { value: '12 项', label: '国家级竞赛奖项' },
      { value: '20+ 场', label: '技术与管理培训' }
    ],
    skillGroups: [
      {
        title: 'SLAM 与导航',
        tags: ['SLAM', '3D 建图', '2D 导航', 'Cartographer', 'AMCL', 'NAV2', 'TF 坐标变换']
      },
      {
        title: '机器人系统',
        tags: ['ROS2', 'Gazebo', 'MoveIt2', '机械臂控制', '机器人运动学', '底盘运动控制']
      },
      {
        title: '视觉与感知',
        tags: ['YOLO', 'OpenCV', '目标识别', '激光雷达', 'IMU', '里程计融合']
      },
      {
        title: '嵌入式与控制',
        tags: ['C/C++', 'STM32 标准库', 'STM32 HAL', 'RTOS', 'FreeRTOS', 'PID 控制', '底盘控制']
      },
      {
        title: '通信与硬件',
        tags: ['CAN', 'RS232', 'RS485', 'I2C', 'SPI', '大疆电机', '传感器调试']
      },
      {
        title: '工程工具',
        tags: ['Linux', 'SolidWorks', 'MATLAB', '3D 打印', '技术文档', '团队管理']
      }
    ],
    education: [
      {
        period: '2021.09 - 2025.06',
        school: '山东理工大学',
        college: '机械工程学院',
        major: '机械电子工程 · 机器人工程方向',
        details: [
          '学习成绩：智育专业排名前 20%（18/119），综测专业排名前 10%（14/119）。',
          '主修课程：ROS1 机器人建图与导航、单片机控制技术、机器人运动控制课程设计、3D 工程设计、电气控制技术与 PLC 编程、C 语言编程、电工电子技术。'
        ]
      },
      {
        period: '硕士阶段',
        school: '燕山大学',
        college: '电气工程学院自动化系',
        major: '人工智能硕士',
        details: ['研究方向：SLAM、三维建图、机器人自主导航与智能感知。']
      }
    ],
    awards: [
      '第二十三届全国大学生机器人大赛 ROBOCON 个人奖国家级二等奖（国 A 级竞赛）。',
      '第二十三届全国大学生机器人大赛 ROBOCON 团体奖国家级二等奖（国 A 级竞赛）。',
      '第二十二届、第二十三届全国大学生机器人大赛 ROBOCON 团体奖项国家级三等奖，共四项（国 A 级竞赛）。',
      '第二十二届、第二十三届全国大学生机器人大赛 ROBOCON 个人奖项国家级三等奖，共四项（国 A 级竞赛）。',
      '第十六届全国大学生节能减排社会实践与科技竞赛国家级三等奖（国 A 级竞赛）。',
      '第九届全国应用型人才综合技能大赛国家级二等奖。'
    ],
    experience: [
      {
        period: '2022.06 - 2023.07',
        title: '第二十二届全国大学生机器人大赛 Robocon',
        role: '队长兼电控组组长',
        bullets: [
          '围绕“吴哥之花”赛题参与两台投环机器人与一台机器狗的系统设计，实现协同作业、底盘机动、定位与投掷精度优化。',
          '统筹团队技术分工与研发进度，核心负责机器人电控系统开发，基于 STM32 + FreeRTOS 完成 AGV 舵轮、麦克纳姆轮底盘驱动方案。',
          '搭建 CAN 总线通信架构，实现大疆电机高响应 PID 闭环控制；通过 DMA 优化遥控数据交互，融合 IMU 完成航向校正和全场定位。',
          '获得 6 项第二十二届全国大学生机器人大赛 Robocon 国赛奖项，包括 3 项个人奖项与 3 项团队奖项。'
        ]
      },
      {
        period: '2023.07 - 2024.07',
        title: '四轮麦克纳姆 AMR 自主导航系统',
        role: '项目负责人 / 控制与导航开发',
        bullets: [
          '面向室内移动机器人场景，设计四轮麦克纳姆 AMR 底盘系统，实现全向移动、速度解算与底盘闭环控制。',
          '基于 ROS2 构建导航软件栈，融合轮式里程计、IMU 与激光雷达数据，完成 SLAM 建图、AMCL 定位与 NAV2 路径规划。',
          '使用 C++ 开发底盘控制与通信节点，优化运动控制稳定性和模块可维护性；搭建 Gazebo / RViz2 仿真调试流程。',
          '为后续拓展 3D 建图、MoveIt2 机械臂联动与 YOLO 目标识别预留系统接口。'
        ]
      },
      {
        period: '2021.10 - 2024.07',
        title: 'Vinci 机器人队 / 机电创新学会社团 / 智能机器人实验室',
        role: '队长兼社团会长',
        bullets: [
          '负责机器人队、社团及实验室的统筹管理、技术建设与人才培养，主导电控技术迭代与路线制定。',
          '组织 20 余场技术与管理培训，编写 10 余篇飞书技术文档，建立团队技术沉淀与新人培养机制。',
          '策划校内机器人赛事与科创活动，推动实验室项目协作和校园创新氛围建设。'
        ]
      }
    ]
  },
  en: {
    metaTitle: 'Resume - Tung Chia-hui',
    metaDescription:
      'Resume of Tung Chia-hui, focused on SLAM, 3D mapping, ROS2 autonomous navigation, and robotic perception.',
    languageLabel: 'Resume language',
    kicker: 'Personal Resume',
    name: 'Tung Chia-hui',
    headline: 'SLAM and Robot Autonomous Navigation',
    status: 'M.S. in Artificial Intelligence · Department of Automation, School of Electrical Engineering, Yanshan University',
    summary:
      'Robotics engineer with long-term experience in robot competitions and lab leadership. Focused on SLAM, 3D mapping, ROS2 autonomous navigation, and robotic perception, with hands-on embedded experience in STM32, RTOS, CAN communication, and chassis control.',
    contactTitle: 'Contact',
    skillsTitle: 'Skills',
    educationTitle: 'Education',
    awardsTitle: 'Honors',
    experienceTitle: 'Experience',
    coursesTitle: 'Core Courses',
    researchTitle: 'Research Focus',
    contact: [
      { label: 'Email', value: 'tungchiahui@gmail.com', href: 'mailto:tungchiahui@gmail.com' },
      { label: 'GitHub', value: 'tungchiahui', href: 'https://github.com/tungchiahui' },
      { label: 'QQ', value: '2225279276', href: null },
      { label: 'WeChat', value: 'tungchiahui', href: null }
    ],
    metrics: [
      { value: 'Top 20%', label: 'Academic ranking' },
      { value: 'Top 10%', label: 'Comprehensive ranking' },
      { value: '12', label: 'National competition awards' },
      { value: '20+', label: 'Training sessions organized' }
    ],
    skillGroups: [
      {
        title: 'SLAM and Navigation',
        tags: ['SLAM', '3D Mapping', '2D Navigation', 'Cartographer', 'AMCL', 'NAV2', 'TF Frames']
      },
      {
        title: 'Robotic Systems',
        tags: ['ROS2', 'Gazebo', 'MoveIt2', 'Manipulator Control', 'Robot Kinematics', 'Chassis Control']
      },
      {
        title: 'Vision and Perception',
        tags: ['YOLO', 'OpenCV', 'Object Recognition', 'LiDAR', 'IMU', 'Odometry Fusion']
      },
      {
        title: 'Embedded and Control',
        tags: ['C/C++', 'STM32 StdPeriph', 'STM32 HAL', 'RTOS', 'FreeRTOS', 'PID Control', 'Chassis Control']
      },
      {
        title: 'Communication and Hardware',
        tags: ['CAN', 'RS232', 'RS485', 'I2C', 'SPI', 'DJI Motors', 'Sensor Bring-up']
      },
      {
        title: 'Engineering Tools',
        tags: ['Linux', 'SolidWorks', 'MATLAB', '3D Printing', 'Technical Writing', 'Team Leadership']
      }
    ],
    education: [
      {
        period: 'Sep 2021 - Jun 2025',
        school: 'Shandong University of Technology',
        college: 'School of Mechanical Engineering',
        major: 'Mechatronic Engineering · Robotics Engineering Track',
        details: [
          'Academic ranking: top 20% in the major, 18/119. Comprehensive ranking: top 10%, 14/119.',
          'Core courses: ROS1 Robot Mapping and Navigation, Microcontroller Control Technology, Robot Motion Control Course Design, 3D Engineering Design, Electrical Control and PLC Programming, C Programming, Electrical and Electronic Technology.'
        ]
      },
      {
        period: 'M.S. Program',
        school: 'Yanshan University',
        college: 'School of Electrical Engineering · Department of Automation',
        major: 'M.S. in Artificial Intelligence',
        details: ['Research focus: SLAM, 3D mapping, robot autonomous navigation, and intelligent perception.']
      }
    ],
    awards: [
      'National Second Prize, Individual Award, 23rd ROBOCON China University Robot Competition, National Class-A competition.',
      'National Second Prize, Team Award, 23rd ROBOCON China University Robot Competition, National Class-A competition.',
      'Four National Third Prizes, Team Awards, 22nd and 23rd ROBOCON China University Robot Competition, National Class-A competition.',
      'Four National Third Prizes, Individual Awards, 22nd and 23rd ROBOCON China University Robot Competition, National Class-A competition.',
      'National Third Prize, 16th National College Student Energy Conservation and Emission Reduction Social Practice and Technology Competition, National Class-A competition.',
      'National Second Prize, 9th National Applied Talents Comprehensive Skills Competition.'
    ],
    experience: [
      {
        period: 'Jun 2022 - Jul 2023',
        title: '22nd ROBOCON China University Robot Competition',
        role: 'Team Leader and Electrical Control Lead',
        bullets: [
          'Designed and developed two ring-throwing robots and one robot dog for the “Angkor Flowers” challenge, focusing on collaboration, chassis mobility, localization, and throwing accuracy.',
          'Led technical task planning and R&D progress while developing the robot electrical control system; designed AGV swerve and mecanum chassis control solutions based on STM32 and FreeRTOS.',
          'Built a CAN bus architecture for high-response PID closed-loop control of DJI motors; optimized remote-control data exchange with DMA and fused IMU for heading correction and field localization.',
          'Won six national awards in the 22nd ROBOCON competition, including three individual awards and three team awards.'
        ]
      },
      {
        period: 'Jul 2023 - Jul 2024',
        title: 'Four-Wheel Mecanum AMR Autonomous Navigation System',
        role: 'Project Lead / Control and Navigation Developer',
        bullets: [
          'Designed a four-wheel mecanum AMR chassis for indoor mobile-robot scenarios, implementing omnidirectional motion, velocity solving, and closed-loop chassis control.',
          'Built a ROS2 navigation stack that fuses wheel odometry, IMU, and LiDAR data for SLAM mapping, AMCL localization, and NAV2 path planning.',
          'Developed chassis-control and communication nodes in C++, improving motion stability and module maintainability; built Gazebo / RViz2 simulation and debugging workflows.',
          'Reserved system interfaces for future 3D mapping, MoveIt2 manipulator coordination, and YOLO-based object recognition.'
        ]
      },
      {
        period: 'Oct 2021 - Jul 2024',
        title: 'Vinci Robot Team / Mechatronics Innovation Association / Intelligent Robot Lab',
        role: 'Team Leader and Association President',
        bullets: [
          'Managed the robot team, association, and lab, leading technical development, talent cultivation, and electrical-control roadmap planning.',
          'Organized more than 20 technical and management training sessions, wrote over 10 Feishu technical documents, and built a knowledge base for onboarding and team continuity.',
          'Planned campus robot competitions and innovation activities to support project collaboration and a stronger engineering culture.'
        ]
      }
    ]
  }
} as const

const currentResume = computed(() => resumeCopies[locale.value])

useHead(() => ({
  title: currentResume.value.metaTitle,
  meta: [
    {
      name: 'description',
      content: currentResume.value.metaDescription
    }
  ]
}))

const setLocale = (nextLocale: Locale) => {
  locale.value = nextLocale
}
</script>

<template>
  <main class="cv-page">
    <section class="cv-hero" aria-labelledby="resume-name">
      <div class="hero-main">
        <div class="language-switch print-hidden" role="group" :aria-label="currentResume.languageLabel">
          <button
            type="button"
            :class="{ active: locale === 'zh' }"
            :aria-pressed="locale === 'zh'"
            @click="setLocale('zh')"
          >
            中文
          </button>
          <button
            type="button"
            :class="{ active: locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="setLocale('en')"
          >
            English
          </button>
        </div>

        <p class="hero-kicker">{{ currentResume.kicker }}</p>
        <h1 id="resume-name">{{ currentResume.name }}</h1>
        <p class="headline">{{ currentResume.headline }}</p>
        <p class="status-line">{{ currentResume.status }}</p>
        <p class="summary">{{ currentResume.summary }}</p>
      </div>

      <figure class="portrait-wrap">
        <img :src="photoUrl" alt="董佳辉 Tung Chia-hui" loading="eager" decoding="async">
      </figure>
    </section>

    <section class="metric-grid" aria-label="resume highlights">
      <div v-for="metric in currentResume.metrics" :key="metric.label" class="metric-item">
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.label }}</span>
      </div>
    </section>

    <div class="resume-layout">
      <aside class="resume-sidebar">
        <section class="side-section">
          <h2>{{ currentResume.contactTitle }}</h2>
          <div class="contact-list">
            <component
              :is="item.href ? 'a' : 'div'"
              v-for="item in currentResume.contact"
              :key="item.label"
              class="contact-row"
              :href="item.href || undefined"
              :target="item.href ? '_blank' : undefined"
              :rel="item.href ? 'noopener noreferrer' : undefined"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </component>
          </div>
        </section>

        <section class="side-section">
          <h2>{{ currentResume.skillsTitle }}</h2>
          <div class="skill-groups">
            <section v-for="group in currentResume.skillGroups" :key="group.title" class="skill-group">
              <h3>{{ group.title }}</h3>
              <div class="tag-list">
                <span v-for="tag in group.tags" :key="tag">{{ tag }}</span>
              </div>
            </section>
          </div>
        </section>
      </aside>

      <div class="resume-main">
        <section class="resume-section">
          <div class="section-heading">
            <span></span>
            <h2>{{ currentResume.educationTitle }}</h2>
          </div>

          <article v-for="item in currentResume.education" :key="item.school" class="timeline-item">
            <div class="timeline-meta">{{ item.period }}</div>
            <div class="timeline-content">
              <h3>{{ item.school }}</h3>
              <p class="timeline-role">{{ item.college }}</p>
              <p class="timeline-major">{{ item.major }}</p>
              <ul>
                <li v-for="detail in item.details" :key="detail">{{ detail }}</li>
              </ul>
            </div>
          </article>
        </section>

        <section class="resume-section">
          <div class="section-heading">
            <span></span>
            <h2>{{ currentResume.experienceTitle }}</h2>
          </div>

          <article v-for="item in currentResume.experience" :key="item.title" class="timeline-item">
            <div class="timeline-meta">{{ item.period }}</div>
            <div class="timeline-content">
              <h3>{{ item.title }}</h3>
              <p class="timeline-role">{{ item.role }}</p>
              <ul>
                <li v-for="bullet in item.bullets" :key="bullet">{{ bullet }}</li>
              </ul>
            </div>
          </article>
        </section>

        <section class="resume-section">
          <div class="section-heading">
            <span></span>
            <h2>{{ currentResume.awardsTitle }}</h2>
          </div>

          <ul class="award-list">
            <li v-for="award in currentResume.awards" :key="award">{{ award }}</li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.cv-page {
  width: min(1160px, 100%);
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  color: var(--text-main);
}

.cv-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
  gap: 2rem;
  align-items: stretch;
  padding: 2rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), transparent 38%),
    linear-gradient(315deg, rgba(180, 83, 9, 0.08), transparent 34%),
    var(--bg-secondary);
}

.hero-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.language-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(88px, 1fr));
  align-self: flex-start;
  padding: 0.25rem;
  margin-bottom: 2.1rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-color);
}

.language-switch button {
  min-height: 2.25rem;
  padding: 0 0.9rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.language-switch button.active {
  background: #0f766e;
  color: #fff;
}

.hero-kicker {
  margin: 0 0 0.7rem;
  color: #0f766e;
  font-size: 0.84rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.cv-hero h1 {
  margin: 0;
  font-size: clamp(2.4rem, 7vw, 4.7rem);
  line-height: 1;
  letter-spacing: 0;
}

.headline {
  margin: 0.9rem 0 0;
  font-size: clamp(1.25rem, 2.5vw, 1.8rem);
  font-weight: 900;
  color: var(--text-main);
}

.status-line {
  margin: 0.6rem 0 0;
  color: #b45309;
  font-weight: 850;
}

.summary {
  max-width: 720px;
  margin: 1.3rem 0 0;
  color: var(--text-secondary);
  font-size: 1.02rem;
  line-height: 1.85;
}

.portrait-wrap {
  position: relative;
  min-height: 420px;
  margin: 0;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #d7c8bd;
}

.portrait-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  margin: 1rem 0;
}

.metric-item {
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-color);
}

.metric-item strong {
  display: block;
  color: #0f766e;
  font-size: 1.45rem;
  line-height: 1.15;
}

.metric-item span {
  display: block;
  margin-top: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.45;
}

.resume-layout {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.resume-sidebar,
.resume-main {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.side-section,
.resume-section {
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-color);
}

.side-section {
  padding: 1.1rem;
}

.side-section h2 {
  margin: 0 0 0.9rem;
  color: var(--text-main);
  font-size: 1rem;
}

.contact-list {
  display: grid;
  gap: 0.65rem;
}

.contact-row {
  display: grid;
  gap: 0.18rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--nav-border);
  color: inherit;
  text-decoration: none;
}

.contact-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.contact-row span {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.contact-row strong {
  min-width: 0;
  margin: 0;
  color: var(--text-main);
  font-size: 0.95rem;
  overflow-wrap: anywhere;
}

.contact-row:hover strong {
  color: #0f766e;
}

.skill-groups {
  display: grid;
  gap: 1rem;
}

.skill-group h3 {
  margin: 0 0 0.55rem;
  color: #92400e;
  font-size: 0.92rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tag-list span {
  display: inline-flex;
  align-items: center;
  min-height: 1.9rem;
  padding: 0 0.62rem;
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: var(--text-main);
  font-size: 0.82rem;
  font-weight: 700;
}

.resume-section {
  padding: 1.3rem;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.1rem;
}

.section-heading span {
  width: 0.55rem;
  height: 1.8rem;
  border-radius: 999px;
  background: #0f766e;
}

.section-heading h2 {
  margin: 0;
  font-size: 1.35rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 9.5rem minmax(0, 1fr);
  gap: 1.1rem;
  padding: 1.1rem 0;
  border-top: 1px solid var(--nav-border);
}

.timeline-item:first-of-type {
  padding-top: 0;
  border-top: 0;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-meta {
  color: #0f766e;
  font-size: 0.92rem;
  font-weight: 900;
  line-height: 1.6;
}

.timeline-content h3 {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.45;
}

.timeline-role,
.timeline-major {
  margin: 0.3rem 0 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.timeline-role {
  color: #92400e;
  font-weight: 850;
}

.timeline-content ul,
.award-list {
  display: grid;
  gap: 0.55rem;
  margin: 0.75rem 0 0;
  padding-left: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.award-list {
  margin-top: 0;
}

@media (max-width: 900px) {
  .cv-hero,
  .resume-layout {
    grid-template-columns: 1fr;
  }

  .portrait-wrap {
    order: -1;
    min-height: 0;
    aspect-ratio: 4 / 3;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .cv-page {
    padding: 1rem 0.25rem 3rem;
  }

  .cv-hero,
  .resume-section,
  .side-section {
    padding: 1rem;
  }

  .language-switch {
    width: 100%;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
}

@media print {
  .cv-page {
    width: 100%;
    padding: 0;
  }

  .print-hidden,
  :global(.site-header),
  :global(.music-player) {
    display: none !important;
  }

  .cv-hero,
  .metric-item,
  .side-section,
  .resume-section {
    break-inside: avoid;
    box-shadow: none;
  }

  .resume-layout {
    grid-template-columns: 0.82fr 1.38fr;
  }
}
</style>

<style>
html.dark .cv-page .cv-hero {
  background:
    linear-gradient(135deg, rgba(45, 212, 191, 0.09), transparent 38%),
    linear-gradient(315deg, rgba(251, 191, 36, 0.09), transparent 34%),
    var(--bg-secondary);
}

html.dark .cv-page .language-switch {
  background: rgba(15, 23, 42, 0.7);
}

html.dark .cv-page .hero-kicker,
html.dark .cv-page .metric-item strong,
html.dark .cv-page .timeline-meta,
html.dark .cv-page .contact-row:hover strong {
  color: #5eead4;
}

html.dark .cv-page .status-line,
html.dark .cv-page .timeline-role,
html.dark .cv-page .skill-group h3 {
  color: #fbbf24;
}

html.dark .cv-page .tag-list span {
  border-color: rgba(94, 234, 212, 0.22);
  background: rgba(94, 234, 212, 0.08);
}
</style>

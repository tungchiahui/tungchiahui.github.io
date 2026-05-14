// 维护方式：
// 1. 新增阶段，只改 routeSections
// 2. 新增任务，只改 routeTasks
// 3. 页面上的汇总、优先级、统计都从任务数据自动生成

export const routeIntro = {
  badge: '个人技术路线清单',
  title: '机器人系统技术成长路线',
  summary:
    '这是一份记录我长期学习方向的路线清单：把底盘控制、传感器接入、定位建图、导航避障、视觉感知、机械臂规划和部署能力串起来。',
  mainTrack: '移动机器人 SLAM / 导航 / ros2_control / 多传感器融合 / 实车部署',
  sideTrack: '3D LiDAR SLAM / 视觉感知 / MoveIt2 / 嵌入式 Linux / Jetson TensorRT 部署',
  finalGoal:
    '把机器人项目从能跑做成能稳定维护、能复现、能迭代的个人长期能力栈。'
}

export const routeSections = [
  {
    id: 'foundation',
    stage: '阶段 01',
    title: '机器人系统基础',
    focus: '先把工程地基打牢，确保后续每个模块都能稳定调试、复现和维护。',
    modules: ['C++11/14/17', 'STL', '多线程', 'CMake', 'Linux', 'shell', 'udev', 'systemd', 'ROS2', 'TF', 'odom', 'rosbag2'],
    deliverables: ['形成 ROS2 工作空间模板', '能独立排查 TF、时间戳、设备权限、日志问题', '写出可维护的 C++ 功能包']
  },
  {
    id: 'control',
    stage: '阶段 02',
    title: '底盘控制与 ros2_control',
    focus: '把上位机运动学、控制器管理和 STM32 电机闭环接起来，形成标准化移动底盘。',
    modules: ['ros2_control', 'mecanum_drive_controller', 'hardware_interface', 'encoder', 'serial', 'CAN', 'STM32 PID'],
    deliverables: ['自定义四轮麦克纳姆硬件接口', '完成 vx/vy/wz 到四轮速度控制', '输出 joint_states、odom 与 TF']
  },
  {
    id: 'nav2d',
    stage: '阶段 03',
    title: '2D SLAM 与自主导航',
    focus: '完成地面移动机器人的基础闭环：建图、定位、路径规划、避障和导航调参。',
    modules: ['slam_toolbox', 'Cartographer', 'Nav2', 'AMCL', 'map_server', 'costmap', 'robot_localization', 'IMU EKF'],
    deliverables: ['完成 2D LiDAR 建图与地图保存', '跑通 Nav2 点目标导航', '对比融合前后的 odom 轨迹']
  },
  {
    id: 'lidar3d',
    stage: '阶段 04',
    title: '3D SLAM 与点云导航',
    focus: '从 2D 升级到 3D LiDAR-IMU 建图，并让三维障碍物服务于地面机器人导航。',
    modules: ['PCL', 'voxel grid', 'ground segmentation', 'ICP', 'NDT', 'FAST-LIO2', 'voxel_layer', 'pointcloud_to_laserscan'],
    deliverables: ['采集并跑通 3D LiDAR + IMU 数据', '保存点云地图', '实现 3D 点云投影到 2D costmap']
  },
  {
    id: 'vision',
    stage: '阶段 05',
    title: '视觉感知与三维融合',
    focus: '为视觉 SLAM、动态障碍物检测和后续抓取任务准备视觉感知能力。',
    modules: ['OpenCV', 'camera calibration', 'ORB', 'PnP', 'RANSAC', 'cv_bridge', 'YOLO', 'RGB-D', 'FAST-LIVO2'],
    deliverables: ['完成相机标定与畸变矫正', 'YOLO 检测结果发布到 ROS2', '跑通 LiDAR + IMU + Camera 融合建图']
  },
  {
    id: 'manipulation',
    stage: '阶段 06',
    title: '机械臂与移动操作',
    focus: '把底盘导航、机械臂运动规划、视觉识别和 TF 坐标系统整合成移动操作能力。',
    modules: ['URDF', 'xacro', 'SRDF', 'MoveIt2', 'joint_trajectory_controller', 'Gazebo', 'RGB-D grasping'],
    deliverables: ['完成 6 自由度机械臂仿真规划', '接入真实机械臂控制链路', '实现导航、识别、抓取、搬运、放置闭环']
  },
  {
    id: 'deployment',
    stage: '阶段 07',
    title: '部署与高性能计算',
    focus: '把算法从实验环境推进到真实计算平台，关注性能、稳定性、日志和可维护性。',
    modules: ['Jetson', 'RK3588', 'Docker', 'CUDA', 'TensorRT', 'Isaac ROS', 'nvblox', 'cuVSLAM', 'NITROS'],
    deliverables: ['在 Jetson 部署 ROS2 与 YOLO', '测试 FPS、延迟、CPU/GPU 占用', '沉淀 systemd 服务和部署文档']
  }
]

export const routeTasks = [
  {
    id: 'task-01',
    order: 1,
    section: 'foundation',
    title: '搭建可复用的 ROS2 工作空间模板',
    goal: '把后续每个机器人项目的基础目录和编译方式统一起来。',
    priority: 'core',
    status: 'todo',
    stack: ['ROS2', 'CMake', 'colcon', 'Linux'],
    checklist: ['统一 package 命名', '整理编译脚本', '预留 launch 和 config 目录']
  },
  {
    id: 'task-02',
    order: 2,
    section: 'foundation',
    title: '补齐 Linux 调试与设备管理习惯',
    goal: '把串口、权限、日志、服务启动这些底层问题变成日常操作。',
    priority: 'core',
    status: 'todo',
    stack: ['Linux', 'udev', 'systemd', 'shell'],
    checklist: ['熟悉 udev 规则', '整理 systemd 启动样例', '补一份常用排障清单']
  },
  {
    id: 'task-03',
    order: 3,
    section: 'control',
    title: '完成四轮麦克纳姆底盘硬件接口',
    goal: '把轮速控制、编码器反馈和 TF 输出统一起来。',
    priority: 'core',
    status: 'doing',
    stack: ['ros2_control', 'hardware_interface', 'STM32', 'CAN'],
    checklist: ['实现 write()', '实现 read()', '打通 joint_states 和 odom']
  },
  {
    id: 'task-04',
    order: 4,
    section: 'control',
    title: '打通底盘速度解算与电机闭环',
    goal: '让 vx / vy / wz 真正变成四个轮子的控制量。',
    priority: 'core',
    status: 'todo',
    stack: ['mecanum_drive_controller', 'encoder', 'PID'],
    checklist: ['确认运动学公式', '校准轮径和轮距', '检查编码器单位换算']
  },
  {
    id: 'task-05',
    order: 5,
    section: 'nav2d',
    title: '完成 2D LiDAR 建图与地图保存',
    goal: '先把 2D 地图跑稳，再接定位和导航。',
    priority: 'core',
    status: 'todo',
    stack: ['2D LiDAR', 'slam_toolbox', 'Cartographer'],
    checklist: ['建立 laser TF', '录制 rosbag', '保存和回放地图']
  },
  {
    id: 'task-06',
    order: 6,
    section: 'nav2d',
    title: '跑通 Nav2 点目标导航',
    goal: '让小车从任意起点稳定到达目标点。',
    priority: 'core',
    status: 'todo',
    stack: ['Nav2', 'AMCL', 'costmap', 'RViz2'],
    checklist: ['调 global costmap', '调 local costmap', '检查目标点到达逻辑']
  },
  {
    id: 'task-07',
    order: 7,
    section: 'nav2d',
    title: '融合轮速里程计与 IMU',
    goal: '提升轨迹稳定性，减少纯轮速累积误差。',
    priority: 'core',
    status: 'todo',
    stack: ['robot_localization', 'EKF', 'wheel odom', 'IMU'],
    checklist: ['确认 IMU 坐标轴', '检查时间戳同步', '对比融合前后轨迹']
  },
  {
    id: 'task-08',
    order: 8,
    section: 'lidar3d',
    title: '跑通 FAST-LIO2 三维建图',
    goal: '把三维激光和 IMU 接起来，先让轨迹和地图稳定出现。',
    priority: 'core',
    status: 'todo',
    stack: ['FAST-LIO2', '3D LiDAR', 'IMU', 'PCL'],
    checklist: ['跑官方数据集', '采集自有数据', '检查外参和时间戳']
  },
  {
    id: 'task-09',
    order: 9,
    section: 'lidar3d',
    title: '把 3D 点云接入 2D costmap',
    goal: '让 3D 感知真正服务地面机器人避障。',
    priority: 'important',
    status: 'todo',
    stack: ['voxel_layer', 'pointcloud_to_laserscan', 'costmap'],
    checklist: ['点云滤波', '地面分割', '障碍物投影']
  },
  {
    id: 'task-10',
    order: 10,
    section: 'vision',
    title: '完成 OpenCV 图像处理基础包',
    goal: '把标定、矫正、特征点和匹配流程整理成可复用模块。',
    priority: 'core',
    status: 'todo',
    stack: ['OpenCV', 'cv_bridge', 'camera calibration'],
    checklist: ['接入相机话题', '完成畸变矫正', '做 ORB / PnP demo']
  },
  {
    id: 'task-11',
    order: 11,
    section: 'vision',
    title: '把 YOLO 接进 ROS2 图像流',
    goal: '让检测结果能在机器人系统里被订阅和复用。',
    priority: 'important',
    status: 'todo',
    stack: ['YOLO', 'ROS2', 'RGB-D', 'RViz Marker'],
    checklist: ['发布检测 topic', '可视化检测框', '记录推理延迟']
  },
  {
    id: 'task-12',
    order: 12,
    section: 'manipulation',
    title: '完成 MoveIt2 机械臂仿真规划',
    goal: '先把机械臂的规划、碰撞检测和轨迹执行跑顺。',
    priority: 'important',
    status: 'todo',
    stack: ['MoveIt2', 'URDF', 'SRDF', 'joint_trajectory_controller'],
    checklist: ['搭建机械臂模型', '配置规划组', '执行仿真轨迹']
  },
  {
    id: 'task-13',
    order: 13,
    section: 'deployment',
    title: '整理个人机器人项目归档',
    goal: '把所有项目变成能快速找、快速改、快速复现的归档系统。',
    priority: 'core',
    status: 'todo',
    stack: ['README', '架构图', '演示视频', 'rosbag', '参数文件'],
    checklist: ['统一 README 模板', '补录复盘笔记', '整理配置和数据']
  }
]

export const priorityConfig = {
  core: {
    label: '主线必做',
    tone: 'core',
    description: '个人路线里的主干任务，优先保证能跑通、能复现、能长期维护。'
  },
  important: {
    label: '建议推进',
    tone: 'important',
    description: '能明显增强路线完整性，适合在主干任务稳定后持续补齐。'
  },
  optional: {
    label: '扩展探索',
    tone: 'optional',
    description: '有设备和时间再补，更多是拓宽能力边界。'
  }
}

export const taskStatusConfig = {
  todo: { label: '待开始', color: '#64748b' },
  doing: { label: '进行中', color: '#0f9f7a' },
  done: { label: '已完成', color: '#2563eb' }
}

export const routeProgressStats = [
  { value: String(routeSections.length), label: '阶段', caption: '按能力链分层维护' },
  { value: String(routeTasks.length), label: '任务', caption: '所有任务来自同一份清单' },
  { value: String(routeTasks.filter(task => task.priority === 'core').length), label: '主线', caption: '先稳住的核心项目' },
  { value: String(routeTasks.filter(task => task.status === 'doing').length), label: '进行中', caption: '当前正在推进' }
]

export const routePriorityGroups = [
  {
    title: '主线必做',
    priority: 'core',
    items: routeTasks.filter(task => task.priority === 'core').map(task => task.title)
  },
  {
    title: '建议推进',
    priority: 'important',
    items: routeTasks.filter(task => task.priority === 'important').map(task => task.title)
  },
  {
    title: '扩展探索',
    priority: 'optional',
    items: routeTasks.filter(task => task.priority === 'optional').map(task => task.title)
  }
]

export const portfolioTracks = [
  {
    title: '移动底盘导航线',
    description: '把底盘、控制、定位和导航做成稳定的个人系统能力。',
    skills: ['ros2_control', '麦克纳姆底盘', '2D SLAM', 'Nav2', 'robot_localization']
  },
  {
    title: '三维感知建图线',
    description: '展示 3D LiDAR、点云处理和多传感器融合能力。',
    skills: ['FAST-LIO2', 'PCL', '3D 点云辅助导航', 'FAST-LIVO2', '外参标定']
  },
  {
    title: '移动操作线',
    description: '把感知、导航、机械臂规划和部署串成完整机器人任务。',
    skills: ['MoveIt2', '机械臂', 'YOLO', 'RGB-D', '视觉抓取', '移动机械臂']
  }
]

export const knowledgeTags = [
  {
    title: '工程基础',
    keywords: ['C++', 'Linux', 'CMake', 'gdb', 'shell', 'Docker', 'systemd']
  },
  {
    title: '机器人系统',
    keywords: ['ROS2', 'ros2_control', 'mecanum_drive_controller', 'hardware_interface', 'TF', 'odom', 'rosbag2']
  },
  {
    title: '硬件通信',
    keywords: ['STM32', 'CAN', '串口', '编码器', 'IMU', 'Jetson']
  },
  {
    title: '算法方向',
    keywords: ['2D SLAM', 'Nav2', 'robot_localization', 'PCL', 'FAST-LIO2', 'OpenCV', 'YOLO', 'MoveIt2', 'TensorRT']
  }
]

export const maintenanceNotes = [
  {
    title: '更新节奏',
    notes: ['优先更新任务状态', '阶段标题尽量稳定', '把变化记录在 checklist 里']
  },
  {
    title: '维护原则',
    notes: ['一项任务只写在一个地方', '汇总都从 routeTasks 自动生成', '新增内容尽量先补最小可用描述']
  },
  {
    title: '归档习惯',
    notes: ['README、架构图、视频、参数放在一起', '复盘文档按问题类型整理', '后面回看时只看这一页就能知道进度']
  }
]

export const featuredTools = [
  {
    name: 'C++',
    role: '核心开发语言',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg'
  },
  {
    name: 'Linux',
    role: '部署与调试环境',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg'
  },
  {
    name: 'ROS2',
    role: '机器人系统中枢',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Ros_logo.svg'
  },
  {
    name: 'OpenCV',
    role: '视觉感知基础',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg'
  },
  {
    name: 'STM32',
    role: '底盘电机控制',
    logo: 'https://www.st.com.cn/content/dam/st-crew/st-logo-blue.svg'
  },
  {
    name: 'Docker',
    role: '工程化部署',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'
  }
]

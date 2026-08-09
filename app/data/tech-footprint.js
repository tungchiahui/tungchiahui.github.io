export const routeIntro = {
  badge: '个人技术路线清单 · 2026—2029',
  title: '机器人系统软件研究生成长路线',
  summary: '以机器人系统软件为绝对主线，按“能力扩张 → 稳定化 → 测量瓶颈 → 再引入新技术”的节奏推进；研一完成 Cyber AMR，随后补齐 Cyber Arm，研二形成稳定、可量化、可恢复的 Cyber Mobile Manipulator。',
  mainTrack: 'Cyber AMR → Cyber Arm → Cyber Mobile Manipulator：STM32 / FreeRTOS → C++23 / Linux → ROS 2 / ros2_control → 状态估计与自主导航 → MoveIt 2 / RGB-D → 移动操作与任务恢复',
  sideTrack: '工业实时与运动控制基础：实时 Linux → EtherCAT → CiA 402 → 轨迹规划 → 单轴伺服与故障安全；只做能力补充，不建设第二个同规模大型项目',
  researchTrack: '科研围绕真实移动操作机器人展开：优先考虑导航误差下的工位视觉精对位与抓取补偿，其次考虑多传感器融合定位、退化或动态环境中的导航鲁棒性；最终只选一个核心问题深入',
  finalGoal: '形成贯通嵌入式底层、Linux C++ 驱动、ROS 2、定位导航、机械臂操作与任务执行的完整机器人系统能力；最终成果必须同时具备实机演示、连续测试、量化指标、失败分析、自动恢复、完整文档与科研结果。'
}

export const tracks = {
  robot: { label: '机器人系统主线', title: 'Cyber AMR → Cyber Arm → Cyber Mobile Manipulator', color: '#0f9f7a' },
  motion: { label: '工业控制副线', title: '工业实时与运动控制基础', color: '#2563eb' },
  research: { label: '科研线', title: '移动操作机器人的定位、导航与操作可靠性', color: '#b7791f' }
}

const task = (id, track, title, goal, stack, subtasks) => ({ id, track, title, goal, stack, subtasks })
const sub = (id, title, acceptance = '') => ({ id, title, acceptance })

export const semesterPlans = [
  {
    id: 'y1a',
    stage: '研一上',
    date: '2026.09—2027.01',
    focus: '以课程为主，先打牢现代 C++、Linux、STM32 和 ROS 2 硬件接入链路；暂时不追机械臂实机、VLA、3DGS 等高级功能',
    milestone: 'Cyber AMR v0.5：STM32 → C++ Driver → ros2_control 完整打通',
    allocation: [70, 5, 25],
    tasks: [
      task('cpp-linux', 'robot', '夯实现代 C++ 与 Linux 工程基础', '为后续所有机器人模块建立统一、可维护、可测试的工程规范。', ['C++23', 'CMake', 'Linux', 'Git', 'GoogleTest', 'GDB'], [
        sub('cpp', '掌握 RAII、智能指针、移动语义、常用 STL 与错误处理'),
        sub('concurrency', '掌握线程、mutex、condition_variable、atomic 与常见并发问题'),
        sub('cmake', '掌握 target、库组织、依赖传递、install / export 与 find_package'),
        sub('test', '使用 GoogleTest 建立单元测试，并接入基础 CI'),
        sub('debug', '使用 GDB、Sanitizer、日志和 core dump 定位内存与并发问题')
      ]),
      task('stm32', 'robot', '重构 Cyber AMR 的 STM32 底层', '形成稳定、安全、可测量的四电机控制固件。', ['STM32', 'FreeRTOS', 'PID', 'Encoder', 'UART', 'CAN'], [
        sub('rtos', '重新划分 FreeRTOS 任务、优先级、中断与控制周期'),
        sub('encoder', '完成编码器采集、轮速计算、单位和方向校验'),
        sub('pid', '完成四电机速度 PID、输出限幅、Anti-windup 与基础前馈', '保留阶跃、稳态误差、负载扰动和四轮一致性曲线'),
        sub('ramp', '加入目标速度斜坡，避免速度指令突变带来的冲击'),
        sub('safety', '完成通信超时停车、Watchdog、故障状态、急停和安全启动')
      ]),
      task('protocol', 'robot', '建立跨平台 Robot Protocol', '让 STM32 与 Linux 共用同一套协议核心源码，并保持协议层与传输方式解耦。', ['C++23', 'CRC16', 'std::array', 'std::span'], [
        sub('frame', '确定帧头、版本、长度、序号、CMD、Payload、CRC 和帧尾'),
        sub('codec', '实现无动态内存依赖的打包与解包接口'),
        sub('parser', '实现流式 Frame Parser，处理半帧、粘包、拆包、多帧和重新同步'),
        sub('platform', '确保协议核心不依赖 ROS 2、Boost.Asio、STM32 HAL 和 FreeRTOS'),
        sub('test-protocol', '为 CRC、Codec 和 Parser 建立边界与错误输入测试')
      ]),
      task('driver', 'robot', '完成 Cyber AMR 的纯 C++ Linux Driver', '把串口通信、设备状态和故障处理封装成不依赖 ROS 2 的设备驱动。', ['C++23', 'Boost.Asio', 'GoogleTest'], [
        sub('transport', '完成 Boost.Asio 异步串口读写和线程模型'),
        sub('reconnect', '完成断连检测、自动重连、超时与 Heartbeat'),
        sub('state', '建立电机、编码器、IMU、故障和 Driver 状态接口'),
        sub('config', '建立 DriverConfig / SerialConfig，由上层负责参数来源'),
        sub('driver-test', '测试串口异常、错误帧、MCU 重启和 Driver 生命周期')
      ]),
      task('ros2-control', 'robot', '完成 Cyber AMR 的 ros2_control 接入', '确定正式机器人系统的硬件控制入口，并让 ROS 2 只作为 Driver 的适配层。', ['ROS 2', 'ros2_control', 'pluginlib', 'TF2'], [
        sub('hardware', '实现 ros2_control SystemInterface、生命周期、read() 与 write()'),
        sub('interfaces', '导出轮速 Command Interface 和关节 State Interface'),
        sub('controller', '接入 controller_manager、joint_state_broadcaster 与麦轮控制器'),
        sub('params', '使用 URDF / YAML / launch 配置硬件参数和控制器参数'),
        sub('bringup', '完成一键启动并验证 ROS 2 → Driver → STM32 完整链路')
      ]),
      task('slam-theory-1', 'research', '补齐状态估计与 SLAM 数学基础', '先建立能读懂论文、理解 EKF 并定位工程问题的理论底座。', ['Linear Algebra', 'Probability', 'SO(3)', 'SE(3)', 'EKF'], [
        sub('linear', '复习线性代数、最小二乘与 Jacobian'),
        sub('probability', '掌握高斯分布、协方差和贝叶斯估计'),
        sub('lie', '掌握四元数、旋转矩阵、SO(3)、SE(3) 和坐标变换'),
        sub('ekf-note', '手推并实现一个小型 EKF 示例', '能够解释状态、预测、观测、Q 和 R 的含义')
      ])
    ]
  },

  {
    id: 'winter1',
    stage: '研一寒假',
    date: '2027.01—2027.02',
    focus: '停止扩张功能，对 Cyber AMR v0.5 做第一次正式可靠性验收，同时建立实时 Linux 基线',
    milestone: 'Cyber AMR v0.5 Stable：底层异常处理、连续运行和实时性基线完成',
    allocation: [65, 20, 15],
    tasks: [
      task('freeze-v05', 'robot', '系统化测试 Cyber AMR v0.5', '用连续测试和故障复盘证明底层系统可靠，而不是只证明它能动。', ['GoogleTest', 'rosbag', 'Logging'], [
        sub('packet', '测试 CRC 错误、数据截断、半帧、多帧和异常输入'),
        sub('disconnect', '测试 USB 串口拔插、STM32 重启、Linux Driver 重启和自动重连'),
        sub('timeout', '验证通信超时停车、Watchdog 和异常退出后的安全状态'),
        sub('load', '在高 CPU、高 I/O 和日志压力下测试通信与控制稳定性'),
        sub('review', '整理“测试条件 → 失败现象 → 根因 → 修复 → 回归测试”记录')
      ]),
      task('rtlinux', 'motion', '建立实时 Linux 基础实验', '了解 Linux 调度和内存行为对控制周期抖动的影响，不把它扩成第二个大型项目。', ['SCHED_FIFO', 'CPU Affinity', 'mlockall', 'PREEMPT_RT'], [
        sub('normal', '测量普通线程控制循环的周期抖动基线'),
        sub('fifo', '对比普通调度与 SCHED_FIFO'),
        sub('affinity', '测试 CPU Affinity 和线程拆分'),
        sub('memory', '测试 mlockall 与缺页对实时性的影响'),
        sub('jitter', '统计平均延迟、最大延迟和超期次数并形成对比图')
      ]),
      task('docs-v05', 'research', '整理第一阶段技术文档与复盘', '把研一上形成的架构、测试方法和理论笔记沉淀下来。', ['Markdown', 'Architecture', 'Metrics'], [
        sub('architecture', '整理软件架构图、线程图、通信协议图和 TF 规划'),
        sub('metrics', '统一保存 PID、通信和实时性实验数据'),
        sub('review-note', '总结当前系统最大风险和研一下最优先解决的问题')
      ])
    ]
  },

  {
    id: 'y1b',
    stage: '研一下',
    date: '2027.02—2027.07',
    focus: '从“可控底盘”升级成完整自主移动机器人，重点完成标定、EKF、2D SLAM、Nav2 和正式成功率测试；后半段开始 Cyber Arm 预研',
    milestone: 'Cyber AMR v1.0：EKF + 2D SLAM + Nav2 实机稳定',
    allocation: [75, 5, 20],
    tasks: [
      task('calibration', 'robot', '完成 Cyber AMR 整车标定', '先保证轮速、IMU、LiDAR、时间戳和 TF 可信，再做融合与导航。', ['TF2', 'IMU', 'LiDAR', 'Calibration'], [
        sub('wheel', '标定轮径、轮距、麦轮方向和编码器比例'),
        sub('imu', '校验 IMU 轴向、安装姿态和零偏'),
        sub('time', '检查传感器时间戳、发布频率和链路延迟'),
        sub('tree', '建立完整且无冲突的 TF 树'),
        sub('extrinsic', '完成 LiDAR 外参标定'),
        sub('motion-test', '完成直行、旋转、横移、矩形闭环和长距离运动测试')
      ]),
      task('ekf', 'research', '完成轮速里程计与 IMU 的 EKF 融合', '既会使用 robot_localization，也能解释状态、预测、观测和协方差调参逻辑。', ['robot_localization', 'EKF', 'TF2'], [
        sub('config', '完成 robot_localization 配置和坐标系检查'),
        sub('state', '明确状态变量、预测模型和观测模型'),
        sub('noise', '调试 Q、R 与各传感器 covariance'),
        sub('delay', '处理不同频率、延迟和异常观测'),
        sub('compare', '对比纯轮速里程计和 EKF 融合后的漂移、转角与闭环误差')
      ]),
      task('nav2', 'robot', '完成 2D SLAM 与 Nav2 实机闭环', '形成建图、定位、规划、局部避障、恢复和多点任务的完整自主导航能力。', ['slam_toolbox', 'AMCL', 'Nav2', 'Behavior Tree'], [
        sub('slam', '完成 slam_toolbox 建图、地图保存和重复建图一致性检查'),
        sub('amcl', '完成 AMCL 定位、初始定位和重定位'),
        sub('single', '完成单目标点到点导航'),
        sub('patrol', '完成多目标巡航和基础任务状态管理'),
        sub('dynamic', '验证动态障碍绕行和局部规划行为'),
        sub('recovery', '完成清图、重新规划和基础 Recovery'),
        sub('metrics', '正式统计导航成功率、到点误差、任务时间、Recovery 次数和资源占用', '简单室内场景正式测试不少于 30 次，目标成功率达到 95% 左右')
      ]),
      task('planning-lab', 'research', '补齐路径规划基础并理解 Nav2 插件体系', '避免只会调参数，能够解释当前机器人为什么选择对应规划与控制方法。', ['A*', 'D* Lite', 'Hybrid A*', 'Nav2'], [
        sub('astar', '自己实现二维 A* 小程序'),
        sub('dynamic-plan', '理解 D* Lite 的增量重规划思路'),
        sub('hybrid', '理解 Hybrid A* 的运动学约束与使用场景'),
        sub('nav2-plugin', '阅读 Nav2 Planner / Controller 插件接口'),
        sub('compare-plan', '对比不同规划与控制参数对路径质量、平滑性和成功率的影响')
      ]),
      task('arm-prep', 'robot', '开始 Cyber Arm 运动学与 MoveIt 2 预研', '在 Nav2 基本稳定后提前进入机械臂领域，为暑假仿真抓取做准备。', ['URDF', 'Xacro', 'KDL', 'Eigen', 'MoveIt 2'], [
        sub('urdf-arm', '建立机械臂 URDF / Xacro，理解 Link、Joint 和坐标系'),
        sub('fk', '使用 KDL 完成正运动学'),
        sub('ik', '使用 KDL 完成数值逆运动学，并处理不可达和关节限位'),
        sub('jacobian', '计算 Jacobian 并观察奇异位置'),
        sub('moveit-basic', '理解 MoveIt 2、Planning Group、Planning Scene 和控制器关系'),
        sub('pose-goal', '在仿真中给定末端 Pose，完成一次规划与到达')
      ]),
      task('realtime-chassis', 'motion', '把实时性实验落到底盘上', '只验证调度和负载对实际底盘软件的影响，不扩展成独立运动控制项目。', ['SCHED_FIFO', 'PREEMPT_RT', 'Threads'], [
        sub('split', '梳理通信、ROS 2、诊断和日志线程边界'),
        sub('load', '在高负载下测试 Driver 与 ros2_control 稳定性'),
        sub('rt', '条件允许时测试 PREEMPT_RT，并记录是否对当前系统有实际收益')
      ])
    ]
  },

  {
    id: 'summer1',
    stage: '研一暑假',
    date: '2027.07—2027.09',
    focus: '冻结 Cyber AMR v1.0 并完成工程化发布；正式推进 Cyber Arm，在仿真中完成固定场景 Pick & Place，同时把科研问题收窄到少数可执行候选',
    milestone: 'Cyber AMR v1.0 Release + Cyber Arm v0.5 Simulation',
    allocation: [70, 5, 25],
    tasks: [
      task('engineering', 'robot', '发布 Cyber AMR v1.0 工程化版本', '让移动机器人项目可复现、可长期维护、可测试，并具备正式作品集基础。', ['Docker', 'CI', 'systemd', 'udev', 'rosbag'], [
        sub('readme', '重写 README，补齐架构图、线程图、TF 图、接线图和部署说明'),
        sub('docker', '整理 Docker 开发与部署环境'),
        sub('ci', '完善 GitHub Actions 与 GoogleTest'),
        sub('boot', '配置 systemd 自启动和 udev 规则'),
        sub('diagnostics', '完善 diagnostics、日志和 rosbag 回放测试'),
        sub('release', '发布 Cyber AMR v1.0，并保留正式导航 Demo 和测试数据')
      ]),
      task('arm-moveit-sim', 'robot', '完成 Cyber Arm 的 MoveIt 2 仿真抓取', '从单纯运动学升级为完整机械臂规划、碰撞检测、执行与夹爪操作链路。', ['MoveIt 2', 'ros2_control', 'KDL', 'Gazebo / Isaac Sim'], [
        sub('srdf', '使用 MoveIt Setup Assistant 配置 SRDF 和 Planning Group'),
        sub('controller', '接入 joint_state_broadcaster 和 joint_trajectory_controller'),
        sub('planning-scene', '建立 Planning Scene、Collision Object 和基本碰撞约束'),
        sub('cpp-api', '使用 MoveIt 2 C++ 接口发送关节目标和末端 Pose 目标'),
        sub('pick-place', '完成接近、抓取、抬升、转移、放置和撤离完整流程'),
        sub('error-arm', '处理 IK 失败、规划失败、碰撞和执行超时'),
        sub('arm-metrics', '连续运行 20—30 次仿真 Pick & Place，并记录失败原因')
      ]),
      task('topic-survey', 'research', '收窄科研方向并选择基线', '把“大方向兴趣”变成 3 个能依托真实机器人开展实验的候选问题。', ['SLAM', 'Mobile Manipulation', 'Fine Alignment', 'Sensor Fusion'], [
        sub('review', '调研多传感器融合定位、退化环境、动态环境和 Mobile Manipulation 相关工作'),
        sub('alignment-survey', '重点调研工位定位、Fine Alignment、视觉伺服和抓取补偿'),
        sub('baseline', '选择 FAST-LIO2 或导师组现有系统作为三维定位基线'),
        sub('metrics', '为每个候选问题确定精度、成功率、鲁棒性、实时性等评价指标'),
        sub('candidates', '形成 3 个候选科研问题，并写清问题、已有方法、限制、实验平台和验证方案')
      ]),
      task('ethercat-study', 'motion', '补齐 EtherCAT 与 CiA 402 基础', '了解工业伺服通信与状态机，不急于购买多轴设备或建设独立平台。', ['EtherCAT', 'CiA 402', 'PDO', 'SDO'], [
        sub('pdo', '理解 PDO、SDO 和对象字典'),
        sub('dc', '理解 Distributed Clock 与同步概念'),
        sub('cia', '理解 CiA 402 状态机和常见工作模式'),
        sub('master', '了解 Linux EtherCAT 主站基本通信流程')
      ])
    ]
  },

  {
    id: 'y2a',
    stage: '研二上',
    date: '2027.09—2028.01',
    focus: '让 Cyber AMR 与 Cyber Arm 真正开始融合：完成机械臂实机、RGB-D 视觉、工位精对位和 FAST-LIO2 接入，并在年底正式确定一个科研问题',
    milestone: 'Cyber Mobile Manipulator v0.5：真机械臂视觉抓取 + 工位精对位 + 3D 定位',
    allocation: [55, 5, 40],
    tasks: [
      task('arm-hardware', 'robot', '完成 Cyber Arm 实机接入', '让真实机械臂通过 ros2_control 与 MoveIt 2 稳定执行轨迹和 Pick & Place。', ['MoveIt 2', 'ros2_control', 'Robot Arm SDK', 'C++23'], [
        sub('hardware-interface', '完成机械臂 Driver / SDK 与 ros2_control Hardware Interface 接入'),
        sub('joint-state', '处理关节反馈、软限位、状态诊断和急停'),
        sub('trajectory-exec', '完成轨迹执行、超时、停止和故障恢复'),
        sub('planning-real', '在真机上验证 Planning Scene、碰撞检测和 MoveIt 2 规划'),
        sub('pick-real', '完成固定工位真实 Pick & Place'),
        sub('arm-success', '正式连续测试不少于 30 次', '固定工位、固定目标条件下成功率目标达到 90% 左右')
      ]),
      task('rgbd', 'robot', '建立 RGB-D 视觉与手眼标定能力', '让 Cyber Arm 从固定坐标抓取升级到由视觉给出目标位姿。', ['OpenCV', 'RGB-D', 'PCL', 'TF2', 'AprilTag', 'PnP'], [
        sub('camera-model', '掌握相机模型、内参、畸变和深度数据基本处理'),
        sub('calibration', '完成相机内参、外参和 Hand-eye Calibration'),
        sub('pointcloud', '完成深度图、点云和坐标系转换'),
        sub('tag', '第一版使用 AprilTag / ArUco 稳定输出工位或目标 Pose'),
        sub('pnp', '掌握 PnP，并理解视觉位姿误差来源'),
        sub('vision-grasp', '打通“相机 → 目标 Pose → TF → MoveIt 2 → 抓取”链路')
      ]),
      task('fine-alignment', 'research', '实现 Cyber AMR 工位精对位', '解决 Nav2 能到达工位附近，但停车误差影响机械臂可达性和抓取成功率的问题。', ['Nav2', 'RGB-D', 'AprilTag', 'TF2'], [
        sub('coarse', '记录 Nav2 粗导航到工位后的原始位置和角度误差'),
        sub('relative-pose', '通过视觉估计机器人相对工位的 Pose'),
        sub('adjust', '实现低速底盘微调和再次观测闭环'),
        sub('threshold', '设计误差阈值、超时、目标丢失和重试逻辑'),
        sub('compare', '对比精对位前后的停车误差和抓取成功率变化')
      ]),
      task('lio', 'robot', '完成 FAST-LIO2 三维定位基线', '建立 Cyber AMR 的三维定位与点云环境感知能力，但不为了技术堆叠强行替换所有 2D 系统。', ['Mid-360', 'FAST-LIO2', 'PCL'], [
        sub('extrinsic-lio', '完成 LiDAR—IMU 外参和坐标系检查'),
        sub('sync-lio', '完成时间同步和初始化参数调试'),
        sub('mapping-lio', '稳定完成建图和长时间轨迹记录'),
        sub('localization', '跑通定位模式并评估长时间漂移'),
        sub('resource', '统计 CPU、内存、点云地图体积和实时性')
      ]),
      task('nav3d', 'robot', '让 FAST-LIO2 服务 Cyber AMR 导航', '把三维定位和点云环境信息转换为稳定的地面导航能力。', ['FAST-LIO2', 'Nav2', 'PCL'], [
        sub('filter', '完成点云裁剪、降采样和基础动态点处理'),
        sub('ground', '完成地面分割或地面过滤'),
        sub('costmap', '把三维障碍信息接入二维 Costmap'),
        sub('navigation', '完成 3D 定位 + 2D 规划的实机导航验证')
      ]),
      task('proposal', 'research', '正式确定科研问题并完成开题', '年底停止方向发散，只保留一个能在 Cyber Mobile Manipulator 真机上形成明确指标改善的问题。', ['Experiment', 'Baseline', 'Mobile Manipulation'], [
        sub('candidate-a', '优先评估“导航误差下的工位视觉精对位与抓取补偿”'),
        sub('candidate-b', '备选评估多传感器融合定位与复杂环境鲁棒性'),
        sub('candidate-c', '备选评估动态或退化环境下的定位导航稳定性'),
        sub('baseline-run', '稳定复现实验基线并确定数据采集方案'),
        sub('problem', '最终只确定 1 个核心科研问题和第一版方法假设'),
        sub('proposal-doc', '完成开题材料、实验计划和预期指标')
      ])
    ]
  },

  {
    id: 'winter2',
    stage: '研二寒假',
    date: '2028.01—2028.02',
    focus: '不增加新的高级技术，冻结基础设施，建立可重复实验流水线和完整 Failure Taxonomy',
    milestone: 'Cyber Mobile Manipulator Research Baseline：实验体系 + 失败分类完成',
    allocation: [40, 10, 50],
    tasks: [
      task('experiment-pipeline', 'research', '建立可重复实验流水线', '保证科研方法和系统参数每次修改后都能自动重新生成可比结果。', ['rosbag', 'Python', 'Metrics', 'Dataset'], [
        sub('bags', '整理公开数据、自采数据和 rosbag 目录规范'),
        sub('config-archive', '固定 Baseline 参数、配置文件和版本信息'),
        sub('metrics-auto', '自动计算轨迹误差、定位误差、成功率、运行时间和资源占用'),
        sub('plots', '自动生成主要实验图表和结果表'),
        sub('reproduce', '完成一键复现实验脚本')
      ]),
      task('failure-taxonomy', 'robot', '建立整机失败分类体系', '让每一次端到端任务失败都能够被归类、记录和复盘。', ['Logging', 'Diagnostics', 'Behavior Tree'], [
        sub('nav-failure', '定义定位丢失、规划失败、控制失败和到点误差等导航失败类型'),
        sub('align-failure', '定义目标未检测、Pose 误差和对位超时等精对位失败类型'),
        sub('manip-failure', '定义 IK、规划、执行、抓空和物体掉落等机械臂失败类型'),
        sub('perception-failure', '定义检测失败和位姿估计错误等视觉失败类型'),
        sub('hardware-failure', '定义通信、Driver、控制器和急停等硬件失败类型'),
        sub('failure-log', '统一记录任务编号、失败阶段、根因、是否恢复和最终结果')
      ]),
      task('motion-basic', 'motion', '补充工业运动控制基础', '利用寒假集中理解伺服状态机与轨迹规划，仍以小实验为主。', ['EtherCAT', 'CiA 402', 'Trajectory'], [
        sub('modes', '理解 Homing、CSP、CSV 等常见模式'),
        sub('trajectory', '实现梯形、五次多项式和 S 曲线的基础轨迹生成'),
        sub('servo-demo', '条件允许时完成单轴 EtherCAT 伺服使能、运动和 Fault Reset')
      ])
    ]
  },

  {
    id: 'y2b',
    stage: '研二下',
    date: '2028.02—2028.07',
    focus: '完成研究生阶段最重要的工程成果：让 Cyber Mobile Manipulator 真正实现“导航 → 精对位 → 视觉抓取 → 运输 → 放置 → 失败恢复”，同时形成科研论文结果',
    milestone: 'Cyber Mobile Manipulator v1.0 + 科研成果',
    allocation: [45, 10, 45],
    tasks: [
      task('mobile-manipulator', 'robot', '完成端到端移动操作任务', '实现“将 A 工位目标物体自主运输到 B 工位”的完整真实机器人任务。', ['Nav2', 'MoveIt 2', 'RGB-D', 'ROS 2 Action'], [
        sub('frames', '统一 map、base_link、机械臂、相机和末端执行器坐标系'),
        sub('navigate-a', '自主导航到 A 工位并进入可精对位区域'),
        sub('align-a', '完成视觉精对位并确认机械臂操作条件'),
        sub('detect-pick', '完成目标检测、位姿估计、抓取规划、抓取与抓取确认'),
        sub('transport', '携带目标物体导航到 B 工位'),
        sub('place', '完成 B 工位对位、放置和任务结果确认'),
        sub('demo', '形成完整端到端实机任务 Demo')
      ]),
      task('behavior-tree', 'robot', '建立任务管理与自动恢复逻辑', '从顺序执行脚本升级为能够发现失败、恢复、重试和继续执行的任务系统。', ['Behavior Tree', 'ROS 2 Action', 'Nav2', 'MoveIt 2'], [
        sub('actions', '封装导航、精对位、感知、抓取和放置等任务节点'),
        sub('timeout', '为关键步骤加入超时和状态检查'),
        sub('retry', '实现目标丢失、规划失败和抓取失败后的重试'),
        sub('fallback', '设计清图、重新规划、重新观测和重新抓取等 Fallback'),
        sub('estop', '接入急停和人工接管'),
        sub('recovery-metrics', '统计自动恢复次数、恢复成功率和额外任务时间')
      ]),
      task('system-metrics', 'robot', '系统化优化整机成功率', '不再以“还可以加什么技术”为中心，而是持续寻找当前最大的失败来源并针对性解决。', ['Metrics', 'Failure Analysis', 'Regression Test'], [
        sub('module-metrics', '分别统计导航、精对位、视觉、Cyber Arm Pick & Place 的模块成功率'),
        sub('e2e-metrics', '统计完整 Cyber Mobile Manipulator 端到端任务成功率'),
        sub('root-cause', '按 Failure Taxonomy 找出主要失败来源并排序'),
        sub('improve', '只为解决真实瓶颈引入新技术或修改系统'),
        sub('regression', '每次修改后重新执行固定测试集，避免局部优化破坏其他模块'),
        sub('target', '形成阶段性稳定版本', '目标：导航约 95%+、精对位约 90—95%、抓取约 85—90%、完整任务约 80—90%；这些只作为个人项目验收目标')
      ]),
      task('paper', 'research', '完成科研方法、实验与论文', '科研成果必须明确说明对真实 Cyber Mobile Manipulator 的实际改善。', ['Experiment', 'C++23', 'Python', 'Paper'], [
        sub('method', '2—3 月：稳定第一版方法并完成核心实现'),
        sub('compare', '3—4 月：完成 Baseline 与对比实验'),
        sub('ablation', '4—5 月：完成消融、复杂环境和实机实验'),
        sub('writing', '4—5 月：同步完成论文写作'),
        sub('submit', '5—6 月：投稿或形成稳定毕业成果'),
        sub('system-value', '用真实指标说明方法对定位、精对位、抓取或任务成功率的实际价值')
      ]),
      task('pinocchio', 'robot', '补齐 Pinocchio 动力学模型调用能力', '掌握机器人系统工程师需要的模型使用能力，但不把路线转成高级动力学研究。', ['Pinocchio', 'Eigen', 'URDF'], [
        sub('model', '从 URDF 构建 Pinocchio Model'),
        sub('fk-pin', '完成正运动学和 Jacobian 计算'),
        sub('rnea', '理解并调用 RNEA 逆动力学'),
        sub('crba', '理解并调用 CRBA 质量矩阵'),
        sub('gravity', '计算重力项并完成简单验证')
      ]),
      task('motion-demo', 'motion', '完成可选的单轴工业控制 Demo', '为运动控制岗位保留一个真实接口，但数量服从质量，绝不影响主项目和论文。', ['EtherCAT', 'CiA 402', 'Servo'], [
        sub('enable', '完成伺服使能、Fault Reset 和状态切换'),
        sub('home', '完成 Homing'),
        sub('mode', '完成位置或速度模式基本控制'),
        sub('profile', '发送一条可控轨迹并记录跟踪误差和周期抖动'),
        sub('optional-rule', '如果设备、时间或稳定性不足，允许只保留仿真和理论记录')
      ])
    ]
  },

  {
    id: 'summer2',
    stage: '研二暑假',
    date: '2028.07—2028.09',
    focus: '停止大规模增加功能，正式进入“可靠性 + 作品集 + 秋招”阶段；只有主系统稳定后，才允许做短期 VLM / VLA 工程化拓展',
    milestone: 'Cyber Mobile Manipulator v1.0 Stable + 秋招作品集冻结',
    allocation: [80, 5, 15],
    tasks: [
      task('stress-test', 'robot', '完成正式端到端压力测试', '把成功率、失败原因和恢复能力变成真正可以写进作品集的工程证据。', ['Metrics', 'Logging', 'Failure Analysis'], [
        sub('missions', '完成不少于 50 次正式完整任务，条件允许时冲击 100 次'),
        sub('records', '记录任务编号、成功 / 失败、失败阶段、根因、恢复情况和总耗时'),
        sub('statistics', '形成模块成功率、端到端成功率和失败类型占比'),
        sub('main-failures', '总结最主要的 3—5 类失败及对应改进'),
        sub('freeze', '冻结秋招演示版本和全部关键参数')
      ]),
      task('portfolio-ready', 'robot', '完成秋招级作品集', '让面试官能够快速理解系统架构、个人贡献、真实指标和故障处理能力。', ['GitHub', 'Video', 'Docs', 'Portfolio'], [
        sub('main-video', '制作约 2 分钟完整 Demo：任务下发 → 导航 → 精对位 → 抓取 → 运输 → 放置'),
        sub('amr-video', '整理 Cyber AMR 的 STM32、ros2_control、EKF、Nav2 和 FAST-LIO2 分模块演示'),
        sub('arm-video', '整理 Cyber Arm 的 MoveIt 2、标定、视觉抓取和异常处理演示'),
        sub('recovery-video', '展示至少一种真实失败和自动恢复过程'),
        sub('website', '完善网站和 GitHub 项目页，加入架构、指标、测试、Failure Analysis 和个人贡献'),
        sub('resume', '整理机器人系统软件主简历和运动控制副简历')
      ]),
      task('embodied-extension', 'robot', '可选的 VLM / VLA 工程化拓展', '只验证语言或视觉大模型如何安全调用现有机器人能力，不训练大模型，不破坏主系统稳定性。', ['VLM', 'VLA', 'ROS 2', 'Task Planning'], [
        sub('language', '把自然语言指令转换为结构化机器人任务'),
        sub('perception', '接入开放词汇检测或已有视觉模型接口'),
        sub('dispatch', '把结构化任务调度到 Nav2、感知和 MoveIt 2'),
        sub('guard', '保留动作限幅、超时、人工接管和传统任务逻辑兜底'),
        sub('scope', '总投入控制在约 2—3 周；若效果不稳定，只保留接口和 Demo，不继续扩张')
      ]),
      task('paper-freeze', 'research', '冻结科研成果和学位论文框架', '避免秋招期间继续反复修改研究方向。', ['Thesis', 'Archive'], [
        sub('result-freeze', '冻结主要实验结果、图表和结论'),
        sub('thesis-outline', '完成学位论文目录和各章节材料归档'),
        sub('code-archive', '整理科研代码、配置、数据和复现实验脚本')
      ]),
      task('motion-review', 'motion', '整理工业控制副线成果', '只保留对求职有价值的实时 Linux、EtherCAT、CiA 402 和轨迹实验记录。', ['Real-time Linux', 'EtherCAT', 'CiA 402'], [
        sub('summary', '整理实时性对比、协议状态机和单轴 Demo 结果'),
        sub('interview-note', '形成运动控制岗位可讲清楚的知识和实验清单')
      ])
    ]
  },

  {
    id: 'y3a',
    stage: '研三上',
    date: '2028.09—2029.01',
    focus: '秋招与学位论文并行，所有大型功能冻结；项目只允许修 Bug、补测试、整理文档和恢复演示',
    milestone: '获得目标 Offer + 学位论文完成 70%—80%',
    allocation: [45, 10, 45],
    tasks: [
      task('job-search', 'robot', '系统推进秋招投递与面试复盘', '主投机器人系统软件、ROS 2、AMR、机器人平台和移动操作相关岗位。', ['Resume', 'Interview', 'Portfolio'], [
        sub('target', '分层投递机器人系统软件、ROS 2、AMR、嵌入式 Linux、机器人平台和移动操作岗位'),
        sub('main-resume', '主简历突出 C++23、Linux、ROS 2、ros2_control、Nav2、MoveIt 2 和系统集成'),
        sub('motion-resume', '副简历突出 STM32、PID、实时 Linux、EtherCAT、CiA 402 和轨迹规划'),
        sub('review-job', '每轮面试后整理问题、暴露出的知识漏洞和下一轮补强项'),
        sub('offer-compare', '按岗位内容、成长性、稳定性、城市成本和长期方向比较 Offer')
      ]),
      task('interview-system', 'robot', '建立完整面试知识体系', '所有理论都尽量和自己的 Cyber AMR / Cyber Arm / Cyber Mobile Manipulator 实践联系起来。', ['C++23', 'Linux', 'ROS 2', 'Robotics'], [
        sub('cpp-interview', '系统复习 RAII、STL、智能指针、并发、内存和 CMake'),
        sub('linux-interview', '系统复习线程、调度、I/O、串口、网络、实时性和调试'),
        sub('ros2-interview', '系统复习 DDS、QoS、Executor、Callback Group、Action、Lifecycle、TF2 和 ros2_control'),
        sub('robotics-interview', '系统复习运动学、里程计、EKF、SLAM、规划、控制、MoveIt 2 和标定'),
        sub('design-interview', '重点准备“为什么这样分层、为什么失败、怎么定位、怎么恢复、如何量化”的系统设计问答')
      ]),
      task('thesis70', 'research', '完成学位论文主体', '2028 年底完成论文 70%—80%，避免毕业前集中赶工。', ['Thesis', 'Paper'], [
        sub('intro', '完成绪论和相关工作'),
        sub('system', '完成系统架构与实验平台章节'),
        sub('method-chapter', '完成方法章节'),
        sub('experiment-chapter', '完成主要实验和结果分析章节'),
        sub('figures', '统一图表、指标、术语和引用'),
        sub('advisor', '按导师意见持续迭代')
      ]),
      task('maintenance', 'motion', '冻结项目并只做维护', '所有项目不再开启新框架，只保证求职演示、论文实验和最终归档可用。', ['Archive', 'Demo', 'Backup'], [
        sub('bugfix', '只修复影响演示、测试和论文复现的 Bug'),
        sub('backup', '备份镜像、依赖、数据、rosbag 和关键模型'),
        sub('dependency', '冻结主要依赖版本和部署环境'),
        sub('handover', '提前整理代码说明和实验室交接材料')
      ])
    ]
  },

  {
    id: 'y3b',
    stage: '研三下',
    date: '2029.02—2029.06',
    focus: '完成盲审、答辩、毕业和三大项目最终归档，不再追逐任何新的技术热点',
    milestone: '论文定稿 + 答辩 + Cyber 系列项目最终归档',
    allocation: [10, 5, 85],
    tasks: [
      task('graduation', 'research', '完成学位论文与答辩', '把已有研究和系统成果完整、清晰地转化为学位论文和答辩材料。', ['Thesis', 'Defense'], [
        sub('draft', '完成学位论文完整定稿'),
        sub('review', '完成导师修改、格式检查、引用检查和盲审修改'),
        sub('defense', '准备答辩 PPT、讲稿、系统 Demo 和常见问答'),
        sub('final-paper', '完成最终论文、材料提交和毕业流程')
      ]),
      task('final-archive', 'robot', '完成 Cyber 系列项目最终归档', '让 Cyber AMR、Cyber Arm 和 Cyber Mobile Manipulator 在毕业后仍可复现、维护和展示。', ['GitHub', 'Docker', 'Archive'], [
        sub('amr-final', '归档 Cyber AMR 的 Firmware、Protocol、Driver、ros2_control、导航配置、测试和文档'),
        sub('arm-final', '归档 Cyber Arm 的模型、Driver、MoveIt 2、视觉、标定、测试和文档'),
        sub('mobile-final', '归档 Cyber Mobile Manipulator 的任务管理、精对位、感知、操作、Recovery、Metrics 和 Demo'),
        sub('data-final', '整理 Dataset、rosbag、实验结果、视频和论文材料'),
        sub('release-final', '发布最终 Release，并完成项目主页和作品集定稿'),
        sub('handover-final', '完成实验室项目交接')
      ]),
      task('career-review', 'motion', '完成研究生阶段技术路线复盘', '总结哪些能力形成了长期竞争力，哪些方向只需保留基础认知，为入职后的继续学习建立清晰边界。', ['Review', 'Career'], [
        sub('strength', '总结 C++ / Linux / ROS 2 / 系统集成方面的核心优势'),
        sub('research-review', '总结科研方法、实验设计和真实机器人验证能力'),
        sub('next', '根据最终岗位确定入职后继续深挖的方向')
      ])
    ]
  }
]

export const milestoneList = [
  ['2027.01', 'Cyber AMR v0.5：STM32 → C++ Driver → ros2_control 完整打通'],
  ['2027.02', 'Cyber AMR v0.5 Stable：可靠性与实时性基线完成'],
  ['2027.07', 'Cyber AMR v1.0：EKF + 2D SLAM + Nav2 实机稳定'],
  ['2027.09', 'Cyber AMR v1.0 Release + Cyber Arm v0.5 Simulation'],
  ['2028.01', 'Cyber Mobile Manipulator v0.5：真机械臂视觉抓取 + 精对位 + FAST-LIO2'],
  ['2028.02', '科研实验流水线 + Failure Taxonomy 完成'],
  ['2028.07', 'Cyber Mobile Manipulator v1.0：导航 → 精对位 → 抓取 → 运输 → 放置 → Recovery'],
  ['2028.09', '不少于 50 次端到端测试 + 秋招作品集冻结'],
  ['2028.12', '获得目标 Offer，学位论文完成 70%—80%'],
  ['2029.03', '论文定稿与盲审阶段'],
  ['2029.06', '答辩、毕业与 Cyber 系列项目最终归档']
]

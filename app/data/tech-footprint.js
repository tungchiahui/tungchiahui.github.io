export const routeIntro = {
  badge: '个人技术路线清单 · 2026—2029', title: '机器人系统技术成长路线',
  summary: '一个机器人系统软件旗舰项目＋一个工业实时运动控制副项目＋一条与导师课题结合的科研线。按学期推进，每一个大任务都拆成可记录、可验收的小任务。',
  mainTrack: 'CyberNaviRobot：STM32 → 纯 C++ → ROS 2 → 定位建图 → 自主导航',
  sideTrack: 'IndustrialMotionLab：实时 Linux → EtherCAT → CiA 402 → 多轴运动控制',
  finalGoal: '面向机器人系统软件与运动控制底层岗位，形成两套能演示、能测量、能维护的作品集。'
}

export const tracks = {
  robot: { label: '机器人主项目', title: 'CyberNaviRobot', color: '#0f9f7a' },
  motion: { label: '工业控制副项目', title: 'IndustrialMotionLab', color: '#2563eb' },
  research: { label: '科研线', title: '融合定位研究', color: '#b7791f' }
}

const task = (id, track, title, goal, stack, subtasks) => ({ id, track, title, goal, stack, subtasks })
const sub = (id, title, acceptance = '') => ({ id, title, acceptance })

export const semesterPlans = [
  { id:'y1a', stage:'研一上', date:'2026.09—2027.01', focus:'把机器人底层、Linux 软件和 ROS 2 硬件接口一次性打通', milestone:'CyberNaviRobot v0.5', allocation:[60,20,20], tasks:[
    task('stm32','robot','重构 STM32 底层','形成稳定、安全、可测量的四电机控制固件。',['FreeRTOS','PID','CAN','CRC'],[sub('rtos','FreeRTOS 任务划分'),sub('encoder','编码器采集与轮速计算','完成单位与方向校验'),sub('pid','四电机速度 PID 与前馈','保留阶跃和负载扰动曲线'),sub('protocol','串口 / CAN 协议与 CRC'),sub('safety','通信超时停车、看门狗与故障状态')]),
    task('core','robot','编写无 ROS 依赖的 chassis_core','让三个前端共用同一个可测试后端。',['C++17','Boost.Asio','GoogleTest'],[sub('kinematics','麦轮正逆运动学'),sub('odometry','里程计积分'),sub('transport','异步串口、自动重连'),sub('codec','协议编解码'),sub('tests','核心模块单元测试'),sub('params','参数与日志系统')]),
    task('frontends','robot','打通三套前端','Standalone、普通 ROS 2 节点和 ros2_control 共用核心库。',['ROS 2','ros2_control','TF2'],[sub('standalone','Standalone 键盘 / 手柄遥控'),sub('node','ROS 2 节点发布 odom、joint_states、IMU'),sub('tf','补齐 odom → base_link TF'),sub('hardware','SystemInterface 生命周期与 read / write'),sub('plugin','pluginlib 与 controller spawner')]),
    task('profile','motion','建立通用运动规划库','让工业控制知识先进入底盘主项目。',['Trapezoid','Quintic','S-curve'],[sub('limit','速度 / 加速度限制器'),sub('trapezoid','梯形速度规划'),sub('quintic','五次多项式'),sub('scurve','S 曲线基础'),sub('sync','单轴同步接口')])
  ]},
  { id:'winter1', stage:'研一寒假', date:'2027.01—02', focus:'不增加框架，集中测量、归档和实时 Linux 预研', milestone:'v0.5 测试与演示', allocation:[60,25,15], tasks:[
    task('freeze','robot','冻结并测量 v0.5','用证据替代“能跑”。',['Test','Docs','Video'],[sub('packet','通信丢包与重连测试'),sub('compare','PID 与 PID＋前馈对比'),sub('curve','梯形与 S 曲线对比'),sub('architecture','架构图与协议文档'),sub('video','第一版项目视频')]),
    task('rtlinux','motion','实时 Linux 基础实验','建立控制周期抖动基线。',['SCHED_FIFO','Affinity','mlockall'],[sub('normal','普通线程基线'),sub('fifo','SCHED_FIFO 调度'),sub('affinity','CPU 亲和性'),sub('memory','mlockall 内存锁定'),sub('jitter','平均 / 最大延迟与超期次数统计')])
  ]},
  { id:'y1b', stage:'研一下', date:'2027.02—07', focus:'完成移动机器人的 2D 自主导航闭环', milestone:'CyberNaviRobot v1.0', allocation:[60,15,25], tasks:[
    task('calibration','robot','里程计与传感器标定','先保证输入可信，再做融合。',['TF','IMU','LiDAR'],[sub('wheel','轮径与轮距标定'),sub('imu','IMU 轴向和安装姿态'),sub('time','传感器时间戳'),sub('tree','完整 TF 树'),sub('extrinsic','激光雷达外参'),sub('motion-test','直行、旋转、矩形闭环与横移测试')]),
    task('ekf','research','EKF 融合与基线实现','融合轮速和 IMU，并能讲清模型。',['robot_localization','EKF'],[sub('config','robot_localization 配置'),sub('state','状态、预测与观测模型'),sub('noise','Q / R 与协方差调试'),sub('delay','传感器延迟处理'),sub('compare','融合前后轨迹对比')]),
    task('nav2','robot','2D SLAM 与 Nav2 实机','形成建图、定位、规划、避障完整闭环。',['slam_toolbox','AMCL','Nav2'],[sub('slam','slam_toolbox 建图与地图保存'),sub('amcl','AMCL 定位'),sub('single','单目标导航'),sub('patrol','多目标巡航'),sub('dynamic','动态障碍绕行'),sub('recovery','失败恢复与重定位'),sub('metrics','成功率、误差、恢复时间和资源占用')]),
    task('realtime-chassis','motion','实时性接入底盘','比较不同调度方式下的控制稳定性。',['PREEMPT_RT','Threads'],[sub('split','通信 / 控制 / 诊断 / ROS / 日志线程拆分'),sub('load','后台高负载测试'),sub('fifo','普通调度与 SCHED_FIFO 对比'),sub('rt','条件允许时安装 PREEMPT_RT')])
  ]},
  { id:'summer1', stage:'研一暑假', date:'2027.07—09', focus:'项目冻结、工程化与工业控制预研', milestone:'v1.0 工程化版本', allocation:[55,25,20], tasks:[
    task('engineering','robot','交付级工程化','让项目可以一键复现和长期维护。',['Docker','CI','systemd'],[sub('readme','重写 README'),sub('docker','Docker 环境'),sub('ci','GitHub Actions 与 GoogleTest'),sub('boot','systemd 自启动与 udev 规则'),sub('diagnostics','diagnostics 与 rosbag 回放测试'),sub('launch','一键启动脚本与故障复盘')]),
    task('ethercat-study','motion','EtherCAT 与 CiA 402 预研','先理解协议与仿真，不急于购买设备。',['EtherCAT','CiA 402'],[sub('pdo','PDO / SDO'),sub('dc','分布式时钟'),sub('cia','CiA 402 状态机'),sub('master','EtherCAT 主站基本通信')])
  ]},
  { id:'y2a', stage:'研二上', date:'2027.09—2028.01', focus:'3D 定位、工业实时平台与科研方向同步成型', milestone:'FAST-LIO2 + MotionLab v0.1', allocation:[40,25,35], tasks:[
    task('lio','robot','FAST-LIO2 三维定位建图','让 3D 轨迹和点云地图稳定可测。',['Mid-360','FAST-LIO2','PCL'],[sub('extrinsic','雷达 IMU 外参'),sub('sync','时间同步'),sub('noise','IMU 噪声'),sub('distortion','点云畸变'),sub('drift','长时间漂移评估'),sub('resource','地图体积与 CPU 占用')]),
    task('nav3d','robot','3D 定位服务 Nav2','把三维感知转化成地面导航能力。',['FAST-LIO2','Nav2'],[sub('localization','FAST-LIO2 定位模式'),sub('filter','点云过滤'),sub('ground','地面分割'),sub('costmap','二维障碍物 / costmap 接入'),sub('navigation','Nav2 实机验证')]),
    task('motion-v01','motion','IndustrialMotionLab v0.1','建立无真实伺服也能测试的基础框架。',['PREEMPT_RT','EtherCAT','CiA 402'],[sub('loop','实时循环与亲和性'),sub('jitter','周期抖动监控'),sub('ethercat','EtherCAT 主站链路'),sub('state','CiA 402 状态机'),sub('profiles','轨迹规划统一接口'),sub('unit','状态机与规划单元测试')]),
    task('topic','research','科研问题正式收窄','选题直接复用 CyberNaviRobot 平台。',['Fusion','Degeneration'],[sub('review','相关工作与数据集整理'),sub('baseline','复现实验基线'),sub('problem','确定退化场景与评价指标'),sub('proposal','形成第一版方法与开题材料')])
  ]},
  { id:'y2b', stage:'研二下', date:'2028.02—07', focus:'科研成果落地，工业控制副项目形成实机演示', milestone:'论文成果 + MotionLab v1.0', allocation:[20,30,50], tasks:[
    task('paper','research','科研方法与论文','研二结束前确认成果足以支撑毕业。',['Experiment','Paper'],[sub('method','2—3 月：方法稳定'),sub('compare','3—4 月：对比实验'),sub('ablation','消融与复杂环境实验'),sub('writing','4—5 月：论文写作'),sub('submit','5—6 月：投稿或毕业成果')]),
    task('motion-v1','motion','IndustrialMotionLab v1.0','完成一至两轴 EtherCAT 实机闭环。',['EtherCAT','Servo','Interpolation'],[sub('enable','伺服使能与状态切换'),sub('home','原点回归'),sub('mode','位置 / 速度模式'),sub('profiles','梯形、五次与 S 曲线'),sub('interpolation','两轴同步插补'),sub('limits','软硬限位与急停'),sub('fault','掉线保护与故障复位'),sub('metrics','抖动、跟踪误差、同步误差和急停响应')])
  ]},
  { id:'y3', stage:'研三', date:'2028.09—2029.06', focus:'秋招、学位论文与项目归档，不再开启大型新项目', milestone:'Offer + 答辩 + 归档', allocation:[15,10,75], tasks:[
    task('portfolio','robot','双项目作品集','用清晰演示和数据支撑两套简历。',['Portfolio','Interview'],[sub('robot-video','无 ROS / ros2_control / 3D 导航三段演示'),sub('motion-video','状态机 / 多轴 / 实时性 / 故障演示'),sub('website','网站与 GitHub 整理'),sub('reports','架构图与测试报告'),sub('resume','机器人软件 / 工业控制双版本简历')]),
    task('graduation','research','秋招与毕业','功能冻结，只修 Bug、补测试和文档。',['Thesis','Archive'],[sub('job','秋招投递与面试复盘'),sub('thesis70','2028.12 论文完成 70%—80%'),sub('review','盲审与论文修改'),sub('defense','答辩'),sub('archive','代码归档与项目交接')])
  ]}
]

export const milestoneList = [['2027.01','三前端一后端打通'],['2027.07','2D SLAM＋Nav2 实机'],['2028.01','FAST-LIO2＋MotionLab v0.1'],['2028.07','科研成果＋多轴控制'],['2028.09','作品集与简历齐备'],['2029.03','论文定稿与答辩阶段']]

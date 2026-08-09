# 技术足迹维护说明

这份文档只用于维护“技术足迹 / 三年机器人系统路线”页面，不会直接显示在网站正文中。

当前页面的核心文件是：

- `app/data/tech-footprint.js`：路线、学期计划、任务、子任务、里程碑等静态数据
- `app/pages/tech-footprint.vue`：页面逻辑、进度统计、编辑模式、云端同步
- `app/assets/css/tech-footprint.css`：页面样式

日常调整三年规划时，**绝大多数情况只需要修改 `app/data/tech-footprint.js`**。

除非要改变页面交互方式、进度存储方式或布局，否则不要轻易改 `tech-footprint.vue`。

---

# 一、当前路线的总体设计

当前技术路线不是“把所有机器人技术都学一遍”，而是围绕一个主项目逐步扩张能力：

```text
Cyber AMR
   ↓
Cyber Arm
   ↓
Cyber Mobile Manipulator
```

对应含义：

- **Cyber AMR**：Cyber Autonomous Mobile Robot，自主移动机器人
- **Cyber Arm**：机械臂子系统
- **Cyber Mobile Manipulator**：最终的移动操作机器人整机

三年的核心节奏是：

```text
能力扩张
  ↓
系统集成
  ↓
稳定化
  ↓
测量失败和瓶颈
  ↓
针对性引入新技术
  ↓
再次测试与稳定化
```

不要把技术路线维护成“看到新技术就继续往后加”的列表。

每次准备加入一个新技术时，优先问：

> 它解决当前机器人系统中的什么真实问题？

例如：

- Nav2 到达工位后停车误差过大，影响抓取 → 加入视觉精对位
- 2D 定位在复杂场景下不稳定 → 评估 FAST-LIO2
- 顺序状态机越来越难维护 → 引入 Behavior Tree
- 抓取还不稳定时，仅仅因为 VLA 很热门 → 不应优先加入

---

# 二、`tech-footprint.js` 的真实数据结构

当前页面实际使用以下四类导出数据：

```js
routeIntro
tracks
semesterPlans
milestoneList
```

另外文件内部使用两个辅助函数：

```js
const task = (id, track, title, goal, stack, subtasks) => ({
  id,
  track,
  title,
  goal,
  stack,
  subtasks
})

const sub = (id, title, acceptance = '') => ({
  id,
  title,
  acceptance
})
```

旧版维护文档里曾经出现过：

- `routeSections`
- `routeTasks`
- `priorityConfig`
- `taskStatusConfig`
- `portfolioTracks`
- `knowledgeTags`

这些已经不是当前页面的数据结构，**不要再按旧格式维护**。

---

# 三、`routeIntro`：页面顶部总体路线

结构：

```js
export const routeIntro = {
  badge: '个人技术路线清单 · 2026—2029',
  title: '机器人系统软件研究生成长路线',
  summary: '...',
  mainTrack: '...',
  sideTrack: '...',
  researchTrack: '...',
  finalGoal: '...'
}
```

各字段用途：

| 字段 | 用途 |
| --- | --- |
| `badge` | 页面顶部小标题和时间范围 |
| `title` | 页面主标题 |
| `summary` | 总体路线摘要，同时用于页面描述信息 |
| `mainTrack` | 机器人主项目路线 |
| `sideTrack` | 工业控制副线 |
| `researchTrack` | 科研方向摘要 |
| `finalGoal` | 三年最终能力目标 |

## 维护原则

这里写长期方向，不写细碎任务。

适合写：

> Cyber AMR → Cyber Arm → Cyber Mobile Manipulator

不适合写：

> 第三周看某教程、第四周调某参数。

如果三年的战略方向发生明显变化，再改这里。

---

# 四、`tracks`：三条路线

当前结构：

```js
export const tracks = {
  robot: {
    label: '机器人系统主线',
    title: 'Cyber AMR → Cyber Arm → Cyber Mobile Manipulator',
    color: '#0f9f7a'
  },
  motion: {
    label: '工业控制副线',
    title: '工业实时与运动控制基础',
    color: '#2563eb'
  },
  research: {
    label: '科研线',
    title: '移动操作机器人的定位、导航与操作可靠性',
    color: '#b7791f'
  }
}
```

当前允许的大任务归属只有：

```text
robot
motion
research
```

对应：

- `robot`：Cyber AMR、Cyber Arm、Cyber Mobile Manipulator 以及机器人系统软件主线
- `motion`：实时 Linux、EtherCAT、CiA 402、轨迹规划等工业控制补充能力
- `research`：EKF、SLAM、科研实验、论文等

## 重要

任务里的：

```js
track: 'robot'
```

必须能在 `tracks` 中找到。

如果写成：

```js
track: 'navigation'
```

页面会无法正确读取对应路线信息。

---

# 五、`semesterPlans`：整个页面最核心的数据

三年路线主要维护这里。

结构：

```js
export const semesterPlans = [
  {
    id: 'y1a',
    stage: '研一上',
    date: '2026.09—2027.01',
    focus: '...',
    milestone: '...',
    allocation: [70, 5, 25],
    tasks: [
      ...
    ]
  }
]
```

## 学期字段说明

### `id`

内部唯一标识。

例如：

```text
y1a
winter1
y1b
summer1
y2a
winter2
y2b
summer2
y3a
y3b
```

`id` 不只是显示用，它还参与进度数据的唯一键生成。

**已经开始记录进度后，不要随便修改现有 `id`。**

### `stage`

页面显示的阶段名称，例如：

```text
研一上
研一寒假
研一下
研一暑假
```

修改它不会影响已有进度，因为进度使用的是 `id`，不是 `stage`。

### `date`

显示时间范围。

格式建议统一：

```text
2027.02—2027.07
```

### `focus`

这一阶段最核心的战略目标。

不要写成任务清单。

例如：

> 从“可控底盘”升级成完整自主移动机器人，重点完成标定、EKF、2D SLAM、Nav2 和正式成功率测试。

### `milestone`

阶段完成后的主要交付物。

例如：

```text
Cyber AMR v1.0：EKF + 2D SLAM + Nav2 实机稳定
```

它应该是“阶段验收结果”，而不是“计划学习什么”。

### `allocation`

结构固定为：

```js
[机器人, 工业控制, 科研]
```

例如：

```js
allocation: [70, 5, 25]
```

表示：

```text
机器人主线 70%
工业控制 5%
科研 25%
```

页面显示逻辑也是按这个顺序读取：

```text
allocation[0] → 机器人
allocation[1] → 工业
allocation[2] → 科研
```

因此绝对不要把顺序写成：

```text
机器人 / 科研 / 工业
```

否则页面显示会和真实意图错位。

原则上三项总和保持：

```text
100
```

---

# 六、大任务 `task()` 的结构

当前任务统一通过：

```js
task(id, track, title, goal, stack, subtasks)
```

生成。

完整示例：

```js
task(
  'nav2',
  'robot',
  '完成 2D SLAM 与 Nav2 实机闭环',
  '形成建图、定位、规划、局部避障、恢复和多点任务的完整自主导航能力。',
  ['slam_toolbox', 'AMCL', 'Nav2', 'Behavior Tree'],
  [
    sub('slam', '完成 slam_toolbox 建图、地图保存和重复建图一致性检查'),
    sub('amcl', '完成 AMCL 定位、初始定位和重定位'),
    sub('single', '完成单目标点到点导航'),
    sub('metrics', '正式统计导航成功率、到点误差、耗时和恢复次数')
  ]
)
```

## 字段说明

### `id`

大任务唯一标识。

建议：

- 全文件尽量保持唯一
- 使用短小、稳定、可读的英文标识
- 一旦已有进度，不要随意修改

例如：

```text
nav2
ekf
protocol
driver
fine-alignment
paper
stress-test
```

页面展开状态目前直接使用 `task.id`，因此**不要在不同学期重复使用同一个大任务 `id`**。

### `track`

必须使用：

```text
robot
motion
research
```

### `title`

页面上最显眼的大任务标题。

普通描述优先使用中文，专业名词保持原名。

推荐：

> 完成 Cyber AMR 的 ros2_control 接入

不推荐：

> Complete Cyber AMR ros2_control Integration

除非某个名称本身就是正式英文项目名。

### `goal`

回答：

> 为什么做这个任务？它给整个系统带来什么能力？

例如：

> 把串口通信、设备状态和故障处理封装成不依赖 ROS 2 的设备驱动。

不要写成：

> 学习 Boost.Asio。

后者只是学习动作，不是系统目标。

### `stack`

只放真正有识别意义的技术栈和专业名词。

例如：

```js
['C++23', 'Boost.Asio', 'GoogleTest']
```

或者：

```js
['ROS 2', 'ros2_control', 'pluginlib', 'TF2']
```

不要为了显得高级而把普通词全部翻成英文。

例如下面这种没有必要：

```text
Failure
Review
Records
Compare
System
```

如果中文更自然，就用中文描述。

---

# 七、子任务 `sub()` 的结构

结构：

```js
sub(id, title, acceptance = '')
```

例如：

```js
sub(
  'pid',
  '完成四电机速度 PID、输出限幅、Anti-windup 与基础前馈',
  '保留阶跃、稳态误差、负载扰动和四轮一致性曲线'
)
```

## `id`

子任务标识。

进度数据的完整键为：

```text
semesterId/taskId/subtaskId
```

例如：

```text
y1a/stm32/pid
```

因此子任务 `id` 至少必须在同一个大任务内部唯一。

为了后续排查方便，建议整个文件里也尽量使用语义清楚的名称。

## `title`

写“具体要完成什么”。

推荐：

> 测试 USB 串口拔插、STM32 重启、Linux Driver 重启和自动重连

不推荐：

> 学习异常处理

## `acceptance`

可选字段，用于写明确的验收证据。

适合填写：

- 成功率目标
- 误差目标
- 连续测试次数
- 需要保存的曲线
- 必须输出的文档
- 必须形成的对比实验

例如：

```js
sub(
  'missions',
  '完成正式完整任务压力测试',
  '不少于 50 次；记录成功率、失败阶段、根因和恢复结果'
)
```

如果任务本身已经足够明确，可以不写 `acceptance`。

---

# 八、为什么“验收”比“学习”更重要

当前路线页面不是课程目录，而是研究生三年的执行数据库。

因此子任务应该尽量从：

> 学习某技术

改成：

> 用某技术完成一个可验证结果。

例如：

不够好：

> 学习 FAST-LIO2

更好：

> 完成 FAST-LIO2 建图和定位，并接入 Cyber AMR 实机导航

不够好：

> 学习 MoveIt 2

更好：

> 完成 Cyber Arm 连续 20—30 次仿真 Pick & Place

不够好：

> 学习系统稳定性

更好：

> 完成不少于 50 次 Cyber Mobile Manipulator 端到端任务，并统计失败类型和自动恢复结果

---

# 九、新增一个大任务

找到对应学期的：

```js
tasks: [
  ...
]
```

直接加入：

```js
task(
  'visual-servo',
  'robot',
  '验证视觉伺服对末端精定位的改善',
  '在现有视觉精对位仍不足以满足操作精度时，再验证视觉伺服是否值得进入主线。',
  ['Visual Servoing', 'OpenCV', 'MoveIt 2'],
  [
    sub('baseline', '记录当前开环抓取末端误差和成功率'),
    sub('servo', '完成视觉反馈闭环的最小可运行版本'),
    sub('compare', '对比加入视觉伺服前后的误差、耗时和成功率')
  ]
)
```

## 新增前先检查

1. 这个问题现在真实存在吗？
2. 是否已经有其他任务解决同样的问题？
3. 它是主线必须完成，还是可选拓展？
4. 是否会挤占论文或秋招阶段的时间？
5. 能不能设计出明确验收指标？

如果以上问题回答不清楚，不要急着往路线里加。

---

# 十、新增一个子任务

在已有任务的 `subtasks` 数组中加入：

```js
sub(
  'recovery-test',
  '主动制造一次规划失败并验证 Recovery 流程',
  '机器人能够识别失败、重新规划并继续任务'
)
```

新增后页面会自动：

- 增加一条进度记录
- 纳入任务平均进度
- 纳入全局小任务数量
- 纳入总进度计算

不需要手动修改统计数字。

---

# 十一、新增一个学期 / 阶段

直接向 `semesterPlans` 增加对象：

```js
{
  id: 'extra-stage',
  stage: '额外阶段',
  date: '2028.06—2028.07',
  focus: '集中解决某个明确系统瓶颈',
  milestone: '形成可重复的实机结果',
  allocation: [70, 5, 25],
  tasks: [
    ...
  ]
}
```

但正常情况下不要轻易增加阶段。

当前“学期 + 寒暑假”的粒度已经足够细。

如果只是多了一个新技术，应优先放进现有阶段，而不是增加新的时间段。

---

# 十二、`milestoneList`：关键里程碑

结构：

```js
export const milestoneList = [
  ['2027.01', 'Cyber AMR v0.5：STM32 → C++ Driver → ros2_control 完整打通'],
  ['2027.07', 'Cyber AMR v1.0：EKF + 2D SLAM + Nav2 实机稳定'],
  ['2028.07', 'Cyber Mobile Manipulator v1.0：导航 → 精对位 → 抓取 → 运输 → 放置 → Recovery']
]
```

它不会自动从 `semesterPlans` 生成，需要手动维护。

## 维护原则

只保留真正值得作为阶段成果展示的节点。

不要把每一个学习任务都放进里程碑。

里程碑应该回答：

> 到这个时间点，机器人已经具备什么完整能力？

修改某个学期的 `milestone` 后，也检查 `milestoneList` 是否需要同步。

---

# 十三、静态路线数据与执行进度是两套东西

这是当前页面最重要的维护边界。

## 静态路线数据

存放在：

```text
app/data/tech-footprint.js
```

包括：

- 三年目标
- 学期
- 大任务
- 子任务
- 技术栈
- 验收条件
- 关键里程碑

修改这些内容需要改代码并重新部署网站。

## 执行进度数据

不写在 `tech-footprint.js` 中。

页面会为每个子任务建立：

```ts
{
  status,
  progress,
  note,
  updatedAt
}
```

唯一键：

```text
semesterId/taskId/subtaskId
```

例如：

```text
y1a/driver/transport
```

进度会：

1. 保存到浏览器 `localStorage`
2. 编辑模式下同步到云端

当前本地存储键：

```text
tech_footprint_progress_v2
```

云端使用：

```text
tech-footprint
```

这意味着：

> 改任务标题通常不会丢进度，改 `id` 很可能会让原进度找不到对应任务。

---

# 十四、修改 `id` 前必须注意

这是最容易踩坑的地方。

例如已有：

```text
y1b/nav2/recovery
```

已经记录了 80% 进度和大量备注。

如果把：

```js
sub('recovery', ...)
```

改成：

```js
sub('nav-recovery', ...)
```

页面会把它视为一个全新的子任务。

旧数据仍可能存在于云端记录中，但不会再匹配页面。

因此：

## 可以放心改

- `title`
- `goal`
- `acceptance`
- `stack`
- `stage`
- `date`
- `focus`
- `milestone`

## 已有进度后慎改

- 学期 `id`
- 大任务 `id`
- 子任务 `id`

如果确实要改 ID，建议先在页面中：

> 导出进度 JSON

留一份备份。

---

# 十五、进度与状态的关系

页面状态有：

```text
todo   → 待开始
doing  → 进行中
done   → 已完成
```

但状态不是静态写在 JS 中的。

页面逻辑会根据进度自动处理：

```text
0%       → todo
1%—99%   → doing
100%     → done
```

如果手动选择：

```text
done
```

页面会把进度设成：

```text
100%
```

选择：

```text
todo
```

会设成：

```text
0%
```

选择 `doing` 且原本为 0% 时，会自动给一个初始进度。

所以不要再在 `tech-footprint.js` 中增加：

```js
status: 'todo'
```

这样的字段。

---

# 十六、大任务进度如何计算

页面不会给大任务单独存进度。

大任务进度是它所有子任务进度的平均值。

例如：

```text
子任务 A：100%
子任务 B：50%
子任务 C：0%
```

大任务大约显示：

```text
50%
```

因此一个大任务不要塞几十个粒度完全不同的子任务。

例如：

```text
学习 CMake
```

和：

```text
完成整个 Cyber Mobile Manipulator
```

不应该作为同一级子任务，否则进度平均值没有实际意义。

---

# 十七、子任务粒度建议

推荐一个子任务对应：

> 几小时到一两周内能够形成明确结果的一件事。

太小：

- 看一篇博客
- 下载一个包
- 建一个文件夹

没有长期记录价值。

太大：

- 学会 ROS 2
- 学会 SLAM
- 做完整机械臂

很难准确表示进度。

更合适：

- 完成 AMCL 重定位测试
- 完成 LiDAR 外参标定
- 实现流式 Frame Parser
- 完成 Cyber Arm 真机轨迹执行
- 完成不少于 30 次固定工位 Pick & Place

---

# 十八、技术名称与语言风格

当前维护约定：

> 普通描述用中文，专业技术名词保留其常见英文写法。

推荐：

- 现代 C++ 与 Linux 工程基础
- 完成 Cyber AMR 的纯 C++ Linux Driver
- 完成 ros2_control 接入
- 使用 Nav2 进行点到点导航
- 使用 MoveIt 2 完成机械臂规划
- 使用 FAST-LIO2 提供三维定位
- 使用 Behavior Tree 管理任务恢复

不要把普通描述机械地全部翻译成英语。

例如不推荐：

```text
Failure Records
System Review
Mission Test
Project Maintenance
```

更自然的是：

```text
失败记录
系统复盘
完整任务测试
项目维护
```

代码、协议、库、算法、标准名称则保留英文。

当前 C++ 标准统一按：

```text
C++23
```

维护时不要再新增 `C++20`。

---

# 十九、当前项目命名规则

统一使用：

## Cyber AMR

全称：

```text
Cyber Autonomous Mobile Robot
```

主要覆盖：

- STM32 / FreeRTOS
- Robot Protocol
- Linux Driver
- ros2_control
- EKF
- SLAM
- Nav2
- FAST-LIO2

## Cyber Arm

主要覆盖：

- URDF / Xacro
- KDL
- Pinocchio 基础
- ros2_control
- MoveIt 2
- RGB-D
- 手眼标定
- 视觉抓取

## Cyber Mobile Manipulator

由：

```text
Cyber AMR + Cyber Arm
```

组成。

重点覆盖：

- 导航
- 工位精对位
- 视觉感知
- 抓取
- 运输
- 放置
- Behavior Tree
- Recovery
- 端到端成功率
- 失败分析

不要重新混用旧名称：

```text
CyberNaviRobot
```

除非以后专门需要说明历史版本。

---

# 二十、成功率和稳定性任务怎么写

当前路线非常强调：

> 视频只是证明“至少成功过一次”，测试数据才能证明系统真的可靠。

因此到了 Nav2、机械臂、移动操作阶段，任务里尽量包含：

- 正式测试次数
- 成功率
- 位置 / 姿态误差
- 任务耗时
- 恢复次数
- 失败类型
- 根因
- 自动恢复结果

例如：

```js
sub(
  'missions',
  '完成不少于 50 次正式完整任务，条件允许时冲击 100 次'
)
```

或者：

```js
sub(
  'compare',
  '对比精对位前后的停车误差和抓取成功率'
)
```

最终目标不是无限追求 99.99%，而是在达到阶段可靠性要求后继续扩展下一层能力。

---

# 二十一、科研任务的维护原则

科研线不要和工程项目割裂。

当前优先思路是：

> 研究真实机器人系统中已经观测到的问题，并通过 Cyber Mobile Manipulator 真机验证。

例如：

```text
Nav2 到工位附近
     ↓
停车误差较大
     ↓
机械臂可达性 / 抓取率下降
     ↓
视觉精对位与抓取补偿
     ↓
比较误差和成功率变化
```

好的科研任务应该能回答：

1. 问题是什么？
2. 现有方法有什么不足？
3. 改进方法是什么？
4. 用什么数据集 / rosbag / 真机实验？
5. 用什么指标评价？
6. 对真实机器人系统到底有什么改善？

不要同时在路线里大规模铺开：

- 动态 SLAM
- 退化 SLAM
- 3DGS
- VLA
- 视觉语言导航
- 高级机械臂控制

最终论文只需要一个清晰核心问题。

---

# 二十二、工业控制副线的维护原则

工业控制目前是能力补充，不是第二个主项目。

允许保留：

- SCHED_FIFO
- CPU Affinity
- `mlockall`
- PREEMPT_RT 基础
- EtherCAT
- PDO / SDO
- CiA 402
- CSP / CSV
- 梯形速度
- 五次多项式
- S 曲线
- 单轴伺服 Demo

不要因为路线表看起来“空”就继续加：

- 多轴完整工业控制器
- 自研 EtherCAT 大型主站框架
- 完整 PLC 系统
- 与主机器人同规模的第二套平台

如果未来求职方向明显转向工业运动控制，再重新评估权重。

---

# 二十三、删除任务时怎么处理

如果一个任务确认不再需要，可以直接从 `semesterPlans` 删除。

但删除前检查：

1. 是否已经有进度和重要备注？
2. 是否应该把结果先转移到项目 README / Wiki / 论文笔记？
3. 它是“真的不需要”，还是应该降级到可选？
4. 删除后阶段 `milestone` 是否仍然合理？
5. `milestoneList` 是否需要同步修改？

删除子任务后，旧进度记录可能仍留在云端 JSON 中，但页面不会再显示它。

这通常不影响使用；如果以后要彻底清理，再做数据迁移即可。

---

# 二十四、调整阶段顺序

页面按 `semesterPlans` 在数组中的顺序显示学期标签。

因此调整阶段顺序只需要调整数组对象的先后位置。

不需要 `order` 字段。

任务同样按 `tasks` 数组中的顺序显示。

子任务按 `subtasks` 数组中的顺序显示。

当前版本已经不使用旧版的：

```js
order: 1
```

模式。

---

# 二十五、页面统计如何自动生成

页面会自动计算：

- 学习阶段数量
- 子任务总数
- 已完成子任务数量
- 总平均进度
- 每个大任务平均进度

因此修改路线时：

> 不需要手工维护任务总数、完成数量和百分比。

这些都来自 `semesterPlans` 和云端执行记录。

---

# 二十六、编辑模式主要做什么

网页上的编辑模式主要用于：

- 修改子任务进度
- 修改状态
- 写实验结果
- 写问题记录
- 写下一步计划
- 导入 / 导出进度 JSON

它**不是**用来修改静态三年规划结构的。

如果要：

- 新增学期
- 新增大任务
- 修改技术栈
- 修改里程碑
- 改总体路线

仍然应该修改：

```text
app/data/tech-footprint.js
```

然后重新部署。

---

# 二十七、大改路线前建议先导出执行数据

如果只是改文案，不需要特别处理。

如果准备：

- 大量改 ID
- 合并学期
- 拆分大任务
- 删除大量子任务
- 重构整个路线结构

建议先在网页编辑模式中：

> 导出当前进度 JSON

这样即使新结构和旧 ID 不兼容，也保留完整历史记录。

---

# 二十八、推荐的维护流程

一次正常路线调整建议按这个顺序：

## 1. 先判断是否真的需要改路线

问：

- 这是战略变化还是临时兴趣？
- 它解决什么问题？
- 是否挤占更重要的主线？

## 2. 确定放在哪个阶段

不要只按“想什么时候学”安排。

应该考虑依赖关系：

```text
底盘控制
 ↓
状态估计
 ↓
导航
 ↓
机械臂
 ↓
视觉抓取
 ↓
移动操作
 ↓
稳定性与求职作品集
```

## 3. 写大任务目标

用一句话说明它给系统带来的能力。

## 4. 拆成可验收子任务

每个子任务尽量有明确结果。

## 5. 检查阶段时间是否超载

如果一学期同时出现太多大型技术：

> 优先删，而不是继续堆。

## 6. 检查 `milestone`

确保阶段交付物和任务一致。

## 7. 检查 `milestoneList`

需要时同步修改。

## 8. 做语法和页面验证

见后文。

---

# 二十九、JS 修改后的快速语法检查

首先执行：

```bash
node --check app/data/tech-footprint.js
```

这一步主要排查：

- 少逗号
- 少括号
- 字符串引号错误
- 数组没有闭合
- 函数调用结构错误

如果这里不通过，不要继续部署。

---

# 三十、完整构建验证

建议执行：

```bash
npm run generate
```

如果构建失败，检查：

- `tech-footprint.js` 语法
- `track` 是否存在
- 数组 / 对象结构是否正确
- 页面是否引用了已经删除的字段

---

# 三十一、本地预览

执行：

```bash
npm run dev -- --host 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:3000/tech-footprint
```

重点检查：

1. 顶部总路线文案是否正确
2. 三条路线卡片是否正常
3. 学期标签顺序是否正确
4. `allocation` 比例是否显示正确
5. 每个任务能否展开
6. 技术栈是否正常显示
7. 子任务是否缺失
8. 验收文案是否正常
9. 总进度统计是否正常
10. 关键里程碑是否和学期计划一致

---

# 三十二、发布后检查

网站部署完成后，再访问线上：

```text
/tech-footprint
```

确认：

- 页面已加载新 JS
- 没有旧缓存导致的内容错位
- 原有云端进度仍能正确映射到子任务
- 编辑模式可以正常同步

尤其是在修改任何 `id` 后，一定确认历史进度是否还在正确位置。

---

# 三十三、常见错误清单

## 错误 1：`allocation` 顺序写反

正确：

```js
[机器人, 工业, 科研]
```

---

## 错误 2：随手修改任务 ID

会导致历史进度失去对应关系。

---

## 错误 3：不同学期使用相同的大任务 ID

页面展开状态只使用 `task.id`，容易产生联动问题。

大任务 ID 尽量全局唯一。

---

## 错误 4：`track` 写成未定义值

只能使用当前 `tracks` 中已有的键。

---

## 错误 5：任务只写“学习某技术”

尽量改成可验收结果。

---

## 错误 6：普通中文描述全部翻成英语

只有专业术语保留常见英文写法。

---

## 错误 7：看到新技术就加入主线

先判断它是否解决现有系统瓶颈。

---

## 错误 8：为了成功率无限优化一个模块

达到阶段目标后，应继续扩展下一层能力。

除非这个模块本身就是论文核心。

---

## 错误 9：忘记同步关键里程碑

学期 `milestone` 改了以后，检查 `milestoneList`。

---

## 错误 10：把执行进度写回 JS

进度和备注由页面的云端 / localStorage 系统维护，不要静态硬编码。

---

# 三十四、维护路线时最重要的几条原则

## 原则 1：一个真正的大项目比多个半成品更重要

三年核心始终围绕：

```text
Cyber AMR
 → Cyber Arm
 → Cyber Mobile Manipulator
```

---

## 原则 2：研一重能力边界，研二重可靠性

研一重点回答：

> 我会不会？我能不能独立接入和调试？

研二重点回答：

> 它能不能和整个机器人长期稳定协同？

---

## 原则 3：新技术必须有理由

不是为了：

> 技术栈看起来更多。

而是为了：

> 解决一个已经被测量出来的问题。

---

## 原则 4：视频不是最终证据

最终作品需要同时具有：

```text
Demo 视频
+
源码
+
架构图
+
性能指标
+
连续测试
+
失败分析
+
Recovery
+
科研结果
```

---

## 原则 5：失败本身也是重要数据

真正值得记录的是：

```text
失败发生在哪里
为什么失败
怎么定位
怎么修复
是否自动恢复
修复后指标改善多少
```

---

## 原则 6：秋招前停止大规模扩张

研二暑假以后优先级应逐渐变成：

```text
可靠性
  >
量化指标
  >
故障恢复
  >
文档与作品集
  >
面试准备
  >
新增技术
```

---

# 三十五、这份维护文档放在哪里

本文件应继续保留在：

```text
docs/tech-footprint-maintenance.md
```

不要放到：

- `content/posts`
- `content/wiki`
- `public`

原因：

- `content/` 可能被内容系统扫描并显示到网站正文
- `public/` 会作为静态文件直接发布
- `docs/` 更适合作为仓库内部维护说明

---

# 三十六、快速维护备忘

如果只是修改一个现有任务：

```text
改 title / goal / stack / acceptance
→ 尽量不动 id
→ node --check
→ npm run generate
→ 检查 /tech-footprint
```

如果新增一个任务：

```text
找到学期
→ 选择 robot / motion / research
→ 建立唯一 task id
→ 写清系统目标
→ 拆成可验收 subtask
→ 检查阶段是否超载
→ 检查 milestone
→ 语法与构建验证
```

如果准备大改路线：

```text
先导出网页进度 JSON
→ 再改 semester / task / subtask 结构
→ 尽量保留已有 id
→ 同步 milestoneList
→ 本地完整验证
→ 发布后检查历史进度映射
```

---

# 最后一句

这份技术足迹不是“想学什么技术”的收藏夹，而应该始终是一张：

> **从研究生入学，到能够独立构建稳定 Cyber Mobile Manipulator，再到形成论文与求职作品集的可执行路线图。**

维护时宁可删掉几个暂时没必要的高级技术，也不要让主线失焦。
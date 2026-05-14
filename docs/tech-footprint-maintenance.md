# 技术足迹维护说明

这份文档只给自己维护用，不会显示在网站页面上。  
真正控制页面内容的是：

- `app/data/tech-footprint.js`
- `app/pages/tech-footprint.vue`
- `app/assets/css/tech-footprint.css`

日常维护时，通常只需要改 `app/data/tech-footprint.js`。

## 数据结构

`tech-footprint.js` 里主要分成几类数据：

| 名称 | 用途 | 常改吗 |
| --- | --- | --- |
| `routeIntro` | 页面顶部标题、主线、副线、路线目标 | 偶尔 |
| `routeSections` | 技术路线阶段，比如基础、底盘、导航、视觉 | 偶尔 |
| `routeTasks` | 具体任务清单，这是最常维护的地方 | 经常 |
| `priorityConfig` | 任务优先级配置 | 很少 |
| `taskStatusConfig` | 任务状态配置 | 很少 |
| `portfolioTracks` | 项目沉淀方向 | 偶尔 |
| `knowledgeTags` | 能力关键词 | 偶尔 |
| `maintenanceNotes` | 页面上的维护规则 | 偶尔 |

页面里的统计、阶段下的任务、优先级分组，都会从 `routeTasks` 自动生成。  
所以新增任务时，不需要手动改统计数字。

## 新增一个任务

在 `routeTasks` 数组里加一个对象即可。

推荐放在合适阶段任务的后面，并保证：

- `id` 不重复
- `order` 不重复
- `section` 必须对应 `routeSections` 里的某个 `id`
- `priority` 使用已有值：`core`、`important`、`optional`
- `status` 使用已有值：`todo`、`doing`、`done`

示例：

```js
{
  id: 'task-14',
  order: 14,
  section: 'vision',
  title: '完成 RGB-D 目标三维定位 demo',
  goal: '把 2D 检测框、深度图和相机内参结合起来，输出目标在相机坐标系下的位置。',
  priority: 'important',
  status: 'todo',
  stack: ['RGB-D', 'YOLO', 'OpenCV', 'TF'],
  checklist: ['读取检测框中心点深度', '完成像素到相机坐标转换', '发布目标 TF 或 Pose topic']
}
```

## 批量新增一组任务

如果要一次新增一系列任务，建议按同一个阶段集中放，并连续编号。

示例：给 `deployment` 阶段新增 3 个部署任务：

```js
{
  id: 'task-14',
  order: 14,
  section: 'deployment',
  title: '整理 Jetson 基础部署模板',
  goal: '把 Jetson 上常用的 ROS2、Docker、驱动配置沉淀成模板。',
  priority: 'important',
  status: 'todo',
  stack: ['Jetson', 'ROS2', 'Docker'],
  checklist: ['整理系统镜像版本', '记录依赖安装流程', '保存常用启动脚本']
},
{
  id: 'task-15',
  order: 15,
  section: 'deployment',
  title: '测试 YOLO TensorRT 推理性能',
  goal: '记录不同模型在 Jetson 上的 FPS、延迟和资源占用。',
  priority: 'optional',
  status: 'todo',
  stack: ['YOLO', 'TensorRT', 'CUDA'],
  checklist: ['导出 engine 文件', '测试 FPS 和 latency', '记录 CPU/GPU 占用']
},
{
  id: 'task-16',
  order: 16,
  section: 'deployment',
  title: '整理机器人自启动服务',
  goal: '让核心节点可以通过 systemd 稳定自启动和查看日志。',
  priority: 'important',
  status: 'todo',
  stack: ['systemd', 'ROS2', 'Linux'],
  checklist: ['编写 service 文件', '配置环境变量', '整理 journalctl 排障命令']
}
```

如果任务很多，先写最小版本即可：

- `title` 先写清楚任务是什么
- `goal` 先写一句为什么做
- `checklist` 先写 2 到 3 个最关键的验收点

后面再慢慢补细节。

## 新增一个阶段

先在 `routeSections` 中新增阶段：

```js
{
  id: 'simulation',
  stage: '阶段 08',
  title: '仿真与系统验证',
  focus: '把真实机器人上容易出问题的流程先放到仿真里验证。',
  modules: ['Gazebo', 'Webots', 'RViz2', 'rosbag2'],
  deliverables: ['搭建统一仿真环境', '复现导航和机械臂流程', '用 rosbag 回放关键场景']
}
```

然后在 `routeTasks` 中新增任务，并把 `section` 写成新阶段的 `id`：

```js
{
  id: 'task-17',
  order: 17,
  section: 'simulation',
  title: '搭建 Nav2 仿真验证环境',
  goal: '在没有实车的情况下验证导航参数和路径规划行为。',
  priority: 'optional',
  status: 'todo',
  stack: ['Gazebo', 'Nav2', 'RViz2'],
  checklist: ['导入机器人模型', '配置仿真传感器', '跑通点目标导航']
}
```

## 修改任务状态

只改 `status` 字段。

```js
status: 'todo'
```

可用状态：

| 值 | 页面显示 | 含义 |
| --- | --- | --- |
| `todo` | 待开始 | 还没正式做 |
| `doing` | 进行中 | 当前正在推进 |
| `done` | 已完成 | 已经跑通并整理过 |

建议标准：

- 只是看过教程，不算 `done`
- 能独立复现，才适合改成 `done`
- 正在投入时间做，才改成 `doing`

## 修改任务优先级

只改 `priority` 字段。

```js
priority: 'core'
```

可用优先级：

| 值 | 页面显示 | 适合放什么 |
| --- | --- | --- |
| `core` | 主线必做 | 路线主干，必须稳定跑通 |
| `important` | 建议推进 | 能明显增强完整性 |
| `optional` | 扩展探索 | 有设备和时间再做 |

优先级分组会自动从 `routeTasks` 生成，不需要手动维护。

## 调整显示顺序

页面按 `order` 从小到大排序。

如果要插入一个中间任务，有两种做法：

1. 直接使用小数：

```js
order: 6.5
```

2. 重新整理后续任务编号。

长期看，任务不多时重新编号更清爽；任务很多时用小数更省事。

## 删除任务

从 `routeTasks` 里删除对应对象即可。

删除前建议确认：

- 有没有别的任务依赖它
- 这个任务是否只是需要改名，而不是删除
- 有没有已完成的复盘内容需要转移到 wiki 或项目 README

## 常见字段写法

任务对象推荐保持这个顺序：

```js
{
  id: 'task-xx',
  order: xx,
  section: 'section-id',
  title: '任务标题',
  goal: '一句话说明为什么做这个任务。',
  priority: 'core',
  status: 'todo',
  stack: ['技术 1', '技术 2'],
  checklist: ['验收点 1', '验收点 2', '验收点 3']
}
```

`checklist` 写的是验收点，不是教程目录。  
例如“跑通官方数据集”比“学习 FAST-LIO2”更适合。

## 修改顶部文案

改 `routeIntro`：

```js
export const routeIntro = {
  badge: '个人技术路线清单',
  title: '机器人系统技术成长路线',
  summary: '...',
  mainTrack: '...',
  sideTrack: '...',
  finalGoal: '...'
}
```

这里适合写长期方向，不建议写太细的短期任务。

## 修改能力关键词

改 `knowledgeTags`：

```js
{
  title: '算法方向',
  keywords: ['2D SLAM', 'Nav2', 'PCL', 'FAST-LIO2']
}
```

关键词只是归档索引，不一定要覆盖所有任务。

## 验证修改

改完后建议跑：

```bash
npm run generate
```

如果只想本地预览：

```bash
npm run dev -- --host 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:3000/tech-footprint
```

## 不要放到这些目录

这份维护说明不要放到：

- `content/posts`
- `content/wiki`
- `public`

原因：

- `content/` 会被内容系统扫描，可能出现在网站内容里
- `public/` 是静态公开目录，会被直接发布

放在 `docs/` 里最合适，既方便自己看，又不会被页面展示。

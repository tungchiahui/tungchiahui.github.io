<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getCurrentLocaleSlug, replaceLocaleInPath } from '~~/utils/i18n-locales'
import { milestoneList, routeIntro, semesterPlans, tracks } from '~/data/tech-footprint.js'

type Status = 'todo' | 'doing' | 'done'
interface SubtaskRecord { status: Status; progress: number; note: string; updatedAt: string }
interface StoreData { version: 2; records: Record<string, SubtaskRecord> }
const STORAGE_KEY = 'tech_footprint_progress_v2'
const route = useRoute()
const activeSemester = ref(semesterPlans[0].id)
const openTasks = ref<string[]>([semesterPlans[0].tasks[0].id])
const records = ref<Record<string, SubtaskRecord>>({})
const hydrated = ref(false)
const importInput = ref<HTMLInputElement | null>(null)
const feedback = ref<{ tone:'success'|'error'; text:string } | null>(null)
const homePath = computed(() => replaceLocaleInPath('/', getCurrentLocaleSlug(route.path)))
const semester = computed(() => semesterPlans.find(item => item.id === activeSemester.value) || semesterPlans[0])
const allSubtasks = computed(() => semesterPlans.flatMap(s => s.tasks.flatMap(t => t.subtasks.map(st => ({ semester:s, task:t, subtask:st, key:keyOf(s.id,t.id,st.id) })))))
const completed = computed(() => allSubtasks.value.filter(item => recordOf(item.key).progress === 100).length)
const averageProgress = computed(() => Math.round(allSubtasks.value.reduce((sum,item) => sum + recordOf(item.key).progress,0) / Math.max(allSubtasks.value.length,1)))

useHead({ title:'技术足迹 · 三年机器人系统路线', meta:[{ name:'description', content:routeIntro.summary }] })
onMounted(() => {
  try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){ const data=JSON.parse(raw) as StoreData; if(data.version===2 && data.records) records.value=data.records } } catch { records.value={} }
  hydrated.value=true
})
watch(records,()=>{ if(hydrated.value) localStorage.setItem(STORAGE_KEY,JSON.stringify({version:2,records:records.value} satisfies StoreData)) },{deep:true})

function keyOf(semesterId:string,taskId:string,subtaskId:string){ return `${semesterId}/${taskId}/${subtaskId}` }
function recordOf(key:string):SubtaskRecord { return records.value[key] || { status:'todo',progress:0,note:'',updatedAt:'' } }
function update(key:string,patch:Partial<SubtaskRecord>){ const next={...recordOf(key),...patch,updatedAt:new Date().toISOString()}; if(patch.progress!==undefined){next.progress=Math.min(100,Math.max(0,Number(patch.progress)||0));next.status=next.progress===100?'done':next.progress>0?'doing':'todo'}else if(patch.status==='done'){next.progress=100}else if(patch.status==='todo'){next.progress=0}else if(patch.status==='doing'&&next.progress===0){next.progress=5} records.value[key]=next }
function taskProgress(semesterId:string,task:any){ const values=task.subtasks.map((st:any)=>recordOf(keyOf(semesterId,task.id,st.id)).progress); return Math.round(values.reduce((a:number,b:number)=>a+b,0)/Math.max(values.length,1)) }
function toggleTask(id:string){ openTasks.value=openTasks.value.includes(id)?openTasks.value.filter(item=>item!==id):[...openTasks.value,id] }
function chooseImport(){feedback.value=null;importInput.value?.click()}
async function importData(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text()) as StoreData;if(data.version!==2||!data.records)throw new Error();records.value=data.records;feedback.value={tone:'success',text:`已恢复 ${Object.keys(data.records).length} 条小任务记录。`}}catch{feedback.value={tone:'error',text:'导入失败，请选择本页面导出的 JSON 文件。'}}finally{input.value=''}}
function exportData(){const blob=new Blob([JSON.stringify({version:2,records:records.value},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`tech-footprint-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url)}
function clearData(){if(!confirm('确定清空当前浏览器中的全部进度和备注吗？'))return;records.value={};localStorage.removeItem(STORAGE_KEY);feedback.value={tone:'success',text:'本地记录已清空。'}}
</script>

<template>
  <div class="tech-footprint-page">
    <nav class="route-nav"><NuxtLink :to="homePath" class="back-link">返回首页</NuxtLink><span class="nav-divider"></span><span class="nav-current">技术足迹</span></nav>
    <header class="route-hero">
      <div class="hero-copy"><p class="hero-badge">{{routeIntro.badge}}</p><h1>{{routeIntro.title}}</h1><p class="hero-summary">{{routeIntro.summary}}</p><div class="track-panel"><div><span class="track-label">机器人主项目</span><p>{{routeIntro.mainTrack}}</p></div><div><span class="track-label">工业控制副项目</span><p>{{routeIntro.sideTrack}}</p></div></div></div>
      <aside class="hero-card"><span class="hero-card-kicker">最终目标</span><p>{{routeIntro.finalGoal}}</p><div class="hero-metrics"><div class="metric-item"><strong>{{semesterPlans.length}}</strong><span>学习阶段</span><small>2026—2029</small></div><div class="metric-item"><strong>{{allSubtasks.length}}</strong><span>小任务</span><small>可独立记录</small></div><div class="metric-item"><strong>{{completed}}</strong><span>已完成</span><small>进度达到 100%</small></div><div class="metric-item"><strong>{{averageProgress}}%</strong><span>总进度</span><small>自动汇总</small></div></div></aside>
    </header>

    <section class="architecture-section"><div class="section-heading"><p class="section-kicker">PROJECT STRUCTURE</p><h2>一主一副，一条科研线</h2><p>三条线共享 C++、Linux、实时系统、传感器与实验平台，不再横向铺开彼此独立的大项目。</p></div><div class="architecture-grid three-tracks"><article v-for="(track,id,index) in tracks" :key="id" class="architecture-card"><span class="node-number">0{{index+1}}</span><h3>{{track.title}}</h3><p class="node-subtitle">{{track.label}}</p><ul><li v-if="id==='robot'">系统软件旗舰项目，贯穿三年</li><li v-else-if="id==='motion'">研二形成一至两轴实机演示</li><li v-else>围绕激光—惯性—轮速融合</li></ul></article></div></section>

    <section class="roadmap-section"><div class="roadmap-header task-header"><div><p class="section-kicker">LOCAL PROGRESS DATABASE</p><h2>学期计划与执行记录</h2><p>选择学期，再展开大任务填写每个小任务。进度、状态和备注自动保存在当前浏览器。</p></div><div class="save-and-actions"><span class="save-state">● 已自动保存</span><div><input ref="importInput" class="csv-file-input" type="file" accept=".json,application/json" @change="importData"><button class="secondary-button" @click="chooseImport">导入</button><button class="secondary-button" @click="exportData">导出</button><button class="danger-button" @click="clearData">清空</button></div></div></div>
      <div class="semester-tabs"><button v-for="item in semesterPlans" :key="item.id" :class="{active:activeSemester===item.id}" @click="activeSemester=item.id"><span>{{item.stage}}</span><small>{{item.date}}</small></button></div>
      <div class="semester-overview"><div><span>{{semester.stage}} · {{semester.date}}</span><h3>{{semester.focus}}</h3><p>阶段验收：{{semester.milestone}}</p></div><div class="allocation-bars"><span><i :style="{width:semester.allocation[0]+'%'}"></i></span><small>机器人 {{semester.allocation[0]}}% · 工业 {{semester.allocation[1]}}% · 科研 {{semester.allocation[2]}}%</small></div></div>
      <div class="major-task-list"><article v-for="task in semester.tasks" :key="task.id" class="major-task" :class="{open:openTasks.includes(task.id)}">
        <button class="major-task-toggle" @click="toggleTask(task.id)"><span class="project-check" :class="taskProgress(semester.id,task)===100?'status-done':taskProgress(semester.id,task)>0?'status-doing':''"><span v-if="taskProgress(semester.id,task)===100">✓</span></span><span class="major-copy"><small :style="{color:tracks[task.track as keyof typeof tracks].color}">{{tracks[task.track as keyof typeof tracks].label}}</small><strong>{{task.title}}</strong><em>{{task.goal}}</em></span><span class="major-progress"><b>{{taskProgress(semester.id,task)}}%</b><i><u :style="{width:taskProgress(semester.id,task)+'%'}"></u></i></span><span class="expand-icon">{{openTasks.includes(task.id)?'−':'+'}}</span></button>
        <div v-show="openTasks.includes(task.id)" class="subtask-panel"><div class="module-cloud"><span v-for="item in task.stack" :key="item">{{item}}</span></div><div v-for="subtask in task.subtasks" :key="subtask.id" class="subtask-row"><div class="subtask-title"><strong>{{subtask.title}}</strong><small v-if="subtask.acceptance">验收：{{subtask.acceptance}}</small></div><label><span>完成进度</span><div class="progress-input"><input type="range" min="0" max="100" step="5" :value="recordOf(keyOf(semester.id,task.id,subtask.id)).progress" @input="update(keyOf(semester.id,task.id,subtask.id),{progress:Number(($event.target as HTMLInputElement).value)})"><input type="number" min="0" max="100" :value="recordOf(keyOf(semester.id,task.id,subtask.id)).progress" @input="update(keyOf(semester.id,task.id,subtask.id),{progress:Number(($event.target as HTMLInputElement).value)})"><b>%</b></div></label><label><span>状态</span><select :value="recordOf(keyOf(semester.id,task.id,subtask.id)).status" @change="update(keyOf(semester.id,task.id,subtask.id),{status:($event.target as HTMLSelectElement).value as Status})"><option value="todo">待开始</option><option value="doing">进行中</option><option value="done">已完成</option></select></label><label class="subtask-note"><span>记录 / 下一步</span><textarea :value="recordOf(keyOf(semester.id,task.id,subtask.id)).note" placeholder="实验结果、问题或下一步…" @input="update(keyOf(semester.id,task.id,subtask.id),{note:($event.target as HTMLTextAreaElement).value})"></textarea></label></div></div>
      </article></div><p v-if="feedback" class="import-feedback" :class="`tone-${feedback.tone}`">{{feedback.text}}</p><p class="storage-note">数据仅保存在此浏览器的 localStorage；换浏览器或清理网站数据前，请先导出备份。</p>
    </section>

    <section class="priority-section"><div class="section-heading compact"><p class="section-kicker">CHECKPOINTS</p><h2>关键里程碑</h2><p>只有形成可重复的实机结果、测试数据和文档，才算真正完成。</p></div><div class="priority-grid milestone-cards"><article v-for="item in milestoneList" :key="item[0]" class="priority-card"><div class="priority-card-head"><span>{{item[0]}}</span><h3>{{item[1]}}</h3></div></article></div></section>
  </div>
</template>
<style src="~/assets/css/tech-footprint.css" scoped></style>

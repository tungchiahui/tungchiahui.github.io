<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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
const showUnlock = ref(false)
const editSecret = ref('')
const rememberDevice = ref(false)
const unlockError = ref('')
const cloudRevision = ref(0)
const applyingCloud = ref(false)
let syncTimer: ReturnType<typeof setTimeout> | null = null
const cloud = usePersonalCloudStore('tech-footprint')
const homePath = computed(() => replaceLocaleInPath('/', getCurrentLocaleSlug(route.path)))
const semester = computed(() => semesterPlans.find(item => item.id === activeSemester.value) || semesterPlans[0])
const allSubtasks = computed(() => semesterPlans.flatMap(s => s.tasks.flatMap(t => t.subtasks.map(st => ({ semester:s, task:t, subtask:st, key:keyOf(s.id,t.id,st.id) })))))
const completed = computed(() => allSubtasks.value.filter(item => recordOf(item.key).progress === 100).length)
const averageProgress = computed(() => Math.round(allSubtasks.value.reduce((sum,item) => sum + recordOf(item.key).progress,0) / Math.max(allSubtasks.value.length,1)))

useHead({ title:'技术足迹 · 三年机器人系统路线', meta:[{ name:'description', content:routeIntro.summary }] })
onMounted(async () => {
  try { const raw=localStorage.getItem(STORAGE_KEY); if(raw){ const data=JSON.parse(raw) as StoreData; if(data.version===2 && data.records) records.value=data.records } } catch { records.value={} }
  hydrated.value=true
  const remote = await cloud.load<StoreData & { revision:number }>()
  if (remote?.records) {
    applyingCloud.value = true
    records.value = remote.records
    cloudRevision.value = remote.revision
    applyingCloud.value = false
  }
})
watch(records,()=>{ if(!hydrated.value)return;localStorage.setItem(STORAGE_KEY,JSON.stringify({version:2,records:records.value} satisfies StoreData));if(!applyingCloud.value&&cloud.isEditor.value){if(syncTimer)clearTimeout(syncTimer);syncTimer=setTimeout(syncRecords,900)} },{deep:true})
onUnmounted(()=>{if(syncTimer)clearTimeout(syncTimer)})

function keyOf(semesterId:string,taskId:string,subtaskId:string){ return `${semesterId}/${taskId}/${subtaskId}` }
function recordOf(key:string):SubtaskRecord { return records.value[key] || { status:'todo',progress:0,note:'',updatedAt:'' } }
function update(key:string,patch:Partial<SubtaskRecord>){ const next={...recordOf(key),...patch,updatedAt:new Date().toISOString()}; if(patch.progress!==undefined){next.progress=Math.min(100,Math.max(0,Number(patch.progress)||0));next.status=next.progress===100?'done':next.progress>0?'doing':'todo'}else if(patch.status==='done'){next.progress=100}else if(patch.status==='todo'){next.progress=0}else if(patch.status==='doing'&&next.progress===0){next.progress=5} records.value[key]=next }
function taskProgress(semesterId:string,task:any){ const values=task.subtasks.map((st:any)=>recordOf(keyOf(semesterId,task.id,st.id)).progress); return Math.round(values.reduce((a:number,b:number)=>a+b,0)/Math.max(values.length,1)) }
function toggleTask(id:string){ openTasks.value=openTasks.value.includes(id)?openTasks.value.filter(item=>item!==id):[...openTasks.value,id] }
function chooseImport(){feedback.value=null;importInput.value?.click()}
async function importData(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text()) as StoreData;if(data.version!==2||!data.records)throw new Error();records.value=data.records;feedback.value={tone:'success',text:`已恢复 ${Object.keys(data.records).length} 条小任务记录。`}}catch{feedback.value={tone:'error',text:'导入失败，请选择本页面导出的 JSON 文件。'}}finally{input.value=''}}
function exportData(){const blob=new Blob([JSON.stringify({version:2,records:records.value},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`tech-footprint-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url)}
function clearData(){if(!confirm('确定清空当前浏览器中的全部进度和备注吗？'))return;records.value={};localStorage.removeItem(STORAGE_KEY);feedback.value={tone:'success',text:'本地记录已清空。'}}
async function enterEditMode(){unlockError.value='';try{await cloud.unlock(editSecret.value,rememberDevice.value);showUnlock.value=false;editSecret.value='';await syncRecords()}catch(error){unlockError.value=error instanceof Error?error.message:'无法进入编辑模式。'}}
async function syncRecords(){try{const saved=await cloud.save({version:2,revision:cloudRevision.value,records:records.value});cloudRevision.value=(saved as any).revision}catch(error){feedback.value={tone:'error',text:error instanceof Error?error.message:'同步失败。'}}}
</script>

<template>
  <div class="tech-footprint-page">
    <nav class="route-nav"><NuxtLink :to="homePath" class="back-link">返回首页</NuxtLink><span class="nav-divider"></span><span class="nav-current">技术足迹</span></nav>
    <header class="route-hero">
      <div class="hero-copy"><p class="hero-badge">{{routeIntro.badge}}</p><h1>{{routeIntro.title}}</h1><p class="hero-summary">{{routeIntro.summary}}</p><div class="hero-edit-row"><span>{{cloud.syncState.value==='syncing'?'正在同步…':cloud.syncState.value==='synced'?'已同步云端':cloud.syncState.value==='error'?'云端暂不可用':'公开只读数据'}}</span><button v-if="!cloud.isEditor.value" class="secondary-button" @click="showUnlock=true">进入编辑模式</button><button v-else class="secondary-button" @click="cloud.lock()">退出编辑模式</button></div><div class="track-panel"><div><span class="track-label">机器人主项目</span><p>{{routeIntro.mainTrack}}</p></div><div><span class="track-label">工业控制副项目</span><p>{{routeIntro.sideTrack}}</p></div></div></div>
      <aside class="hero-card"><span class="hero-card-kicker">最终目标</span><p>{{routeIntro.finalGoal}}</p><div class="hero-metrics"><div class="metric-item"><strong>{{semesterPlans.length}}</strong><span>学习阶段</span><small>2026—2029</small></div><div class="metric-item"><strong>{{allSubtasks.length}}</strong><span>小任务</span><small>可独立记录</small></div><div class="metric-item"><strong>{{completed}}</strong><span>已完成</span><small>进度达到 100%</small></div><div class="metric-item"><strong>{{averageProgress}}%</strong><span>总进度</span><small>自动汇总</small></div></div></aside>
    </header>

    <section class="architecture-section"><div class="section-heading"><p class="section-kicker">PROJECT STRUCTURE</p><h2>一主一副，一条科研线</h2><p>三条线共享 C++、Linux、实时系统、传感器与实验平台，不再横向铺开彼此独立的大项目。</p></div><div class="architecture-grid three-tracks"><article v-for="(track,id,index) in tracks" :key="id" class="architecture-card"><span class="node-number">0{{index+1}}</span><h3>{{track.title}}</h3><p class="node-subtitle">{{track.label}}</p><ul><li v-if="id==='robot'">系统软件旗舰项目，贯穿三年</li><li v-else-if="id==='motion'">研二形成一至两轴实机演示</li><li v-else>围绕激光—惯性—轮速融合</li></ul></article></div></section>

    <section class="roadmap-section"><div class="roadmap-header task-header"><div><p class="section-kicker">CLOUD PROGRESS DATABASE</p><h2>学期计划与执行记录</h2><p>访客可以查看公开进度；进入编辑模式后，修改会先保存到浏览器，再自动同步至 Blob。</p></div><div class="save-and-actions"><span class="save-state">● {{cloud.isEditor.value?(cloud.remembered.value?'编辑模式 · 已记住设备':'编辑模式 · 本次使用'):'公开只读模式'}}</span><div v-if="cloud.isEditor.value"><input ref="importInput" class="csv-file-input" type="file" accept=".json,application/json" @change="importData"><button class="secondary-button" @click="chooseImport">导入</button><button class="secondary-button" @click="exportData">导出</button><button class="danger-button" @click="clearData">清空</button></div></div></div>
      <div class="semester-tabs"><button v-for="item in semesterPlans" :key="item.id" :class="{active:activeSemester===item.id}" @click="activeSemester=item.id"><span>{{item.stage}}</span><small>{{item.date}}</small></button></div>
      <div class="semester-overview"><div><span>{{semester.stage}} · {{semester.date}}</span><h3>{{semester.focus}}</h3><p>阶段验收：{{semester.milestone}}</p></div><div class="allocation-bars"><span><i :style="{width:semester.allocation[0]+'%'}"></i></span><small>机器人 {{semester.allocation[0]}}% · 工业 {{semester.allocation[1]}}% · 科研 {{semester.allocation[2]}}%</small></div></div>
      <div class="major-task-list"><article v-for="task in semester.tasks" :key="task.id" class="major-task" :class="{open:openTasks.includes(task.id)}">
        <button class="major-task-toggle" @click="toggleTask(task.id)"><span class="project-check" :class="taskProgress(semester.id,task)===100?'status-done':taskProgress(semester.id,task)>0?'status-doing':''"><span v-if="taskProgress(semester.id,task)===100">✓</span></span><span class="major-copy"><small :style="{color:tracks[task.track as keyof typeof tracks].color}">{{tracks[task.track as keyof typeof tracks].label}}</small><strong>{{task.title}}</strong><em>{{task.goal}}</em></span><span class="major-progress"><b>{{taskProgress(semester.id,task)}}%</b><i><u :style="{width:taskProgress(semester.id,task)+'%'}"></u></i></span><span class="expand-icon">{{openTasks.includes(task.id)?'−':'+'}}</span></button>
        <div v-show="openTasks.includes(task.id)" class="subtask-panel"><div class="module-cloud"><span v-for="item in task.stack" :key="item">{{item}}</span></div><div v-for="subtask in task.subtasks" :key="subtask.id" class="subtask-row"><div class="subtask-title"><strong>{{subtask.title}}</strong><small v-if="subtask.acceptance">验收：{{subtask.acceptance}}</small></div><label><span>完成进度</span><div class="progress-input"><input type="range" min="0" max="100" step="5" :disabled="!cloud.isEditor.value" :value="recordOf(keyOf(semester.id,task.id,subtask.id)).progress" @input="update(keyOf(semester.id,task.id,subtask.id),{progress:Number(($event.target as HTMLInputElement).value)})"><input type="number" min="0" max="100" :disabled="!cloud.isEditor.value" :value="recordOf(keyOf(semester.id,task.id,subtask.id)).progress" @input="update(keyOf(semester.id,task.id,subtask.id),{progress:Number(($event.target as HTMLInputElement).value)})"><b>%</b></div></label><label><span>状态</span><select :disabled="!cloud.isEditor.value" :value="recordOf(keyOf(semester.id,task.id,subtask.id)).status" @change="update(keyOf(semester.id,task.id,subtask.id),{status:($event.target as HTMLSelectElement).value as Status})"><option value="todo">待开始</option><option value="doing">进行中</option><option value="done">已完成</option></select></label><label class="subtask-note"><span>记录 / 下一步</span><textarea :disabled="!cloud.isEditor.value" :value="recordOf(keyOf(semester.id,task.id,subtask.id)).note" placeholder="实验结果、问题或下一步…" @input="update(keyOf(semester.id,task.id,subtask.id),{note:($event.target as HTMLTextAreaElement).value})"></textarea></label></div></div>
      </article></div><p v-if="feedback" class="import-feedback" :class="`tone-${feedback.tone}`">{{feedback.text}}</p><p class="storage-note">公开数据来自 Blob；编辑时仍保留 localStorage 离线副本，写入前云端会自动备份。</p>
    </section>

    <div v-if="showUnlock" class="edit-modal" @click.self="showUnlock=false"><form class="edit-dialog" @submit.prevent="enterEditMode"><p class="section-kicker">OWNER ACCESS</p><h2>进入编辑模式</h2><p>编辑密钥只用于换取签名令牌，不会写入网站数据。</p><label><span>编辑密钥</span><input v-model="editSecret" type="password" autocomplete="current-password" required autofocus></label><label class="remember-option"><input v-model="rememberDevice" type="checkbox"><span>记住此设备（否则关闭浏览器后失效）</span></label><p v-if="unlockError" class="unlock-error">{{unlockError}}</p><div><button type="button" class="secondary-button" @click="showUnlock=false">取消</button><button type="submit" class="unlock-button">解锁编辑</button></div></form></div>

    <section class="priority-section"><div class="section-heading compact"><p class="section-kicker">CHECKPOINTS</p><h2>关键里程碑</h2><p>只有形成可重复的实机结果、测试数据和文档，才算真正完成。</p></div><div class="priority-grid milestone-cards"><article v-for="item in milestoneList" :key="item[0]" class="priority-card"><div class="priority-card-head"><span>{{item[0]}}</span><h3>{{item[1]}}</h3></div></article></div></section>
  </div>
</template>
<style src="~/assets/css/tech-footprint.css" scoped></style>

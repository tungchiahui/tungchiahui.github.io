<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue'
import mediumZoom from 'medium-zoom'

const route = useRoute()
const { data: page, pending } = await useAsyncData('page-' + route.path, () => {
  const cleanPath = route.path.replace(/\/$/, '') || '/'
  return queryCollection('content').path(cleanPath).first()
})

if (!pending.value && !page.value) {
  throw createError({ statusCode: 404, statusMessage: '页面不存在' })
}

// 控制移动端目录显示
const showToc = ref(false)

// 缓存 zoom 实例
let zoom: any = null

const enhanceContent = async () => {
  await nextTick()

  // 1. 代码块处理 (完全还原你的原始逻辑)
  const blocks = document.querySelectorAll('.content-body pre') as NodeListOf<HTMLElement>
  blocks.forEach((block) => {
    if (block.querySelector('.code-tag-wrapper')) return
    const wrapper = document.createElement('div')
    wrapper.className = 'code-tag-wrapper'
    const langClass = Array.from(block.classList).find(c => c.startsWith('language-'))
    const langText = langClass ? langClass.replace('language-', '').toUpperCase() : ''
    
    if (langText) {
      const langTag = document.createElement('span')
      langTag.className = 'code-lang-label'
      langTag.innerText = langText
      wrapper.appendChild(langTag)
    }

    const copyBtn = document.createElement('button')
    copyBtn.className = 'copy-code-button'
    copyBtn.type = 'button'
    copyBtn.innerText = '复制'
    copyBtn.addEventListener('click', async () => {
      const code = block.querySelector('code') as HTMLElement | null
      const text = code ? code.innerText : block.innerText
      try {
        await navigator.clipboard.writeText(text)
        copyBtn.innerText = '已复制!'
        copyBtn.classList.add('copied')
        setTimeout(() => {
          copyBtn.innerText = '复制'
          copyBtn.classList.remove('copied')
        }, 2000)
      } catch (err) {
        copyBtn.innerText = '错误'
      }
    })
    wrapper.appendChild(copyBtn)
    block.appendChild(wrapper)
  })

  // 2. 图片放大处理
  if (zoom) zoom.detach()
  zoom = mediumZoom('.content-body img', {
    margin: 24,
    background: 'rgba(0, 0, 0, 0.7)', 
    scrollOffset: 0,
  })
}

onMounted(enhanceContent)
watch(() => page.value, () => {
  enhanceContent()
})

const closeToc = () => {
  showToc.value = false
}
</script>

<template>
  <div class="blog-wrapper">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">← 返回首页</NuxtLink>
    </nav>

    <button 
      v-if="page?.body?.toc?.links?.length" 
      class="mobile-toc-trigger" 
      @click="showToc = true"
    >
      <span class="icon">目</span> 目录
    </button>

    <div v-if="pending" class="status">加载中...</div>

    <div v-else-if="page" class="article-layout">
      <Transition name="fade">
        <div v-if="showToc" class="toc-overlay" @click="showToc = false"></div>
      </Transition>

      <article class="main-content">
        <header>
          <h1 class="page-main-title">{{ page.title }}</h1>
          <div class="date">{{ page.date }}</div>
        </header>
        
        <div class="content-body">
          <ContentRenderer :value="page" />
        </div>
        
        <footer class="article-footer">--- END ---</footer>
      </article>

      <aside 
        v-if="page.body?.toc?.links?.length" 
        class="toc-sidebar"
        :class="{ 'is-mobile-open': showToc }"
      >
        <div class="toc-header-mobile">
          <h3 class="toc-title">目录</h3>
          <button class="close-btn" @click="showToc = false">×</button>
        </div>
        
        <nav class="toc-list-container">
          <div v-for="link in page.body.toc.links" :key="link.id" class="toc-item">
            <a :href="`#${link.id}`" class="toc-link" @click="closeToc">{{ link.text }}</a>
            <div v-if="link.children" class="toc-sublist">
              <div v-for="sublink in link.children" :key="sublink.id" class="toc-subitem">
                <a :href="`#${sublink.id}`" class="toc-link" @click="closeToc">{{ sublink.text }}</a>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   1. 基础布局适配
   ============================================================ */
.blog-wrapper { 
  max-width: 1100px; 
  margin: 0 auto; 
  padding: 30px 20px; 
  font-family: sans-serif; 
  color: var(--text-main, #333); 
  /* PC端不设置 overflow-x，否则 sticky 目录会失效 */
  position: relative;
  width: 100%;
  box-sizing: border-box;
}
.top-nav { margin-bottom: 30px; }
.back-link { color: #00c58e; text-decoration: none; font-weight: bold; }

.mobile-toc-trigger {
  display: none;
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: rgba(240, 253, 244, 0.8);
  backdrop-filter: blur(8px);
  color: #00c58e;
  border: 1px solid #dcfce7;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 197, 142, 0.15);
}
:global(html.dark) .mobile-toc-trigger { background: rgba(6, 78, 59, 0.8); color: #34d399; border-color: #065f46; }

/* 核心修复：PC端 article-layout 绝不能设 overflow: hidden，否则目录不吸顶 */
.article-layout { 
  display: flex; 
  gap: 40px; 
  width: 100%; 
  position: relative; 
  align-items: flex-start;
}
.main-content { 
  flex: 1; 
  min-width: 0; 
}

/* ============================================================
   2. 正文样式 (保持不变)
   ============================================================ */
.content-body { line-height: 1.8; font-size: 1.1rem; counter-reset: h2counter; word-wrap: break-word; overflow-wrap: break-word; }
:deep(.content-body img) { 
  max-width: 100%; height: auto; display: block; margin: 1.5rem 0; border-radius: 8px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--nav-border, #eee); cursor: zoom-in; 
}
:global(html.dark) :deep(.content-body img) { filter: brightness(0.8); } 
:deep(.content-body a) { color: #00c58e; word-break: break-all; }

/* ============================================================
   2.1 表格美化 (修复移动端溢出)
   ============================================================ */
/* 核心修复：确保容器本身不溢出 */
.content-body {
  width: 100%;
  overflow-x: hidden; /* 防止内容意外撑破 */
}

/* 针对表格的滚动容器处理 */
:deep(.content-body table) {
  width: 100%;
  display: block;      /* 关键：让 table 表现得像块级元素 */
  overflow-x: auto;    /* 关键：允许内部横向滚动 */
  white-space: nowrap; /* 可选：防止内容折行强制横滑，视需求开启 */
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid #d1d5db;
  background-color: #fff;
  
  /* 优化：在移动端显示滚动条提示 */
  scrollbar-width: thin; 
}

/* 针对某些渲染情况，如果是 div 包裹 table，可如下设置： */
:deep(.content-body .table-wrapper) {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.content-body th) {
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 600;
  text-align: left;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-bottom: 2px solid #00c58e;
}

:deep(.content-body td) {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

/* 斑马纹和悬浮效果保持不变... */
:deep(.content-body tr:nth-child(even)) { background-color: #f9fafb; }
:deep(.content-body tr:hover td) { background-color: #ecfdf5; color: #059669; }

/* 深色模式适配保持不变... */
:global(html.dark) :deep(.content-body table) { background-color: #1a1a1a; border-color: #374151; }
:global(html.dark) :deep(.content-body th) { background-color: #2d2d2d; color: #e5e7eb; border-color: #4b5563; border-bottom-color: #34d399; }
:global(html.dark) :deep(.content-body td) { border-color: #374151; color: #d1d5db; }

/* 移动端特殊处理：移除之前强制 min-width 500px 的逻辑，改用 display: block */
@media (max-width: 768px) {
  :deep(.content-body table) {
    display: block; /* 必须为 block 才能生效 overflow-x */
    width: 100%;
    -webkit-overflow-scrolling: touch; /* iOS 丝滑滚动 */
  }
}


/* ============================================================
   3. 自动编号 (保持不变)
   ============================================================ */
:deep(.content-body h2) { counter-reset: h3counter; margin-top: 1.8rem; color: var(--text-main, #222); }
:deep(.content-body h2)::before { counter-increment: h2counter; content: counter(h2counter) ". "; color: #00c58e; margin-right: 0.5rem; font-weight: bold; }
:deep(.content-body h3) { counter-reset: h4counter; margin-top: 1.5rem; color: var(--text-main, #222); }
:deep(.content-body h3)::before { counter-increment: h3counter; content: counter(h2counter) "." counter(h3counter) " "; color: #00c58e; font-size: 0.9em; margin-right: 0.5rem; }
:deep(.content-body h4) { margin-top: 1.2rem; color: var(--text-main, #222); }
:deep(.content-body h4)::before { counter-increment: h4counter; content: counter(h2counter) "." counter(h3counter) "." counter(h4counter) " "; color: #00c58e; font-size: 0.8em; margin-right: 0.5rem; }

/* ============================================================
   4. 目录逻辑 (同步平滑版)
   ============================================================ */
.toc-sidebar { 
  width: 220px; 
  flex-shrink: 0; 
  padding-left: 15px; 
  border-left: 2px solid var(--nav-border, #f0f0f0); 
  
  /* 核心：原生 CSS 吸顶，与滑动完全同步 */
  position: sticky; 
  top: 20px; 
  align-self: flex-start; /* 必须设置，否则侧边栏高度会撑满父级导致吸顶失效 */
  
  /* 优化：如果目录超长可内部滚动 */
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  scrollbar-width: none;
}
.toc-sidebar::-webkit-scrollbar { display: none; }

.toc-header-mobile { display: none; }
.toc-title { margin-bottom: 15px; font-size: 1.1rem; color: var(--text-main, #444); }
.toc-list-container { counter-reset: t1; }
.toc-item { counter-reset: t2; margin-bottom: 8px; }
.toc-item > .toc-link::before { counter-increment: t1; content: counter(t1) ". "; color: #00c58e; font-weight: bold; margin-right: 4px; }
.toc-subitem > .toc-link::before { counter-increment: t2; content: counter(t1) "." counter(t2) " "; font-size: 0.85em; margin-right: 4px; color: #00c58e; font-weight: bold; }
.toc-link { font-size: 0.9rem; color: var(--text-main, #666); text-decoration: none; transition: color 0.2s; }
.toc-link:hover { color: #00c58e; }

/* ============================================================
   5. 代码块美化 (修复高亮消失问题)
   ============================================================ */
:deep(pre) { 
  /* 1. 基础背景： light 模式背景，dark 模式通过下方的 global 覆盖 */
  background-color: #f6f8fa !important; 
  border: 1px solid #e1e4e8; 
  
  /* 2. 布局：顶部留出 40px 给语言标签和复制按钮 */
  padding: 40px 16px 16px 16px; 
  border-radius: 8px; 
  margin: 24px 0; 
  position: relative; 
  overflow-x: auto; 
  
  /* 3. 字体设置 */
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* 移除之前杀掉颜色的 inherit 配置，让 Shiki 内联颜色生效 */
:deep(pre code) {
  background: transparent !important;
}

/* 深色模式背景适配 */
:global(html.dark) :deep(pre) { 
  background-color: #0d1117 !important; 
  border-color: #30363d; 
}

/* 代码标签栏容器 (对应你 JS 生成的 .code-tag-wrapper) */
:deep(.code-tag-wrapper) { 
  position: absolute; 
  top: 0; 
  left: 0; 
  right: 0; 
  height: 32px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 12px; 
  border-bottom: 1px solid rgba(0,0,0,0.05); 
  background: rgba(0,0,0,0.03); 
}

:global(html.dark) :deep(.code-tag-wrapper) { 
  background: rgba(255,255,255,0.05); 
  border-bottom-color: rgba(255,255,255,0.1); 
}

/* 语言名称标签 */
:deep(.code-lang-label) { 
  font-family: sans-serif; 
  font-size: 0.7rem; 
  font-weight: bold; 
  color: #888; 
  text-transform: uppercase; 
  letter-spacing: 1px; 
}

/* 复制按钮 */
:deep(.copy-code-button) { 
  padding: 2px 8px; 
  background: #fff; 
  border: 1px solid #ddd; 
  border-radius: 4px; 
  font-size: 0.7rem; 
  color: #666; 
  cursor: pointer; 
  opacity: 0; 
  transition: all 0.2s; 
}

:global(html.dark) :deep(.copy-code-button) {
  background: #21262d;
  border-color: #30363d;
  color: #c9d1d9;
}

:deep(pre:hover .copy-code-button) { 
  opacity: 1; 
}

:deep(.copy-code-button:hover) { 
  background: #00c58e !important; 
  color: white !important; 
  border-color: #00c58e !important; 
}

/* 针对 Shiki 样式的微调（防止某些情况下 span 颜色失效） */
:deep(.shiki span) {
  background: transparent !important;
}

/* ============================================================
   6. 移动端优化 (仅在移动端锁死晃动，不影响PC端吸顶)
   ============================================================ */
@media (max-width: 900px) {
  /* 仅在移动端强制锁死横向晃动 */
  :global(body) {
    overflow-x: hidden !important;
    width: 100% !important;
  }

  .blog-wrapper {
    padding: 20px 15px;
    overflow-x: hidden; /* 移动端开启，防止晃动 */
  }

  .mobile-toc-trigger { display: block; }
  
  .article-layout { 
    flex-direction: column; 
    width: 100%; 
    gap: 20px;
    overflow: visible; /* 确保移动端内容可见 */
  }

  .main-content {
    width: 100%;
    min-width: 0; 
    max-width: 100%;
  }

  /* 修复移动端内容溢出：这里锁死，内部 table 依然可以横滑 */
  .content-body {
    width: 100%;
    overflow-x: hidden; 
  }

  .toc-sidebar {
    position: fixed; 
    top: 0; 
    right: 0; 
    width: 280px; 
    height: 100vh;
    background: var(--bg-main, #fff); 
    z-index: 2001; 
    margin: 0; 
    padding: 25px; 
    border-left: none;
    box-shadow: -10px 0 25px rgba(0,0,0,0.1);
    transform: translateX(100%); 
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: none;
    overflow-y: auto;
  }

  :global(html.dark) .toc-sidebar { background: #1a1a1a; }
  .toc-sidebar.is-mobile-open { transform: translateX(0); }
  
  .toc-header-mobile { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 20px; 
    border-bottom: 1px solid #eee; 
    padding-bottom: 10px; 
  }
  
  .close-btn { 
    background: #f5f5f5; 
    border: none; 
    font-size: 24px; 
    width: 32px; 
    height: 32px; 
    border-radius: 50%; 
    color: #999; 
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}
</style>
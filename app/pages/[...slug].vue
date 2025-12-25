<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import mediumZoom from 'medium-zoom'

const route = useRoute()
const { data: page, pending } = await useAsyncData('page-' + route.path, () => {
  const cleanPath = route.path.replace(/\/$/, '') || '/'
  return queryCollection('content').path(cleanPath).first()
})

if (!pending.value && !page.value) {
  throw createError({ statusCode: 404, statusMessage: '页面不存在', fatal: true })
}

// 缓存 zoom 实例，防止重复创建
let zoom: any = null

const enhanceContent = async () => {
  await nextTick()

  // 1. 代码块处理
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

  // 2. 图片放大处理 - 修复重复绑定问题
  if (zoom) zoom.detach() // 如果已有实例先卸载
  zoom = mediumZoom('.content-body img', {
    margin: 24,
    background: 'rgba(0, 0, 0, 0.7)', // 稍微降低一点暗度
    scrollOffset: 0,
  })
}

onMounted(enhanceContent)
// 移除 onUpdated，改用 watch 监听数据变化
watch(() => page.value, () => {
  enhanceContent()
})
</script>

<template>
  <div class="blog-wrapper">
    <nav class="top-nav">
      <NuxtLink to="/" class="back-link">← 返回首页</NuxtLink>
    </nav>

    <div v-if="pending" class="status">加载中...</div>

    <div v-else-if="page" class="article-layout">
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

      <aside v-if="page.body?.toc?.links?.length" class="toc-sidebar">
        <h3 class="toc-title">目录</h3>
        <nav class="toc-list-container">
          <div v-for="link in page.body.toc.links" :key="link.id" class="toc-item">
            <a :href="`#${link.id}`" class="toc-link">{{ link.text }}</a>
            <div v-if="link.children" class="toc-sublist">
              <div v-for="sublink in link.children" :key="sublink.id" class="toc-subitem">
                <a :href="`#${sublink.id}`" class="toc-link">{{ sublink.text }}</a>
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
  overflow-x: hidden; 
}
.top-nav { margin-bottom: 30px; }
.back-link { color: #00c58e; text-decoration: none; font-weight: bold; }
.article-layout { display: flex; gap: 40px; width: 100%; }
.main-content { flex: 1; min-width: 0; }

.page-main-title { 
  font-size: 2.2rem; 
  margin-bottom: 10px; 
  color: var(--text-main, #222); 
}
.date { color: var(--footer-text, #999); margin-bottom: 30px; font-size: 0.9rem; }

/* ============================================================
   2. 正文样式
   ============================================================ */
.content-body { line-height: 1.8; font-size: 1.1rem; counter-reset: h2counter; word-wrap: break-word; overflow-wrap: break-word; }
:deep(.content-body img) { 
  max-width: 100%; height: auto; display: block; margin: 1.5rem 0; border-radius: 8px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--nav-border, #eee); cursor: zoom-in; 
}
:global(html.dark) :deep(.content-body img) { filter: brightness(0.8); } 
:deep(.content-body a) { color: #00c58e; word-break: break-all; }

/* ============================================================
   3. 自动编号
   ============================================================ */
:deep(.content-body h2) { counter-reset: h3counter; margin-top: 1.8rem; color: var(--text-main, #222); }
:deep(.content-body h2)::before { counter-increment: h2counter; content: counter(h2counter) ". "; color: #00c58e; margin-right: 0.5rem; font-weight: bold; }

:deep(.content-body h3) { counter-reset: h4counter; margin-top: 1.5rem; color: var(--text-main, #222); }
:deep(.content-body h3)::before { counter-increment: h3counter; content: counter(h2counter) "." counter(h3counter) " "; color: #00c58e; font-size: 0.9em; margin-right: 0.5rem; }

:deep(.content-body h4) { margin-top: 1.2rem; color: var(--text-main, #222); }
:deep(.content-body h4)::before { counter-increment: h4counter; content: counter(h2counter) "." counter(h3counter) "." counter(h4counter) " "; color: #00c58e; font-size: 0.8em; margin-right: 0.5rem; }

/* ============================================================
   4. 目录编号
   ============================================================ */
.toc-sidebar { width: 220px; position: sticky; top: 20px; border-left: 2px solid var(--nav-border, #f0f0f0); padding-left: 15px; flex-shrink: 0; }
.toc-title { margin-bottom: 15px; font-size: 1.1rem; color: var(--text-main, #444); }
.toc-list-container { counter-reset: t1; }

.toc-item { counter-reset: t2; margin-bottom: 8px; }
.toc-item > .toc-link::before {
  counter-increment: t1;
  content: counter(t1) ". ";
  color: #00c58e;
  font-weight: bold;
  margin-right: 4px;
}

.toc-subitem > .toc-link::before {
  counter-increment: t2;
  content: counter(t1) "." counter(t2) " ";
  font-size: 0.85em;
  margin-right: 4px;
  color: #00c58e; 
  font-weight: bold; 
}

.toc-link { font-size: 0.9rem; color: var(--text-main, #666); text-decoration: none; transition: color 0.2s; }
.toc-link:hover { color: #00c58e; }

/* ============================================================
   5. 代码块美化
   ============================================================ */
:deep(pre) { 
  background-color: #f6f8fa !important; 
  border: 1px solid #e1e4e8; 
  padding: 40px 16px 16px 16px; border-radius: 8px; margin: 24px 0; position: relative; overflow-x: auto; 
}

:global(html.dark) :deep(pre) {
  background-color: #1e1e1e !important; 
  border-color: #333;
}

:deep(pre code) { 
  color: #24292e !important; 
  font-family: 'Fira Code', monospace; font-size: 0.95rem; line-height: 1.6; 
}

:global(html.dark) :deep(pre code),
:global(html.dark) :deep(pre span) {
  color: #d4d4d4 !important; 
}

:deep(.code-tag-wrapper) { 
  position: absolute; top: 0; left: 0; right: 0; height: 32px; display: flex; justify-content: space-between; align-items: center; padding: 0 12px; 
  border-bottom: 1px solid rgba(0,0,0,0.05); background: rgba(0,0,0,0.02); 
}

:global(html.dark) :deep(.code-tag-wrapper) {
  background: rgba(255,255,255,0.05);
  border-bottom-color: rgba(255,255,255,0.1);
}

:deep(.code-lang-label) { font-family: sans-serif; font-size: 0.7rem; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 1px; }

:deep(.copy-code-button) { 
  padding: 2px 8px; background: transparent; border: 1px solid var(--nav-border, #ddd); 
  border-radius: 4px; font-size: 0.7rem; color: var(--footer-text, #666); cursor: pointer; opacity: 0; transition: all 0.2s; 
}

:deep(pre:hover .copy-code-button) { opacity: 1; }
:deep(.copy-code-button:hover) { background: #00c58e; color: white; border-color: #00c58e; }

/* ============================================================
   6. 其他修复 (z-index 提高)
   ============================================================ */
:deep(.medium-zoom-overlay) { z-index: 10000 !important; }
:deep(.medium-zoom-image--opened) { z-index: 10001 !important; }

@media (max-width: 900px) { .article-layout { flex-direction: column; } .toc-sidebar { display: none; } }
.article-footer { margin-top: 50px; text-align: center; color: var(--footer-text, #eee); padding-bottom: 50px; }
</style>
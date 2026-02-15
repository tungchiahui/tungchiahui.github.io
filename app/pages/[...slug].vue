<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import mediumZoom from 'medium-zoom'

// ============================================================
// 类型定义
// ============================================================
interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

interface BlogPost {
  _id: string
  _path: string
  stem?: string
  title: string
  description?: string
  date?: string
  body?: {
    toc?: {
      links?: TocLink[]
    }
  }
  [key: string]: any
}

// ============================================================
// 路由和数据获取
// ============================================================
const route = useRoute()

// 修复：正确的类型断言
const { data: page, pending } = await useAsyncData(
  `page-${route.path}`,
  async () => {
    const cleanPath = route.path.replace(/\/$/, '') || '/'
    const result = await queryCollection('content')
      .path(cleanPath)
      .first()
    return result as BlogPost | null
  }
)

// 修复：上一篇/下一篇，避免SQL错误
const { data: surroundingPosts } = await useAsyncData(
  `surrounding-${route.path}`,
  async () => {
    if (!page.value) return [null, null] as [BlogPost | null, BlogPost | null]
    
    try {
      // 修复：移除有问题的 where 条件，直接获取所有内容
      const allPosts = await queryCollection('content').all()
      
      // 过滤出 markdown 文件
      const markdownPosts = allPosts.filter((p: any) => 
        p._path && p._path.includes('/')
      ) as BlogPost[]
      
      if (!markdownPosts || markdownPosts.length === 0) {
        return [null, null] as [BlogPost | null, BlogPost | null]
      }
      
      // 按路径排序
      const sortedPosts = markdownPosts.sort((a, b) => 
        a._path.localeCompare(b._path)
      )
      
      // 找到当前文章的索引
      const currentIndex = sortedPosts.findIndex(p => 
        p._path === route.path
      )
      
      if (currentIndex === -1) {
        return [null, null] as [BlogPost | null, BlogPost | null]
      }
      
      // 返回 [上一篇, 下一篇]
      return [
        currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
        currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null
      ] as [BlogPost | null, BlogPost | null]
    } catch (error) {
      console.error('获取相邻文章失败:', error)
      return [null, null] as [BlogPost | null, BlogPost | null]
    }
  }
)

// 404 处理
if (!pending.value && !page.value) {
  throw createError({ 
    statusCode: 404, 
    statusMessage: '页面不存在',
    fatal: true 
  })
}

// ============================================================
// SEO 优化
// ============================================================
const title = computed(() => (page.value as BlogPost)?.title || '加载中...')
const description = computed(() => 
  (page.value as BlogPost)?.description || (page.value as BlogPost)?.title || ''
)

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:type', content: 'article' },
  ]
})

// ============================================================
// 阅读时间估算
// ============================================================
const readingTime = computed(() => {
  const pageData = page.value as BlogPost
  if (!pageData?.body) return 0
  const text = JSON.stringify(pageData.body)
  const wordsPerMinute = 200
  const wordCount = text.length / 5
  return Math.ceil(wordCount / wordsPerMinute)
})

// ============================================================
// 日期格式化
// ============================================================
const formattedDate = computed(() => {
  const pageData = page.value as BlogPost
  if (!pageData?.date) return ''
  const date = new Date(pageData.date)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// ============================================================
// 目录相关 - 支持3层
// ============================================================
const showToc = ref(false)
const activeHeadingId = ref<string>('')
const maxTocDepth = 4  // 提高到4层，确保能显示h4

const filterTocByDepth = (links: TocLink[] | undefined): TocLink[] => {
  if (!links) return []
  
  return links
    .filter(link => link.depth <= maxTocDepth)
    .map(link => ({
      ...link,
      children: link.children ? filterTocByDepth(link.children) : undefined
    }))
}

const filteredTocLinks = computed(() => {
  const pageData = page.value as BlogPost
  return filterTocByDepth(pageData?.body?.toc?.links)
})

// ============================================================
// 阅读进度
// ============================================================
const readingProgress = ref(0)

const updateReadingProgress = () => {
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY
  const trackLength = documentHeight - windowHeight
  const progress = (scrollTop / trackLength) * 100
  readingProgress.value = Math.min(100, Math.max(0, progress))
}

// ============================================================
// 目录激活状态
// ============================================================
const updateActiveHeading = () => {
  const pageData = page.value as BlogPost
  if (!pageData?.body?.toc?.links?.length) return

  const headings = document.querySelectorAll('.content-body h2, .content-body h3, .content-body h4')
  const scrollPosition = window.scrollY + 100

  let active = ''
  headings.forEach((heading) => {
    const element = heading as HTMLElement
    if (element.offsetTop <= scrollPosition) {
      active = element.id
    }
  })

  activeHeadingId.value = active
}

// ============================================================
// 图片放大
// ============================================================
let zoomInstance: ReturnType<typeof mediumZoom> | null = null

const initImageZoom = () => {
  if (zoomInstance) {
    zoomInstance.detach()
  }
  zoomInstance = mediumZoom('.content-body img', {
    margin: 24,
    background: 'rgba(0, 0, 0, 0.8)',
    scrollOffset: 0,
  })
}

// ============================================================
// 代码块增强
// ============================================================
const enhanceCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.content-body pre') as NodeListOf<HTMLElement>
  
  codeBlocks.forEach((block) => {
    if (block.querySelector('.code-toolbar')) return

    const toolbar = document.createElement('div')
    toolbar.className = 'code-toolbar'

    const langClass = Array.from(block.classList).find(c => c.startsWith('language-'))
    const language = langClass ? langClass.replace('language-', '').toUpperCase() : 'TEXT'

    if (language) {
      const langLabel = document.createElement('span')
      langLabel.className = 'code-language'
      langLabel.textContent = language
      toolbar.appendChild(langLabel)
    }

    const copyButton = document.createElement('button')
    copyButton.className = 'code-copy-btn'
    copyButton.type = 'button'
    copyButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>复制</span>
    `

    copyButton.addEventListener('click', async () => {
      const code = block.querySelector('code')
      const text = code?.textContent || block.textContent || ''

      try {
        await navigator.clipboard.writeText(text)
        copyButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>已复制</span>
        `
        copyButton.classList.add('copied')
        
        setTimeout(() => {
          copyButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>复制</span>
          `
          copyButton.classList.remove('copied')
        }, 2000)
      } catch (error) {
        console.error('复制失败:', error)
      }
    })

    toolbar.appendChild(copyButton)
    // 修复：将工具栏插入到 pre 的最前面，而不是最后
    block.insertBefore(toolbar, block.firstChild)
  })
}

const enhanceContent = async () => {
  await nextTick()
  enhanceCodeBlocks()
  initImageZoom()
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  enhanceContent()
  window.addEventListener('scroll', updateReadingProgress)
  window.addEventListener('scroll', updateActiveHeading)
  updateReadingProgress()
  updateActiveHeading()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingProgress)
  window.removeEventListener('scroll', updateActiveHeading)
  if (zoomInstance) {
    zoomInstance.detach()
  }
})

watch(() => page.value, () => {
  enhanceContent()
  updateActiveHeading()
})

// ============================================================
// 目录交互
// ============================================================
const closeToc = () => {
  showToc.value = false
}

watch(showToc, (newVal) => {
  if (import.meta.client) {
    document.body.style.overflow = newVal ? 'hidden' : ''
  }
})

const isLinkActive = (linkId: string): boolean => {
  return activeHeadingId.value === linkId
}

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
  closeToc()
}
</script>

<template>
  <div class="blog-page">
    <div class="reading-progress-bar" :style="{ width: `${readingProgress}%` }" />

    <nav class="top-navigation">
      <NuxtLink to="/" class="nav-back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>返回首页</span>
      </NuxtLink>
    </nav>

    <button 
      v-if="filteredTocLinks.length" 
      class="mobile-toc-button" 
      @click="showToc = true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <span>目录</span>
    </button>

    <div v-if="pending" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="page" class="content-wrapper">
      <Transition name="fade">
        <div 
          v-if="showToc" 
          class="toc-backdrop" 
          @click="closeToc"
        />
      </Transition>

      <article class="article-main">
        <header class="article-header">
          <h1 class="article-title">{{ (page as BlogPost).title }}</h1>
          
          <div class="article-meta">
            <time v-if="formattedDate" :datetime="(page as BlogPost).date" class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ formattedDate }}
            </time>
            
            <span v-if="readingTime" class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ readingTime }} 分钟阅读
            </span>
          </div>
        </header>
        
        <div class="article-content content-body">
          <ContentRenderer :value="page" />
        </div>
        
        <footer class="article-footer">
          <div class="footer-divider">
            <span>END</span>
          </div>

          <nav v-if="surroundingPosts && ((surroundingPosts as [BlogPost | null, BlogPost | null])[0] || (surroundingPosts as [BlogPost | null, BlogPost | null])[1])" class="article-navigation">
            <NuxtLink 
              v-if="(surroundingPosts as [BlogPost | null, BlogPost | null])[0]" 
              :to="(surroundingPosts as [BlogPost | null, BlogPost | null])[0]!._path"
              class="nav-item nav-prev"
            >
              <span class="nav-label">上一篇</span>
              <span class="nav-title">{{ (surroundingPosts as [BlogPost | null, BlogPost | null])[0]!.title }}</span>
            </NuxtLink>
            
            <NuxtLink 
              v-if="(surroundingPosts as [BlogPost | null, BlogPost | null])[1]" 
              :to="(surroundingPosts as [BlogPost | null, BlogPost | null])[1]!._path"
              class="nav-item nav-next"
            >
              <span class="nav-label">下一篇</span>
              <span class="nav-title">{{ (surroundingPosts as [BlogPost | null, BlogPost | null])[1]!.title }}</span>
            </NuxtLink>
          </nav>
        </footer>
      </article>

      <aside 
        v-if="filteredTocLinks.length" 
        class="toc-sidebar"
        :class="{ 'is-open': showToc }"
      >
        <div class="toc-header">
          <h3 class="toc-title">目录</h3>
          <button 
            class="toc-close-btn" 
            @click="closeToc"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <nav class="toc-navigation">
          <ul class="toc-list">
            <template v-for="(link, index) in filteredTocLinks" :key="link.id">
              <li class="toc-item">
                <a 
                  :href="`#${link.id}`" 
                  class="toc-link"
                  :class="{ 'is-active': isLinkActive(link.id) }"
                  @click.prevent="scrollToHeading(link.id)"
                >
                  <span class="toc-number">{{ index + 1 }}.</span>
                  <span class="toc-text">{{ link.text }}</span>
                </a>
                
                <!-- 二级目录 -->
                <ul v-if="link.children?.length" class="toc-sublist">
                  <template v-for="(sublink, subIndex) in link.children" :key="sublink.id">
                    <li class="toc-subitem">
                      <a 
                        :href="`#${sublink.id}`" 
                        class="toc-link"
                        :class="{ 'is-active': isLinkActive(sublink.id) }"
                        @click.prevent="scrollToHeading(sublink.id)"
                      >
                        <span class="toc-number">{{ index + 1 }}.{{ subIndex + 1 }}</span>
                        <span class="toc-text">{{ sublink.text }}</span>
                      </a>
                      
                      <!-- 三级目录 -->
                      <ul v-if="sublink.children?.length" class="toc-sublist">
                        <template v-for="(subsublink, subsubIndex) in sublink.children" :key="subsublink.id">
                          <li class="toc-subitem">
                            <a 
                              :href="`#${subsublink.id}`" 
                              class="toc-link"
                              :class="{ 'is-active': isLinkActive(subsublink.id) }"
                              @click.prevent="scrollToHeading(subsublink.id)"
                            >
                              <span class="toc-number">{{ index + 1 }}.{{ subIndex + 1 }}.{{ subsubIndex + 1 }}</span>
                              <span class="toc-text">{{ subsublink.text }}</span>
                            </a>
                          </li>
                        </template>
                      </ul>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  --color-primary: #00c58e;
  --color-text: #333;
  --color-text-light: #666;
  --color-text-lighter: #999;
  --color-border: #e5e7eb;
  --color-bg: #fff;
  --color-bg-secondary: #f9fafb;
  --color-code-bg: #f6f8fa;
  
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px 40px;
  position: relative;
}

/* 修复：黑暗模式使用明亮的白色文字 */
:global(html.dark) .blog-page {
  --color-text: #ffffff;  /* 纯白色 */
  --color-text-light: #e5e7eb;  /* 明亮灰 */
  --color-text-lighter: #d1d5db;  /* 中等灰 */
  --color-border: #374151;
  --color-bg: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-code-bg: #0d1117;
}

.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), #34d399);
  z-index: 9999;
  transition: width 0.1s;
}

.top-navigation {
  margin-bottom: 48px;
}

.nav-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-back-link:hover {
  background: rgba(0, 197, 142, 0.1);
}

.mobile-toc-button {
  display: none;
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: var(--color-bg);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  gap: 6px;
  align-items: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
  gap: 16px;
  color: var(--color-text);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content-wrapper {
  display: flex;
  gap: 48px;
  align-items: flex-start;
}

.article-main {
  flex: 1;
  min-width: 0;
  max-width: 800px;
}

.article-header {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--color-border);
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 24px 0;
}

.article-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-light);
  font-size: 0.9rem;
}

.article-content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: var(--color-text);
  counter-reset: heading;
}

:deep(.article-content p) {
  margin: 1.5em 0;
  color: var(--color-text);
}

:deep(.article-content a) {
  color: var(--color-primary);
  text-decoration: none;
}

:deep(.article-content img) {
  max-width: 100%;
  margin: 2rem auto;
  border-radius: 12px;
  cursor: zoom-in;
}

:deep(.article-content h2) {
  counter-reset: h3counter;
  margin-top: 3rem;
  font-size: 1.8rem;
  color: var(--color-text);
  scroll-margin-top: 100px;
}

:deep(.article-content h2)::before {
  counter-increment: heading;
  content: counter(heading) ". ";
  color: var(--color-primary);
  margin-right: 0.5rem;
}

:deep(.article-content h3) {
  counter-reset: h4counter;
  margin-top: 2rem;
  font-size: 1.5rem;
  color: var(--color-text);
  scroll-margin-top: 100px;
}

:deep(.article-content h3)::before {
  counter-increment: h3counter;
  content: counter(heading) "." counter(h3counter) " ";
  color: var(--color-primary);
}

:deep(.article-content h4) {
  margin-top: 1.5rem;
  font-size: 1.2rem;
  color: var(--color-text);
  scroll-margin-top: 100px;
}

:deep(.article-content h4)::before {
  counter-increment: h4counter;
  content: counter(heading) "." counter(h3counter) "." counter(h4counter) " ";
  color: var(--color-primary);
}

:deep(.article-content ul),
:deep(.article-content ol),
:deep(.article-content li) {
  color: var(--color-text);
}

:deep(.article-content blockquote) {
  border-left: 4px solid var(--color-primary);
  background: var(--color-bg-secondary);
  padding: 1rem 1.5rem;
  color: var(--color-text-light);
}

/* 修复：表格滚动条 */
:deep(.article-content table) {
  width: 100%;
  display: block;  /* 关键：让表格可以滚动 */
  overflow-x: auto;  /* 关键：添加横向滚动 */
  border-collapse: collapse;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  margin: 2rem 0;
  border-radius: 8px;
  -webkit-overflow-scrolling: touch;  /* iOS 平滑滚动 */
}

:deep(.article-content th) {
  background: var(--color-bg-secondary);
  color: var(--color-text);
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  white-space: nowrap;  /* 防止表头换行 */
}

:deep(.article-content td) {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  color: var(--color-text-light);
}

/* 修复：代码块工具栏在顶部 */
:deep(.article-content pre) {
  background: var(--color-code-bg) !important;
  border: 1px solid var(--color-border);
  padding: 16px;
  padding-top: 48px;  /* 为工具栏留出空间 */
  border-radius: 12px;
  position: relative;
  overflow-x: auto;
}

:deep(.code-toolbar) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  border-radius: 12px 12px 0 0;
  z-index: 1;
}

:deep(.code-language) {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-lighter);
  text-transform: uppercase;
}

:deep(.code-copy-btn) {
  display: flex;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.code-copy-btn:hover) {
  background: var(--color-primary);
  color: white;
}

:deep(.code-copy-btn.copied) {
  background: #10b981;
  color: white;
}

.article-footer {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 2px solid var(--color-border);
}

.footer-divider {
  text-align: center;
  margin-bottom: 40px;
}

.footer-divider span {
  padding: 8px 24px;
  background: var(--color-bg-secondary);
  color: var(--color-text-lighter);
  border-radius: 20px;
  font-weight: 600;
}

.article-navigation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
}

.nav-label {
  font-size: 0.8rem;
  color: var(--color-text-lighter);
  text-transform: uppercase;
}

.nav-title {
  color: var(--color-text);
  font-weight: 600;
}

.toc-sidebar {
  width: 260px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 24px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-border);
}

.toc-title {
  font-weight: 700;
  color: var(--color-text);
}

.toc-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 8px;
}

.toc-link {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  color: var(--color-text-light);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.toc-link:hover {
  background: rgba(0, 197, 142, 0.1);
  color: var(--color-primary);
}

.toc-link.is-active {
  background: rgba(0, 197, 142, 0.15);
  color: var(--color-primary);
  font-weight: 600;
}

.toc-number {
  color: var(--color-primary);
  font-weight: 700;
}

.toc-text {
  flex: 1;
}

.toc-sublist {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 16px;
  padding-left: 12px;
  border-left: 2px solid var(--color-border);
}

.toc-subitem {
  margin-bottom: 8px;
}

.toc-subitem .toc-link {
  font-size: 0.85rem;
  padding: 6px 10px;
}

/* 确保三级目录也有样式 */
.toc-sublist .toc-sublist {
  margin-left: 12px;
}

.toc-sublist .toc-sublist .toc-link {
  font-size: 0.8rem;
  padding: 5px 8px;
}

.toc-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .mobile-toc-button {
    display: flex;
  }

  .content-wrapper {
    flex-direction: column;
  }

  .toc-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 85%;
    max-width: 320px;
    height: 100vh;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s;
  }

  .toc-sidebar.is-open {
    transform: translateX(0);
  }

  .toc-close-btn {
    display: block;
  }
}
</style>
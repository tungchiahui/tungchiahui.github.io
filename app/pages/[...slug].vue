<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import mediumZoom from 'medium-zoom'

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

const route = useRoute()

// ⚙️ 可配置的目录深度（1-6，对应 h1-h6）
const MAX_TOC_DEPTH = ref(4) // 👈 修改这个数字来控制目录显示的层级深度

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

const { data: surroundingPosts } = await useAsyncData(
  `surrounding-${route.path}`,
  async () => {
    if (!page.value) return [null, null] as [BlogPost | null, BlogPost | null]
    
    try {
      const allPosts = await queryCollection('content').all()
      
      const markdownPosts = allPosts.filter((p: any) => 
        p._path && p._path.includes('/')
      ) as unknown as BlogPost[]
      
      if (!markdownPosts || markdownPosts.length === 0) {
        return [null, null] as [BlogPost | null, BlogPost | null]
      }
      
      const sortedPosts = markdownPosts.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime()
        const dateB = new Date(b.date || 0).getTime()
        return dateB - dateA // 按日期降序排序
      })
      
      const currentIndex = sortedPosts.findIndex(p => 
        p._path === route.path
      )
      
      if (currentIndex === -1) {
        return [null, null] as [BlogPost | null, BlogPost | null]
      }
      
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

if (!pending.value && !page.value) {
  throw createError({ 
    statusCode: 404, 
    statusMessage: '页面不存在',
    fatal: true 
  })
}

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
  ]
})

const readingTime = computed(() => {
  const pageData = page.value as BlogPost
  if (!pageData?.body) return 0
  const text = JSON.stringify(pageData.body)
  const wordsPerMinute = 200
  const wordCount = text.length / 5
  return Math.ceil(wordCount / wordsPerMinute)
})

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

const showToc = ref(false)
const activeHeadingId = ref<string>('')

// 递归过滤目录层级
const filterTocByDepth = (links: TocLink[] | undefined, currentDepth: number = 0): TocLink[] => {
  if (!links) return []
  
  return links
    .filter(link => link.depth <= MAX_TOC_DEPTH.value)
    .map(link => ({
      ...link,
      children: link.children ? filterTocByDepth(link.children, currentDepth + 1) : undefined
    }))
}

const filteredTocLinks = computed(() => {
  const pageData = page.value as BlogPost
  return filterTocByDepth(pageData?.body?.toc?.links)
})

const readingProgress = ref(0)

const updateReadingProgress = () => {
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY
  const trackLength = documentHeight - windowHeight
  const progress = (scrollTop / trackLength) * 100
  readingProgress.value = Math.min(100, Math.max(0, progress))
}

const updateActiveHeading = () => {
  const pageData = page.value as BlogPost
  if (!pageData?.body?.toc?.links?.length) return

  const headings = document.querySelectorAll('.content-body h2, .content-body h3, .content-body h4, .content-body h5, .content-body h6')
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

const enhanceCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.content-body pre') as NodeListOf<HTMLElement>
  
  codeBlocks.forEach((block) => {
    if (block.querySelector('.code-toolbar')) return

    const toolbar = document.createElement('div')
    toolbar.className = 'code-toolbar'

    const langClass = Array.from(block.classList).find(c => c.startsWith('language-'))
    const language = langClass ? langClass.replace('language-', '').toUpperCase() : 'CODE'

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
    block.insertBefore(toolbar, block.firstChild)
  })
}

const enhanceContent = async () => {
  await nextTick()
  enhanceCodeBlocks()
  initImageZoom()
}

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
    // ✨ 精准定位修复 - 增加 offset
    const offset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
  closeToc()
}

// 递归渲染目录项的辅助函数
const renderTocItem = (link: TocLink, index: number, parentNumber: string = ''): any => {
  const number = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`
  return {
    ...link,
    number,
    children: link.children?.map((child, i) => renderTocItem(child, i, number))
  }
}

const numberedTocLinks = computed(() => {
  return filteredTocLinks.value.map((link, index) => renderTocItem(link, index))
})
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

    <div v-else-if="page" class="content-container">
      <Transition name="fade">
        <div 
          v-if="showToc" 
          class="toc-backdrop" 
          @click="closeToc"
        />
      </Transition>

      <div class="content-wrapper">
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

          <footer v-if="surroundingPosts && (surroundingPosts[0] || surroundingPosts[1])" class="article-footer">
            <div class="footer-divider">
              <span>📚 继续阅读</span>
            </div>
            
            <nav class="article-navigation">
              <NuxtLink 
                v-if="surroundingPosts[0]" 
                :to="surroundingPosts[0]._path" 
                class="nav-item nav-prev"
              >
                <div class="nav-icon">←</div>
                <div class="nav-content">
                  <div class="nav-label">上一篇</div>
                  <div class="nav-title">{{ surroundingPosts[0].title }}</div>
                </div>
              </NuxtLink>

              <NuxtLink 
                v-if="surroundingPosts[1]" 
                :to="surroundingPosts[1]._path" 
                class="nav-item nav-next"
              >
                <div class="nav-content">
                  <div class="nav-label">下一篇</div>
                  <div class="nav-title">{{ surroundingPosts[1].title }}</div>
                </div>
                <div class="nav-icon">→</div>
              </NuxtLink>
            </nav>
          </footer>
        </article>

        <aside 
          v-if="numberedTocLinks.length" 
          class="toc-sidebar"
          :class="{ 'is-open': showToc }"
        >
          <div class="toc-header">
            <h2 class="toc-title">📋 目录</h2>
            <button class="toc-close-btn" @click="closeToc">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <nav class="toc-nav">
            <ul class="toc-list">
              <template v-for="link in numberedTocLinks" :key="link.id">
                <li class="toc-item">
                  <a 
                    :href="`#${link.id}`"
                    class="toc-link"
                    :class="{ 'is-active': isLinkActive(link.id) }"
                    @click.prevent="scrollToHeading(link.id)"
                  >
                    <span class="toc-number">{{ link.number }}</span>
                    <span class="toc-text">{{ link.text }}</span>
                  </a>
                  
                  <ul v-if="link.children?.length" class="toc-sublist">
                    <template v-for="subLink in link.children" :key="subLink.id">
                      <li class="toc-subitem">
                        <a 
                          :href="`#${subLink.id}`"
                          class="toc-link"
                          :class="{ 'is-active': isLinkActive(subLink.id) }"
                          @click.prevent="scrollToHeading(subLink.id)"
                        >
                          <span class="toc-number">{{ subLink.number }}</span>
                          <span class="toc-text">{{ subLink.text }}</span>
                        </a>

                        <ul v-if="subLink.children?.length" class="toc-sublist">
                          <template v-for="subSubLink in subLink.children" :key="subSubLink.id">
                            <li class="toc-subitem">
                              <a 
                                :href="`#${subSubLink.id}`"
                                class="toc-link"
                                :class="{ 'is-active': isLinkActive(subSubLink.id) }"
                                @click.prevent="scrollToHeading(subSubLink.id)"
                              >
                                <span class="toc-number">{{ subSubLink.number }}</span>
                                <span class="toc-text">{{ subSubLink.text }}</span>
                              </a>

                              <ul v-if="subSubLink.children?.length" class="toc-sublist">
                                <template v-for="subSubSubLink in subSubLink.children" :key="subSubSubLink.id">
                                  <li class="toc-subitem">
                                    <a 
                                      :href="`#${subSubSubLink.id}`"
                                      class="toc-link"
                                      :class="{ 'is-active': isLinkActive(subSubSubLink.id) }"
                                      @click.prevent="scrollToHeading(subSubSubLink.id)"
                                    >
                                      <span class="toc-number">{{ subSubSubLink.number }}</span>
                                      <span class="toc-text">{{ subSubSubLink.text }}</span>
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
                </li>
              </template>
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --color-primary: #00c58e;
  --color-bg: var(--bg-color);
  --color-bg-secondary: var(--bg-secondary);
  --color-text: var(--text-main);
  --color-text-light: var(--text-secondary);
  --color-text-lighter: #999999;
  --color-border: var(--nav-border);
  --color-code-bg: #f6f8fa;
}

html.dark {
  --color-code-bg: #1a1f2e;
  --color-text-lighter: #a0aec0;
}

.blog-page {
  min-height: 100vh;
  padding: 0 20px 60px;
}

.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), #10b981);
  z-index: 1001;
  transition: width 0.1s ease;
}

.top-navigation {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 0;
  margin-bottom: 20px;
}

.nav-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-back-link:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateX(-4px);
}

.mobile-toc-button {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 998;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 197, 142, 0.4);
  transition: all 0.2s;
}

.mobile-toc-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 197, 142, 0.5);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ✨ 居中容器 */
.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  justify-content: center;
}

.article-main {
  flex: 1;
  min-width: 0;
  max-width: 850px;
}

.article-header {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--color-border);
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: var(--color-text);
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--color-text-light);
  font-size: 0.95rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-text);
}

/* ✨ 标题恢复绿色 */
:deep(.article-content h2) {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 3rem 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
  color: var(--color-primary);
}

:deep(.article-content h3) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2.5rem 0 1.2rem 0;
  color: var(--color-primary);
}

:deep(.article-content h4) {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: var(--color-primary);
}

:deep(.article-content h5) {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 1.8rem 0 0.9rem 0;
  color: var(--color-primary);
}

:deep(.article-content h6) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.5rem 0 0.8rem 0;
  color: var(--color-primary);
}

:deep(.article-content p) {
  margin: 1.2rem 0;
  color: var(--color-text);
}

:deep(.article-content a) {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

:deep(.article-content a:hover) {
  border-bottom-color: var(--color-primary);
}

:deep(.article-content ul),
:deep(.article-content ol) {
  padding-left: 2rem;
  margin: 1.5rem 0;
}

:deep(.article-content li) {
  margin: 0.8rem 0;
  color: var(--color-text);
}

:deep(.article-content blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--color-primary);
  background: var(--color-bg-secondary);
  border-radius: 0 8px 8px 0;
  color: var(--color-text-light);
  font-style: italic;
}

:deep(.article-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 2rem auto;
  display: block;
  cursor: zoom-in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.article-content code) {
  background: var(--color-code-bg);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

:deep(.article-content pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

/* ✨ 表格美化 - 恢复边框 */
:deep(.article-content table) {
  width: 100%;
  overflow-x: auto;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--color-bg);
  border: 2px solid var(--color-primary);
  margin: 2rem 0;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 197, 142, 0.1);
}

:deep(.article-content th) {
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
  color: var(--color-primary);
  padding: 14px 18px;
  border-bottom: 2px solid var(--color-primary);
  white-space: nowrap;
  font-weight: 700;
  text-align: left;
}

:deep(.article-content td) {
  padding: 12px 18px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

:deep(.article-content tr:last-child td) {
  border-bottom: none;
}

:deep(.article-content tr:hover) {
  background: var(--color-bg-secondary);
}

/* ✨ 代码块美化 - 恢复边框 */
:deep(.article-content pre) {
  background: var(--color-code-bg) !important;
  border: 2px solid var(--color-primary);
  padding: 16px;
  padding-top: 0;
  border-radius: 12px;
  position: relative;
  overflow-x: auto;
  max-width: 100%;
  margin: 1.5rem 0;
  box-shadow: 0 4px 12px rgba(0, 197, 142, 0.15);
}

:deep(.code-toolbar) {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 34px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 14px;
  background: linear-gradient(135deg, rgba(0, 197, 142, 0.1) 0%, var(--color-bg-secondary) 100%);
  border-bottom: 2px solid var(--color-primary);
  border-radius: 10px 10px 0 0;
  z-index: 10;
  margin: 0 -16px 12px -16px;
  backdrop-filter: blur(10px);
}

:deep(.code-language) {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

:deep(.code-copy-btn) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  background: var(--color-bg);
  border: 1.5px solid var(--color-primary);
  border-radius: 6px;
  font-size: 0.7rem;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

:deep(.code-copy-btn:hover) {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
}

:deep(.code-copy-btn.copied) {
  background: #10b981;
  color: white;
  border-color: #10b981;
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
  color: var(--color-text);
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
}

.article-navigation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  min-height: 110px;
}

.nav-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 197, 142, 0.2);
}

.nav-icon {
  font-size: 2rem;
  color: var(--color-primary);
  flex-shrink: 0;
  font-weight: bold;
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.nav-label {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.nav-title {
  color: var(--color-text);
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ✨ 目录美化 - 恢复精美边框 */
.toc-sidebar {
  width: 320px;
  position: sticky;
  top: 80px;
  align-self: flex-start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 24px;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-primary);
  border-radius: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 197, 142, 0.15);
}

.toc-sidebar::-webkit-scrollbar {
  width: 6px;
}

.toc-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.toc-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

.toc-sidebar::-webkit-scrollbar-thumb:hover {
  background: #00a577;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-primary);
}

.toc-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.toc-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.toc-close-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.toc-nav {
  overflow-y: auto;
  overflow-x: hidden;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 6px;
}

.toc-link {
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  color: var(--color-text-light);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 0.9rem;
  line-height: 1.4;
  border: 1px solid transparent;
}

.toc-link:hover {
  background: rgba(0, 197, 142, 0.1);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.toc-link.is-active {
  background: rgba(0, 197, 142, 0.2);
  color: var(--color-primary);
  font-weight: 600;
  border-color: var(--color-primary);
}

.toc-number {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  min-width: fit-content;
}

.toc-text {
  flex: 1;
  word-break: break-word;
}

.toc-sublist {
  list-style: none;
  padding: 0;
  margin: 6px 0 0 0;
  padding-left: 16px;
  border-left: 2px solid var(--color-primary);
}

.toc-subitem {
  margin-bottom: 6px;
}

.toc-subitem .toc-link {
  font-size: 0.85rem;
  padding: 6px 10px;
}

.toc-sublist .toc-sublist {
  margin-left: 0;
  padding-left: 14px;
  border-left-color: rgba(0, 197, 142, 0.5);
}

.toc-sublist .toc-sublist .toc-link {
  font-size: 0.8rem;
  padding: 5px 8px;
}

.toc-sublist .toc-sublist .toc-sublist .toc-link {
  font-size: 0.75rem;
  padding: 4px 6px;
}

.toc-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 📱 手机端适配 */
@media (max-width: 1100px) {
  .blog-page {
    padding: 20px 16px 80px;
  }

  .content-wrapper {
    gap: 0;
  }

  .article-main {
    max-width: 100%;
  }

  .toc-sidebar {
    display: none;
  }

  /* ✨ 恢复手机端目录按钮 */
  .mobile-toc-button {
    display: flex !important;
  }

  .toc-sidebar.is-open {
    display: block;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    max-height: 70vh;
    z-index: 1000;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }

  .toc-close-btn {
    display: block;
  }

  .article-title {
    font-size: 2rem;
  }

  .article-navigation {
    grid-template-columns: 1fr;
  }

  :deep(.article-content pre) {
    margin-left: -16px;
    margin-right: -16px;
    border-radius: 0;
  }

  :deep(.code-toolbar) {
    border-radius: 0;
  }
}

@media (max-width: 640px) {
  .article-title {
    font-size: 1.75rem;
  }

  :deep(.article-content h2) {
    font-size: 1.5rem;
  }

  :deep(.article-content h3) {
    font-size: 1.3rem;
  }
}
</style>
<script setup lang="ts">
import { useHead } from '#app'
import { withBase } from 'ufo'
import { nextTick, ref } from 'vue'

useHead({
  title: '简历 - 董佳辉',
  meta: [
    { name: 'description', content: '董佳辉的个人简历' }
  ]
})

const runtimeConfig = useRuntimeConfig()
const previewPdfUrl = withBase('/resume.pdf', runtimeConfig.app.baseURL)
const downloadPdfUrl = `${previewPdfUrl}?download=1`

const showCompatPreview = ref(false)
const compatLoading = ref(false)
const compatLoaded = ref(false)
const compatError = ref('')
const pdfCanvasContainer = ref<HTMLDivElement | null>(null)

const enableCompatPreview = async () => {
  showCompatPreview.value = true
  if (compatLoaded.value || compatLoading.value) {
    return
  }

  compatLoading.value = true
  compatError.value = ''

  try {
    await nextTick()

    const container = pdfCanvasContainer.value
    if (!container) {
      throw new Error('PDF preview container not found')
    }

    container.innerHTML = ''

    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs'

    const pdf = await pdfjsLib.getDocument(previewPdfUrl).promise

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const unscaledViewport = page.getViewport({ scale: 1 })
      const containerWidth = Math.max(container.clientWidth - 24, 320)
      const scale = containerWidth / unscaledViewport.width
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.className = 'compat-page-canvas'
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)

      const canvasContext = canvas.getContext('2d')
      if (!canvasContext) {
        continue
      }

      container.appendChild(canvas)
      await page.render({ canvas, canvasContext, viewport }).promise
    }

    compatLoaded.value = true
  } catch (error) {
    compatError.value = '兼容预览加载失败，请使用下载按钮查看。'
  } finally {
    compatLoading.value = false
  }
}
</script>

<template>
  <div class="resume-wrap">
    <h1>个人简历</h1>
    <p class="resume-desc">在线查看或下载我的 PDF 简历</p>

    <div class="resume-actions">
      <a :href="previewPdfUrl" target="_blank" rel="noopener noreferrer" class="btn-view">
        在线打开
      </a>
      <a :href="downloadPdfUrl" target="_blank" rel="noopener noreferrer" class="btn-download">
        下载简历
      </a>
    </div>

    <div class="pdf-shell">
      <iframe
        class="pdf-frame"
        :src="previewPdfUrl"
        title="董佳辉简历 PDF"
        loading="lazy"
      />
    </div>

    <p class="pdf-fallback">
      如果上方空白或被浏览器直接下载，请使用下方兼容预览模式。
    </p>

    <div class="compat-actions">
      <button type="button" class="btn-compat" @click="enableCompatPreview">
        {{ showCompatPreview ? '已开启兼容预览模式' : '开启兼容预览模式（双重保险）' }}
      </button>
    </div>

    <div v-if="showCompatPreview" class="compat-shell">
      <p v-if="compatLoading" class="compat-status">正在加载兼容预览...</p>
      <p v-else-if="compatError" class="compat-error">{{ compatError }}</p>
      <div ref="pdfCanvasContainer" class="compat-canvas-wrap"></div>
    </div>
  </div>
</template>

<style scoped>
.resume-wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.resume-wrap h1 {
  font-size: 2rem;
  margin-bottom: 0.6rem;
}

.resume-desc {
  color: #60646b;
  margin-bottom: 1.5rem;
}

.dark .resume-desc {
  color: #a9adb5;
}

.resume-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn-view,
.btn-download {
  display: inline-block;
  padding: 0.62rem 1.3rem;
  border-radius: 8px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn-view {
  background: #1f2937;
}

.btn-download {
  background: #2563eb;
}

.btn-view:hover,
.btn-download:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.dark .btn-view {
  background: #374151;
}

.pdf-shell {
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
}

.dark .pdf-shell {
  border-color: #2f3338;
  background: #14181d;
}

.pdf-frame {
  display: block;
  width: 100%;
  height: min(80vh, 980px);
  min-height: 520px;
  border: 0;
}

.pdf-fallback {
  margin-top: 0.9rem;
  color: #60646b;
}

.compat-actions {
  margin-top: 1rem;
}

.btn-compat {
  display: inline-block;
  padding: 0.62rem 1.3rem;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: transparent;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}

.btn-compat:hover {
  background: rgba(37, 99, 235, 0.08);
}

.compat-shell {
  margin-top: 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  background: #f8fafc;
  padding: 0.75rem;
}

.dark .compat-shell {
  border-color: #2f3338;
  background: #14181d;
}

.compat-status {
  margin: 0.5rem;
  color: #60646b;
}

.compat-error {
  margin: 0.5rem;
  color: #dc2626;
}

.compat-canvas-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.compat-canvas-wrap :deep(.compat-page-canvas) {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

@media (max-width: 768px) {
  .resume-wrap {
    padding: 1.25rem 0.8rem;
  }

  .resume-wrap h1 {
    font-size: 1.6rem;
  }

  .pdf-frame {
    height: 72vh;
    min-height: 460px;
  }

  .btn-compat {
    width: 100%;
  }
}
</style>

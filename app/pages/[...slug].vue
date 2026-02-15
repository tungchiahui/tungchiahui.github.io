<template>
  <div class="post">
    <div class="toc" :style="{ position: isMobile ? 'sticky' : 'relative', top: isMobile ? '10px' : 'auto' }">
      <h2>Table of Contents</h2>
      <ul>
        <li v-for="(item, index) in toc" :key="index">
          <a :href="item.link">{{ item.title }}</a>
        </li>
      </ul>
    </div>
    <h1 :style="{ color: darkMode ? '#ffffff' : '' }">{{ title }}</h1>
    <div class="content" :style="{ color: darkMode ? '#e5e7eb' : '' }">
      <slot></slot>
    </div>
    <div class="previous-next-button">
      <router-link :to="previousLink">Previous</router-link>
      <router-link :to="nextLink">Next</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BlogPost',
  props: {
    title: String,
    previousLink: String,
    nextLink: String,
    toc: Array,
    darkMode: Boolean,
    isMobile: Boolean,
  },
});
</script>

<style scoped>
.post {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  overflow-x: hidden;
}
.toc {
  /* Adjustments for mobile TOC button positioning */
}
.code-block {
  position: relative;
}
.copy-button {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
  /* Add additional styling for the button */
}
@media (max-width: 768px) {
  .content {
    overflow: hidden;
  }
}
</style>
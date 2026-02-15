<template>
  <div class="blog-page">
    <table-of-contents :contents="toc" v-if="toc.length" />
    <main class="content" v-html="content" />
    <navigation :prev="prevPost" :next="nextPost" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navigation from '@/components/Navigation.vue';
import TableOfContents from '@/components/TableOfContents.vue';

const route = useRoute();
const content = ref('');
const toc = ref([]);
const prevPost = ref(null);
const nextPost = ref(null);

const fetchPost = async () => {
  // Fetch the blog post data based on the slug
  const response = await fetch(`/api/posts/${route.params.slug}`);
  const post = await response.json();
  content.value = post.content;
  toc.value = post.toc;
  prevPost.value = post.prev;
  nextPost.value = post.next;
};

onMounted(fetchPost);
</script>

<style scoped>
.blog-page {
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 20px;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}

.content {
  margin: 20px 0;
}

h1, h2, h3 {
  color: var(--primary-color);
}

.table-of-contents {
  margin: 20px 0;
}

.dark-mode {
  --background-color: #121212;
  --text-color: #e0e0e0;
  --primary-color: #bb86fc;
}

.light-mode {
  --background-color: #ffffff;
  --text-color: #000000;
  --primary-color: #6200ee;
}

@media (max-width: 600px) {
  .content {
    font-size: 14px;
  }
}
</style>
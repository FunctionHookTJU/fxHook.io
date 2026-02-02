<template>
  <div class="article-card" @click="handleClick">
    <div class="card-cover" v-if="post.metadata.cover">
      <img :src="post.metadata.cover" :alt="post.metadata.title" loading="lazy" />
    </div>
    <div class="card-content">
      <h2 class="card-title">{{ post.metadata.title }}</h2>
      <p class="card-excerpt">{{ excerpt }}</p>
      <div class="card-meta">
        <span class="card-date">{{ formatDate(post.metadata.date) }}</span>
        <div class="card-tags">
          <span
            v-for="tag in post.metadata.tags"
            :key="tag"
            class="card-tag"
            @click.stop="handleTagClick(tag)"
          >
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Post } from '@composables/useMarkdown'

interface Props {
  post: Post
}

const props = defineProps<Props>()
const router = useRouter()

const excerpt = computed(() => {
  const plainText = props.post.content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
  
  return plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleClick = () => {
  router.push(`/post/${props.post.metadata.slug}`)
}

const handleTagClick = (tag: string) => {
  router.push(`/tag/${tag}`)
}
</script>

<style scoped>
.article-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.card-excerpt {
  color: var(--text-color);
  line-height: 1.6;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.card-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-tag {
  background: var(--tag-bg);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.card-tag:hover {
  background: var(--tag-hover-bg);
}

:root {
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
  --heading-color: #2c3e50;
  --text-color: #1a1a1a;
  --text-secondary: #6c757d;
  --primary-color: #3498db;
  --tag-bg: rgba(52, 152, 219, 0.1);
  --tag-hover-bg: rgba(52, 152, 219, 0.2);
}

[data-theme="dark"] {
  --card-bg: #2d2d2d;
  --border-color: #3a3a3a;
  --heading-color: #ffffff;
  --text-color: #e0e0e0;
  --text-secondary: #a0a0a0;
  --primary-color: #5dade2;
  --tag-bg: rgba(93, 173, 226, 0.15);
  --tag-hover-bg: rgba(93, 173, 226, 0.3);
}

[data-theme="sepia"] {
  --card-bg: #faf3e8;
  --border-color: #d4c4a8;
  --heading-color: #3d2e1f;
  --text-color: #5c4b37;
  --text-secondary: #8b7355;
  --primary-color: #8b7355;
  --tag-bg: rgba(139, 115, 85, 0.1);
  --tag-hover-bg: rgba(139, 115, 85, 0.2);
}
</style>

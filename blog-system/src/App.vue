<template>
  <div id="app" :data-theme="theme">
    <ReadingProgress />
    
    <header class="app-header">
      <div class="header-container">
        <router-link to="/" class="logo">
          {{ config.title }}
        </router-link>
        
        <nav class="nav-menu">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/" class="nav-link">文章</router-link>
        </nav>
        
        <div class="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; {{ new Date().getFullYear() }} {{ config.title }}. 保留所有权利.</p>
        <p class="footer-powered">Powered by Vue + Markdown Blog System</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from '@composables/useTheme'
import ThemeToggle from '@components/ThemeToggle.vue'
import ReadingProgress from '@components/ReadingProgress.vue'

const { theme } = useTheme()

const config = ref({
  title: '我的博客',
  subtitle: '分享技术与思考'
})

onMounted(() => {
  document.title = config.value.title
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-color: #f8f9fa;
  --card-bg: #ffffff;
  --text-color: #1a1a1a;
  --text-secondary: #6c757d;
  --heading-color: #2c3e50;
  --border-color: #e0e0e0;
  --primary-color: #3498db;
  --primary-hover: #2980b9;
  --header-bg: #ffffff;
  --footer-bg: #2c3e50;
  --footer-text: #ffffff;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --toc-bg: #ffffff;
  --tag-bg: rgba(52, 152, 219, 0.1);
  --tag-hover-bg: rgba(52, 152, 219, 0.2);
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --card-bg: #2d2d2d;
  --text-color: #e0e0e0;
  --text-secondary: #a0a0a0;
  --heading-color: #ffffff;
  --border-color: #3a3a3a;
  --primary-color: #5dade2;
  --primary-hover: #3498db;
  --header-bg: #2d2d2d;
  --footer-bg: #1a1a1a;
  --footer-text: #e0e0e0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --toc-bg: #2d2d2d;
  --tag-bg: rgba(93, 173, 226, 0.15);
  --tag-hover-bg: rgba(93, 173, 226, 0.25);
}

[data-theme="sepia"] {
  --bg-color: #f5f0e6;
  --card-bg: #faf3e8;
  --text-color: #5c4b37;
  --text-secondary: #8b7355;
  --heading-color: #3d2e1f;
  --border-color: #d4c4a8;
  --toc-bg: #faf3e8;
  --tag-bg: rgba(139, 115, 85, 0.1);
  --tag-hover-bg: rgba(139, 115, 85, 0.2);
  --primary-color: #8b7355;
  --primary-hover: #6b5344;
  --header-bg: #faf3e8;
  --footer-bg: #3d2e1f;
  --footer-text: #faf3e8;
  --shadow: 0 2px 8px rgba(61, 46, 31, 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--heading-color);
  text-decoration: none;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.app-main {
  flex: 1;
  padding-top: 2rem;
}

.app-footer {
  background: var(--footer-bg);
  color: var(--footer-text);
  padding: 2rem;
  margin-top: 4rem;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.footer-container p {
  margin: 0.5rem 0;
}

.footer-powered {
  font-size: 0.875rem;
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .header-container {
    padding: 1rem;
  }

  .logo {
    font-size: 1.25rem;
  }

  .nav-menu {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.9rem;
  }
}
</style>

<template>
  <div class="app">
    <AppHeader />
    <div class="app-content">
      <router-view />
    </div>
    <Notification />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import Notification from './components/Notification.vue'
</script>

<style lang="scss">
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.app-content {
  flex: 1;
  overflow: hidden;
}
</style>

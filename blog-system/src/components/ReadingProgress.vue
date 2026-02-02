<template>
  <div class="reading-progress">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReadingProgress } from '@composables/useReadingProgress'

const { progress } = useReadingProgress()
</script>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  pointer-events: none;
}

.progress-bar {
  height: 4px;
  background: var(--progress-bg);
  width: 100%;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-hover));
  transition: width 0.1s ease-out;
}

:root {
  --progress-bg: #e0e0e0;
  --primary-color: #3498db;
  --primary-hover: #2980b9;
}

[data-theme="dark"] {
  --progress-bg: #3a3a3a;
  --primary-color: #5dade2;
  --primary-hover: #3498db;
}

[data-theme="sepia"] {
  --progress-bg: #d4c4a8;
  --primary-color: #8b7355;
  --primary-hover: #6b5344;
}
</style>

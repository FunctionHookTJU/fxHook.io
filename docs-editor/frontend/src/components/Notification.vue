<template>
  <TransitionGroup name="slide" tag="div" class="notification-container">
    <div 
      v-for="notification in notifications" 
      :key="notification.id" 
      :class="['notification', `notification-${notification.type}`]"
    >
      <span class="notification-icon">{{ getIcon(notification.type) }}</span>
      <span class="notification-message">{{ notification.message }}</span>
      <button class="notification-close" @click="remove(notification.id)">×</button>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../stores/notification'

const store = useNotificationStore()
const { notifications } = storeToRefs(store)
const { remove } = store

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}
</script>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  max-width: 400px;
  
  &-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
  }
  
  &-message {
    flex: 1;
    font-size: 0.875rem;
  }
  
  &-close {
    padding: 0;
    width: 20px;
    height: 20px;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
  
  &-success {
    border-left: 4px solid var(--success-color);
    
    .notification-icon {
      background: rgba(72, 187, 120, 0.1);
      color: var(--success-color);
    }
  }
  
  &-error {
    border-left: 4px solid var(--danger-color);
    
    .notification-icon {
      background: rgba(245, 101, 101, 0.1);
      color: var(--danger-color);
    }
  }
  
  &-warning {
    border-left: 4px solid var(--warning-color);
    
    .notification-icon {
      background: rgba(237, 137, 54, 0.1);
      color: var(--warning-color);
    }
  }
  
  &-info {
    border-left: 4px solid var(--info-color);
    
    .notification-icon {
      background: rgba(66, 153, 225, 0.1);
      color: var(--info-color);
    }
  }
}
</style>

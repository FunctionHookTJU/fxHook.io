import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  let idCounter = 0

  function show(message, type = 'success', duration = 3000) {
    const id = ++idCounter
    notifications.value.push({ id, message, type })
    
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
    
    return id
  }

  function success(message, duration) {
    return show(message, 'success', duration)
  }

  function error(message, duration = 5000) {
    return show(message, 'error', duration)
  }

  function warning(message, duration) {
    return show(message, 'warning', duration)
  }

  function info(message, duration) {
    return show(message, 'info', duration)
  }

  function remove(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clear() {
    notifications.value = []
  }

  return {
    notifications,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
})

import { defineStore } from "pinia"
import { ref } from "vue"
import { isTauri } from '@tauri-apps/api/core'

export const useAppStore = defineStore('app', () => {
    
  const isLoading = ref<boolean>(false);
  const projectLoaded = ref<boolean>(false);
  const isNativeApp = ref<boolean>(false);

  function resolvePlatform(): void {
    isNativeApp.value = isTauri();
  }

  return { isLoading, projectLoaded, isNativeApp, resolvePlatform }
})
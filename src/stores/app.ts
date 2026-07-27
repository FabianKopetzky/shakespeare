import { defineStore } from "pinia"
import { ref } from "vue"

export const useAppStore = defineStore('app', () => {
    
  const isLoading = ref<boolean>(false);
  const projectLoaded = ref<boolean>(false);
  return { isLoading, projectLoaded }
})
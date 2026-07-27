import { defineStore } from "pinia"
import { ref } from "vue"
import type { DialogueNode, Language, Story, TemplatingVariable, TextColor } from "../types/schema";

export const useContentStore = defineStore('content', () => {
  
  const projectTitle = ref<string>('Sample project');
  const projectAuthor = ref<string>('Sample author');

  const dialogues = ref<DialogueNode[]>([]);
  const stories = ref<Story[]>([]);
  const languages = ref<Language[]>([{code: 'default', display: 'English', isDefault: true}]);
  const templatingVariables = ref<TemplatingVariable[]>([]);
  const textColors = ref<TextColor[]>([]);
  return { dialogues, stories, languages, templatingVariables, textColors, projectTitle, projectAuthor }
})
import { defineStore } from "pinia"
import { ref } from "vue"
import type { AnyStoryNode, DialogueNode, Language, Story, TemplatingVariable, TextColor } from "../types/schema";

export const useContentStore = defineStore('content', () => {
  
  const projectTitle = ref<string>('Sample project');
  const projectAuthor = ref<string>('Sample author');

  const dialogues = ref<DialogueNode[]>([]);
  const stories = ref<Story[]>([]);
  const storyNodes = ref<Record<string, AnyStoryNode>>({});
  const languages = ref<Language[]>([{code: 'default', display: 'English', isDefault: true}]);
  const templatingVariables = ref<TemplatingVariable[]>([]);
  const textColors = ref<TextColor[]>([]);
  return { dialogues, stories, storyNodes, languages, templatingVariables, textColors, projectTitle, projectAuthor }
})
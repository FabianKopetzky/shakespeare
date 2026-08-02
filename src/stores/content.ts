import { defineStore } from "pinia"
import { ref } from "vue"
import type { AnyStoryNode, DialogueNode, Language, Story, StoryVariable, TextColor } from "../types/schema";

export const useContentStore = defineStore('content', () => {
  
  const projectTitle = ref<string>('Sample project');
  const projectAuthor = ref<string>('Sample author');

  const dialogues = ref<DialogueNode[]>([]);
  const stories = ref<Story[]>([]);
  const storyNodes = ref<Record<string, AnyStoryNode>>({});
  const languages = ref<Language[]>([{code: 'default', display: 'English', isDefault: true}]);
  const textColors = ref<TextColor[]>([]);
  const storyVariables = ref<StoryVariable[]>([]);
  return { dialogues, stories, storyNodes, languages, textColors, storyVariables, projectTitle, projectAuthor }
})
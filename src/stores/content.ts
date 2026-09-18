import { defineStore } from "pinia"
import { ref } from "vue"
import type { AnyStoryNode, CustomFieldSchema, DialogueNode, Language, Story, StoryVariable, TextColor, Event, Preferences, MetaData } from "../types/schema";
import defaultSettings from "../utils/settings";

export const useContentStore = defineStore('content', () => {
  
  const projectTitle = ref<string>('Sample project');
  const projectAuthor = ref<string>('Sample author');

  const dialogues = ref<DialogueNode[]>([]);
  const stories = ref<Story[]>([]);
  const storyNodes = ref<Record<string, AnyStoryNode>>({});
  const languages = ref<Language[]>([{ code: 'default', display: 'English', icon: 'flagpack:gb-ukm', isDefault: true }]);
  const textColors = ref<TextColor[]>([]);
  const storyVariables = ref<StoryVariable[]>([]);
  const customFields = ref<CustomFieldSchema[]>([]);
  const events = ref<Event[]>([]);
  

  const settings = ref<Preferences>(structuredClone(defaultSettings));
  const meta = ref<MetaData>();

  return { dialogues, stories, storyNodes, languages, textColors, storyVariables, customFields, events, projectTitle, projectAuthor, settings, meta }
})
<template>
  <div>
    <div class="flex flex-row justify-between">
      <h1>Stories</h1>
      <UButton @click="createNewStory" class="h-10" icon="basil:add-solid"
        >Create new</UButton
      >
    </div>
    <USeparator class="h-6" orientation="horizontal" />
    <div class="flex flex-col gap-2">
      <StoryElement
        v-for="story in stories"
        :story="story"
        @click="router.push(`/stories/${story?.id}`)" />
    </div>
    <StoryEditor
      v-model:isOpen="editorOpen"
      :story="currentStory"
      :mode="editorMode" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { type Story, type FormMode } from "../types/schema.ts";
import StoryEditor from "../components/story/StoryEditor.vue";
import StoryElement from "../components/widget/StoryElement.vue";
import { useContentStore } from "../stores/content.ts";
import { useRouter } from "vue-router";

const { stories } = useContentStore();
const router = useRouter();
const editorOpen = ref<boolean>(false);
const editorMode = ref<FormMode>("Create");

const currentStory = ref<Story>(undefined);

function createNewStory(): void {
  editorMode.value = "Create";
  currentStory.value = undefined;
  editorOpen.value = true;
}
function editStory(story: Story): void {
  editorMode.value = "Update";
  currentStory.value = story;
  editorOpen.value = true;
}
</script>

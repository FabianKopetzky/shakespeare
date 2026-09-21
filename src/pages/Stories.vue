<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-row justify-between items-start">
      <div>
        <h1>Stories</h1>
        <span class="self-end text-dimmed text-balance"
          >Organize your dialogues and create flows to let your stories come to
          life!</span
        >
      </div>
      <UButton icon="material-symbols:add-box-sharp" @click="createNewStory()"
        >New Story</UButton
      >
    </div>
    <div class="w-full h-0.5 bg-accented mt-12 mb-6" />

    <UFormField v-if="stories.length > 0" class="w-full">
      <UInput
        class="w-full"
        size="lg"
        placeholder="Search stories..."
        leading-icon="material-symbols:search-sharp"
        v-model="currentSearch" />
    </UFormField>

    <div class="flex-1 min-h-0 overflow-y-auto mt-8">
      <div
        v-if="stories.length > 0 && listedStories.length > 0"
        class="flex flex-col gap-2">
        <StoryElement
          v-for="story in listedStories"
          :key="story?.id"
          :story="story"
          @open-graph="router.push(`/stories/${story?.id}`)"
          @edit="editStory(story)"
          @delete="deleteStory(story)" />
      </div>
      <div
        v-else-if="stories.length > 0 && listedStories.length <= 0"
        class="flex flex-col flex-1 self-center items-center justify-center text-muted">
        <UIcon
          name="material-symbols:sentiment-dissatisfied"
          class="w-12 h-12" />
        <span>No stories match your search</span>
      </div>
      <div v-else>
        <div
          class="flex flex-col flex-1 self-center items-center justify-center text-muted">
          <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
          <span>No stories in the project</span>
          <UButton
            class="mt-4"
            icon="material-symbols:add-box-sharp"
            @click="createNewStory()"
            >First story</UButton
          >
        </div>
      </div>
    </div>

    <div v-if="stories.length > 0" class="mt-4 flex justify-center shrink-0">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="PAGE_SIZE"
        :sibling-count="1"
        :total="filteredStories.length" />
    </div>

    <StoryEditor
      v-model:isOpen="editorOpen"
      :story="currentStory"
      :mode="editorMode" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { type Story, type FormMode } from "../types/schema.ts";
import StoryEditor from "../components/story/StoryEditor.vue";
import StoryElement from "../components/widget/StoryElement.vue";
import { useContentStore } from "../stores/content.ts";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const { stories, storyNodes } = storeToRefs(useContentStore());
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
function deleteStory(story: Story): void {
  const idx = stories.value.findIndex((s) => s?.id === story?.id);
  if (idx < 0 || idx >= stories.value.length) return;

  // remove referenced nodes
  for (const id of story?.nodes ?? []) {
    if (storyNodes.value[id]) delete storyNodes.value[id];
  }

  stories.value.splice(idx, 1);
}

// PAGINATION & FILTERING
const PAGE_SIZE = 10;

const currentSearch = ref<string>("");
const currentPage = ref<number>(1);

const filteredStories = computed<Story[]>(() => {
  return stories.value.filter((s) =>
    s?.id.toLowerCase().includes(currentSearch.value.toLowerCase()),
  );
});

const listedStories = computed<Story[]>(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredStories.value.slice(start, start + PAGE_SIZE);
});
</script>

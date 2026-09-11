<template>
  <div class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated">
    <div
      @click="emit('open-graph')"
      class="flex flex-row gap-2 h-full w-full items-center justify-start hover:bg-accented hover:cursor-pointer">
      <UIcon class="ml-2 h-6 w-6" :name="fieldMeta.story.icon" />
      <p class="font-semibold">{{ story?.id }}</p>
      <UTooltip
        :text="props.story?.description"
        :content="{ side: 'bottom', sideOffset: 12, collisionPadding: 8 }"
        :arrow="true"
        :delayDuration="50"
        :ui="{ content: 'max-w-5xl whitespace-normal text-wrap' }"
        ><p class="text-dimmed text-sm hover:cursor-pointer">
          {{ descriptionPreview }}
        </p></UTooltip
      >
    </div>
    <div class="flex flex-row">
      <div
        v-if="!fullyTranslated"
        class="flex flex-row items-center justify-start mr-4 bg-warning/10 px-2 my-1">
        <UIcon
          class="h-5 w-5 text-warning mr-2"
          name="material-symbols:chat-error-sharp" />
        <p class="text-warning text-sm whitespace-nowrap">
          Missing branch translations!
        </p>
      </div>
      <div class="flex flex-row items-center justify-start mr-4">
        <UIcon
          class="h-5 w-5 text-dimmed mr-2"
          name="material-symbols:web-asset-sharp" />
        <p class="text-dimmed text-sm whitespace-nowrap">
          {{ props.story?.nodes.length }}
          {{ props.story?.nodes.length === 1 ? "node" : "nodes" }}
        </p>
      </div>
      <UButton
        @click="emit('edit')"
        variant="ghost"
        color="secondary"
        class="aspect-square h-10 w-auto"
        :ui="{ base: 'flex items-center justify-center' }"
        icon="material-symbols:edit-sharp" />
      <UButton
        @click="showDeleteDialog = true"
        variant="ghost"
        icon="material-symbols:delete-outline-sharp"
        class="aspect-square h-10 w-auto"
        :ui="{ base: 'flex items-center justify-center' }"
        color="error" />
    </div>
  </div>
  <ConfirmDialog
    v-model:open="showDeleteDialog"
    title="Delete story"
    :description="`Are you sure you want to delete '${props.story?.id}'? All connected nodes (excluding dialogues) will be deleted as well. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="emit('delete')" />
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { Story } from "../../types/schema";
import ConfirmDialog from "../forms/ConfirmDialog.vue";
import { useConditionUtils } from "../../utils/conditionUtils.ts";
import { storeToRefs } from "pinia";
import { useContentStore } from "../../stores/content.ts";

interface Props {
  story: Story;
}
const emit = defineEmits<{
  (e: "open-graph"): void;
  (e: "edit"): void;
  (e: "delete"): void;
}>();

const { fieldMeta } = useConditionUtils();

const showDeleteDialog = ref<boolean>(false);
const props = defineProps<Props>();
const { languages, storyNodes } = storeToRefs(useContentStore());

const MAX_DESCRIPTION_CHARS = 20;
const descriptionPreview = computed(() => {
  if (!props.story?.description) return "";
  return props.story?.description?.length >= MAX_DESCRIPTION_CHARS
    ? props.story?.description.substring(0, MAX_DESCRIPTION_CHARS - 3) + "..."
    : props.story?.description;
});

const fullyTranslated = computed<boolean>(() => {
  if (!props.story?.nodes) return false;

  for (const n of props.story?.nodes) {
    if (!storyNodes.value[n] || storyNodes.value[n].type !== "branch") continue;
    for (const b of storyNodes.value[n].branches) {
      for (const l of languages.value) {
        if (!b.labels[l.code]) return false;
      }
    }
  }
  return true;
});
</script>

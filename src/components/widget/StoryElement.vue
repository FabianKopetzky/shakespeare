<template>
  <div
    class="flex flex-row justify-start items-center gap-4 h-12 bg-white/5 hover:bg-white/10 rounded-lg p-2 cursor-pointer">
    <div class="flex flex-row justify-between items-center gap-2">
      <UIcon name="material-symbols:key-rounded" />
      <span class="font-bold">{{ story?.id }}</span>
    </div>
    <span>{{ descriptionPreview }}</span>
    <div class="flex flex-row gap-4">
      <UButton @click="emit('open-graph')" color="secondary" icon="mdi:graph" />
      <UButton
        @click="emit('edit')"
        color="primary"
        icon="material-symbols:edit" />
      <UButton
        @click="showDeleteDialog = true"
        color="error"
        icon="mdi:trash" />
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

interface Props {
  story: Story;
}
const emit = defineEmits<{
  (e: "open-graph"): void;
  (e: "edit"): void;
  (e: "delete"): void;
}>();
const showDeleteDialog = ref<boolean>(false);
const props = defineProps<Props>();
const descriptionPreview = computed(() => {
  if (!props.story?.description) return "";
  return props.story?.description?.length >= 20
    ? props.story?.description.substring(0, 16) + "..."
    : props.story?.description;
});
</script>

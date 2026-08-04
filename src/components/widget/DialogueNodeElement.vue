<template>
  <div
    class="flex flex-row justify-start items-center gap-4 h-12 bg-white/5 hover:bg-white/10 rounded-lg p-2 cursor-pointer">
    <div class="flex flex-row justify-between items-center gap-2">
      <UIcon name="material-symbols:key-rounded" />
      <span class="font-bold">{{ node?.id }}</span>
    </div>
    <span>{{ descriptionPreview }}</span>
    <div class="flex flex-row gap-4">
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
    title="Delete dialogue"
    :description="`Are you sure you want to delete '${props.node?.id}'? This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="emit('delete')" />
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { DialogueNode } from "../../types/schema";

interface Props {
  node: DialogueNode;
}
const emit = defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
}>();
const showDeleteDialog = ref<boolean>(false);
const props = defineProps<Props>();
const descriptionPreview = computed(() => {
  if (!props.node?.description) return "";
  return props.node?.description?.length >= 20
    ? props.node?.description.substring(0, 16) + "..."
    : props.node?.description;
});
</script>

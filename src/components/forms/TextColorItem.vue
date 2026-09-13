<script setup lang="ts">
import { ref } from "vue";
import type { TextColor } from "../../types/schema";
import TextColorInput from "./TextColorInput.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const editorOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

interface Props {
  color: TextColor;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", color: TextColor): void;
  (e: "delete", name: string): void;
}>();

function confirmEdit(color: TextColor): void {
  emit("edit", color);
}

function confirmDelete(): void {
  emit("delete", props.color.name);
}
</script>

<template>
  <div class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated">
    <div
      :style="{ backgroundColor: props.color.hex }"
      class="h-full w-auto aspect-square" />
    <div class="flex flex-row gap-4 h-full w-full items-center justify-between">
      <p>
        <span class="font-semibold">{{ props.color.name }}</span>
        <code class="ml-4 text-dimmed">{{ props.color.hex }}</code>
      </p>
      <div class="flex flex-row">
        <UButton
          @click="editorOpen = true"
          variant="ghost"
          color="secondary"
          class="aspect-square h-10 w-auto"
          :ui="{ base: 'flex items-center justify-center' }"
          icon="material-symbols:edit-sharp" />
        <UButton
          @click="showDeleteConfirm = true"
          variant="ghost"
          icon="material-symbols:delete-outline-sharp"
          class="aspect-square h-10 w-auto"
          :ui="{ base: 'flex items-center justify-center' }"
          color="secondary" />
      </div>
    </div>
  </div>
  <TextColorInput
    v-model:open="editorOpen"
    mode="Update"
    :color="props.color"
    @submit="confirmEdit" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete text color"
    :description="`Are you sure you want to delete '${props.color.name}'? All references of this color will be replaced by the hex value. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline-sharp"
    @confirm="confirmDelete" />
</template>

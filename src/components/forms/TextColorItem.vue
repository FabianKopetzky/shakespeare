<script setup lang="ts">
import { ref } from "vue";
import type { TextColor } from "../../types/schema";
import TextColorInput from "./TextColorInput.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const isEditing = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

interface Props {
  color: TextColor;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", color: TextColor): void;
  (e: "delete", name: string): void;
}>();

function enableEdit(): void {
  isEditing.value = true;
}

function editColor(color: TextColor): void {
  isEditing.value = false;
  emit("edit", color);
}

function confirmDelete(): void {
  emit("delete", props.color.name);
}
</script>

<template>
  <div v-if="!isEditing" class="flex flex-row gap-4 justify-start items-center">
    <span
      class="inline-block w-5 h-5 rounded-full border border-gray-300"
      :style="{ backgroundColor: props.color.hex }" />
    <p>
      <span class="font-bold mr-4">{{ props.color.name }}</span
      >{{ props.color.display }}
      <code class="ml-4 text-gray-500">{{ props.color.hex }}</code>
    </p>
    <UButton @click="enableEdit" icon="material-symbols:edit" />
    <UButton
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
  </div>
  <TextColorInput
    v-else
    mode="Update"
    :color="props.color"
    @submit="editColor" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete text color"
    :description="`Are you sure you want to delete '${props.color.display}' (${props.color.name})? This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { StoryVariable } from "../../types/schema.ts";
import ConfirmDialog from "./ConfirmDialog.vue";
import StoryVariableInput from "./StoryVariableInput.vue";

interface Props {
  variable: StoryVariable;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", variable: StoryVariable): void;
  (e: "delete", name: string): void;
}>();

const editorOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

function confirmEdit(variable: StoryVariable): void {
  emit("edit", variable);
}

function confirmDelete(): void {
  emit("delete", props.variable.name);
}
</script>

<template>
  <div class="flex flex-row gap-4 justify-start items-center">
    <p>
      <span class="font-bold mr-4">{{ props.variable.name }}</span
      >({{ props.variable.type }}, default: {{ props.variable.defaultValue }})
    </p>
    <UButton @click="editorOpen = true" icon="material-symbols:edit" />
    <UButton
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
  </div>
  <StoryVariableInput
    v-model:open="editorOpen"
    mode="Update"
    :variable="props.variable"
    @submit="confirmEdit" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete story variable"
    :description="`Are you sure you want to delete '${props.variable.name}'? All references of the variables will be replaced by their default value. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

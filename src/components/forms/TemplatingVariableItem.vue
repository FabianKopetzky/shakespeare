<script setup lang="ts">
import { ref } from "vue";
import type { TemplatingVariable } from "../../types/schema";
import TemplatingVariableInput from "./TemplatingVariableInput.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const editorOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

interface Props {
  variable: TemplatingVariable;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", variable: TemplatingVariable): void;
  (e: "delete", name: string): void;
}>();

function confirmEdit(variable: TemplatingVariable): void {
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
      ><code class="mr-4">{{ props.variable.csharpExpression }}</code
      ><span class="text-gray-500">{{ props.variable.placeholder }}</span>
    </p>
    <UButton @click="editorOpen = true" icon="material-symbols:edit" />
    <UButton
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
  </div>

  <TemplatingVariableInput
    v-model:open="editorOpen"
    mode="Update"
    :variable="props.variable"
    @submit="confirmEdit" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete templating variable"
    :description="`Are you sure you want to delete '${props.variable.name}'? All references of this variable will be replaced with the current placeholder. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

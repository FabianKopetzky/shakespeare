<script setup lang="ts">
import { ref } from "vue";
import type { TemplatingVariable } from "../../types/schema";
import TemplatingVariableInput from "./TemplatingVariableInput.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const isEditing = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

interface Props {
  variable: TemplatingVariable;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", variable: TemplatingVariable): void;
  (e: "delete", name: string): void;
}>();

function enableEdit(): void {
  isEditing.value = true;
}

function editVariable(variable: TemplatingVariable): void {
  isEditing.value = false;
  emit("edit", variable);
}

function confirmDelete(): void {
  emit("delete", props.variable.name);
}
</script>

<template>
  <div v-if="!isEditing" class="flex flex-row gap-4 justify-start items-center">
    <p>
      <span class="font-bold mr-4">{{ props.variable.name }}</span
      ><code class="mr-4">{{ props.variable.csharpExpression }}</code
      ><span class="text-gray-500">{{ props.variable.placeholder }}</span>
    </p>
    <UButton @click="enableEdit" icon="material-symbols:edit" />
    <UButton
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
  </div>
  <TemplatingVariableInput
    v-else
    mode="Update"
    :variable="props.variable"
    @submit="editVariable" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete templating variable"
    :description="`Are you sure you want to delete '${props.variable.name}'? This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

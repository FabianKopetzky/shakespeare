<script setup lang="ts">
import { ref } from "vue";
import type { CustomFieldSchema } from "../../types/schema.ts";
import ConfirmDialog from "./ConfirmDialog.vue";
import CustomFieldInput from "./CustomFieldInput.vue";

interface Props {
  field: CustomFieldSchema;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", field: CustomFieldSchema): void;
  (e: "delete", name: string): void;
}>();

const editorOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

function confirmEdit(field: CustomFieldSchema): void {
  emit("edit", field);
}

function confirmDelete(): void {
  emit("delete", props.field.name);
}
</script>

<template>
  <div class="flex flex-row gap-4 justify-start items-center">
    <p>
      <span class="font-bold mr-4">{{ props.field.name }}</span
      >({{ props.field.type }}, default: {{ props.field.defaultValue }})
    </p>
    <UButton @click="editorOpen = true" icon="material-symbols:edit" />
    <UButton
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
  </div>
  <CustomFieldInput
    v-model:open="editorOpen"
    mode="Update"
    :field="props.field"
    @submit="confirmEdit" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete story variable"
    :description="`Are you sure you want to delete '${props.field.name}'? All instances of this field will be deleted. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

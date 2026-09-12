<script setup lang="ts">
import { ref } from "vue";
import type { CustomFieldSchema } from "../../types/schema.ts";
import ConfirmDialog from "./ConfirmDialog.vue";
import CustomFieldInput from "./CustomFieldInput.vue";
import { useConditionUtils } from "../../utils/conditionUtils.ts";

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
const { fieldMeta, typeMeta } = useConditionUtils();

function confirmEdit(field: CustomFieldSchema): void {
  emit("edit", field);
}

function confirmDelete(): void {
  emit("delete", props.field.name);
}
</script>

<template>
  <div class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated">
    <div class="flex flex-row gap-4 h-full w-full items-center justify-between">
      <div class="flex flex-row gap-2 items-center justify-start ml-2">
        <UIcon
          class="h-6 w-auto aspect-square"
          :name="typeMeta[props.field.type].icon" />
        <span class="font-semibold">{{ props.field.label }}</span>
        <span class="text-dimmed">| {{ props.field.name }}</span>
        <span class="ml-4 text-dimmed">{{ props.field.type }}</span>
        <span class="ml-4 text-dimmed"
          >{{ props.field.defaultValue }}
          <span class="text-xs opacity-45">(default)</span></span
        >
      </div>
      <div class="flex flex-row">
        <div class="flex flex-row items-center mr-2">
          <UIcon
            class="mr-2 text-dimmed h-6 w-auto aspect-square"
            :name="fieldMeta[props.field.model].icon" />
          <span class="text-dimmed whitespace-nowrap"
            >Extends {{ fieldMeta[props.field.model].label }}</span
          >
        </div>
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

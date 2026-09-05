<script setup lang="ts">
import { ref } from "vue";
import type { StoryVariable } from "../../types/schema.ts";
import ConfirmDialog from "./ConfirmDialog.vue";
import StoryVariableInput from "./StoryVariableInput.vue";
import { useConditionUtils } from "../../utils/conditionUtils.ts";

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

const { typeMeta } = useConditionUtils();

function confirmEdit(variable: StoryVariable): void {
  emit("edit", variable);
}

function confirmDelete(): void {
  emit("delete", props.variable.name);
}
</script>

<template>
  <div class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated">
    <div class="flex flex-row gap-4 h-full w-full items-center justify-between">
      <div class="flex flex-row gap-2 items-center justify-start ml-2">
        <UIcon
          class="h-6 w-auto aspect-square"
          :name="typeMeta[props.variable.type].icon" />
        <span class="font-semibold">{{ props.variable.name }}</span>
        <code class="ml-4 text-dimmed">{{ props.variable.type }}</code>
        <span class="ml-4 text-dimmed"
          >{{ props.variable.defaultValue }}
          <span class="text-xs opacity-45">(default)</span></span
        >
      </div>
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

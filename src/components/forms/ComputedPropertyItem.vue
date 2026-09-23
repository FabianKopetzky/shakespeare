<script setup lang="ts">
import { ref } from "vue";
import type { ComputedProperty } from "../../types/schema.ts";
import ConfirmDialog from "./ConfirmDialog.vue";
import { useConditionUtils } from "../../utils/conditionUtils.ts";
import ComputedPropertyInput from "./ComputedPropertyInput.vue";

interface Props {
  computedProperty: ComputedProperty;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", property: ComputedProperty): void;
  (e: "delete", name: string): void;
}>();

const editorOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

const { typeMeta } = useConditionUtils();

const open = ref<boolean>(false);

function confirmEdit(property: ComputedProperty): void {
  emit("edit", property);
}

function confirmDelete(): void {
  emit("delete", props.computedProperty.name);
}
</script>

<template>
  <div class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated">
    <div class="flex flex-row gap-4 h-full w-full items-center justify-between">
      <div
        @click="open = !open"
        class="flex flex-1 flex-row gap-2 h-full items-center justify-start hover:bg-accented hover:cursor-pointer">
        <UIcon
          class="ml-2 h-6 w-auto aspect-square"
          :name="typeMeta[props.computedProperty.returnType].icon" />
        <span class="font-semibold select-none">{{
          props.computedProperty.name
        }}</span>
        <p
          v-if="props.computedProperty.params.length > 0"
          class="text-dimmed select-none max-w-70 truncate">
          ({{ props.computedProperty.params.map((p) => p.name).join(", ") }})
        </p>
      </div>
      <div class="flex flex-row">
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
  <UCollapsible v-model:open="open">
    <template #content>
      <div class="ml-4 bg-muted px-4 py-2">
        <span class="text-muted text-sm select-none">{{
          props.computedProperty.params.length > 0
            ? `Parameters (${props.computedProperty.params.length})`
            : "No parameters"
        }}</span>
        <div
          v-for="param in props.computedProperty.params"
          class="flex flex-row justify-start gap-2 items-center">
          <UIcon class="text-dimmed" :name="typeMeta[param.type].icon" />
          <span class="select-none">{{ param.name }}</span>
          <span class="text-dimmed select-none">({{ param.type }})</span>
        </div>
      </div>
    </template>
  </UCollapsible>
  <ComputedPropertyInput
    v-model:open="editorOpen"
    mode="Update"
    :computed-property="props.computedProperty"
    @submit="confirmEdit" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete computed property"
    :description="`Are you sure you want to delete '${props.computedProperty.name}'? All references in conditions will be reset to the types default value and all text references will be replaced with '[unknown property]'. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline-sharp"
    @confirm="confirmDelete" />
</template>

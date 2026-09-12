<script setup lang="ts">
import { ref } from "vue";
import type { Event } from "../../types/schema.ts";
import ConfirmDialog from "./ConfirmDialog.vue";
import EventInput from "./EventInput.vue";
import { useConditionUtils } from "../../utils/conditionUtils.ts";

interface Props {
  event: Event;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", event: Event): void;
  (e: "delete", name: string): void;
}>();

const editorOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

const { typeMeta } = useConditionUtils();

const open = ref<boolean>(false);

function confirmEdit(event: Event): void {
  emit("edit", event);
}

function confirmDelete(): void {
  emit("delete", props.event.name);
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
          name="ic:sharp-electric-bolt" />
        <span class="font-semibold select-none">{{ props.event.name }}</span>
        <span
          v-if="props.event.params.length > 0"
          class="text-dimmed select-none"
          >({{ props.event.params.map((p) => p.name).join(", ") }})</span
        >
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
        <span class="text-muted text-sm">{{
          props.event.params.length > 0
            ? `Parameters (${props.event.params.length})`
            : "No parameters"
        }}</span>
        <div
          v-for="param in props.event.params"
          class="flex flex-row justify-start gap-2 items-center">
          <UIcon class="text-dimmed" :name="typeMeta[param.type].icon" />
          <span>{{ param.name }}</span>
          <span class="text-dimmed">({{ param.type }})</span>
        </div>
      </div>
    </template>
  </UCollapsible>
  <EventInput
    v-model:open="editorOpen"
    mode="Update"
    :event="props.event"
    @submit="confirmEdit" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete event"
    :description="`Are you sure you want to delete '${props.event.name}'? All references in event nodes will be reset. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

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

const { eventToString } = useConditionUtils();

function confirmEdit(event: Event): void {
  emit("edit", event);
}

function confirmDelete(): void {
  emit("delete", props.event.name);
}
</script>

<template>
  <div class="flex flex-row gap-4 justify-start items-center">
    <p>
      <span class="font-bold mr-4">{{ eventToString(props.event) }}</span>
    </p>
    <UButton
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
  </div>
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

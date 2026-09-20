<script setup lang="ts">
import { ref } from "vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import type { ProjectFileEntry } from "../../composables/projectHandler.ts";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app.ts";

interface Props {
  project: ProjectFileEntry;
  deletable: boolean;
  openable: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "delete", name: string): void;
  (e: "open", path: string): void;
}>();

const showDeleteConfirm = ref<boolean>(false);
const showOpenConfirm = ref<boolean>(false);

const { projectLoaded } = storeToRefs(useAppStore());

function confirmDelete(): void {
  emit("delete", props.project.name);
}
function confirmOpen(): void {
  emit("open", props.project.path);
}
</script>

<template>
  <div
    class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated w-full">
    <div class="flex flex-row gap-4 h-full w-full items-center justify-between">
      <div class="flex flex-row gap-2 items-center justify-start ml-2">
        <UIcon class="h-6 w-auto aspect-square" name="mdi:feather" />
        <p class="font-semibold max-w-50 truncate">{{ props.project.name }}</p>
        <p class="ml-2 text-dimmed max-w-50 truncate">
          {{ props.project.path }}
        </p>
      </div>
      <div class="flex flex-row">
        <UTooltip text="Open project" :delayDuration="50">
          <UButton
            v-if="openable"
            @click="
              () => {
                if (projectLoaded) showOpenConfirm = true;
                else confirmOpen();
              }
            "
            variant="ghost"
            color="secondary"
            class="aspect-square h-10 w-auto"
            :ui="{ base: 'flex items-center justify-center' }"
            icon="material-symbols:file-open-sharp"
        /></UTooltip>
        <UTooltip text="Delete project" :delayDuration="50">
          <UButton
            v-if="props.deletable"
            @click="showDeleteConfirm = true"
            variant="ghost"
            icon="material-symbols:delete-outline-sharp"
            class="aspect-square h-10 w-auto"
            :ui="{ base: 'flex items-center justify-center' }"
            color="secondary" />
        </UTooltip>
        <div
          v-if="!props.deletable && !props.openable"
          class="px-4 flex flex-row items-center gap-2">
          <UIcon
            class="size-4 text-primary"
            name="material-symbols:kid-star-sharp" />
          <span class="select-none font-semibold text-primary text-sm"
            >Current</span
          >
        </div>
      </div>
    </div>
  </div>

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete project"
    :description="`Are you sure you want to delete the project ${props.project.name}? The project file will be removed from your disk, but already compiled or downloaded files remain untouched. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline-sharp"
    @confirm="confirmDelete" />
  <ConfirmDialog
    v-model:open="showOpenConfirm"
    title="Open project"
    :description="`Are you sure you want to open ${props.project.name}? Changes in your current project will not be saved. Verify that you current project is saved before opening a new project.`"
    confirm-label="Open"
    color="primary"
    icon="material-symbols:file-open-sharp"
    @confirm="confirmOpen" />
</template>

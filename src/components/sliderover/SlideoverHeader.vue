<template>
  <div class="flex flex-row justify-between items-center w-full">
    <h3>{{ props.title }}</h3>
    <div class="flex flex-row gap-2">
      <UButton
        variant="soft"
        color="secondary"
        class="h-12 w-12"
        :ui="{ base: 'flex items-center justify-center' }"
        icon="material-symbols:close"
        @click="close">
      </UButton>
      <UButton
        v-if="props.mode !== 'Read'"
        variant="solid"
        color="primary"
        class="h-12 w-12"
        :ui="{ base: 'flex items-center justify-center' }"
        icon="material-symbols:check"
        @click="save">
      </UButton>
    </div>
  </div>
  <ConfirmDialog
    v-model:open="showCancelConfirmation"
    title="Discard changes?"
    description="Are you sure that you want to discard all changes made to this item?"
    confirm-label="Discard changes"
    cancel-label="Back to editing"
    @cancel="showCancelConfirmation = false"
    @confirm="emit('close')" />
</template>
<script setup lang="ts">
import { nextTick, ref } from "vue";
import type { FormMode } from "../../types/schema";
import ConfirmDialog from "../forms/ConfirmDialog.vue";
import { storeToRefs } from "pinia";
import { useContentStore } from "../../stores/content.ts";
import { useAppStore } from "../../stores/app.ts";
import { useProjectHandler } from "../../composables/projectHandler.ts";

const { settings } = storeToRefs(useContentStore());
const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());
const { saveCurrentProject } = useProjectHandler();

interface Props {
  title: string;
  mode?: FormMode;
  saveContent: () => boolean;
}
const props = withDefaults(defineProps<Props>(), {
  mode: "Update",
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const showCancelConfirmation = ref<boolean>(false);

async function save(): Promise<void> {
  const ok = props.saveContent();

  if (!ok) return;
  await nextTick();

  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
function close(): void {
  if (props.mode === "Read" || !settings.value.warnBeforeDiscarding)
    emit("close");
  else showCancelConfirmation.value = true;
}
</script>

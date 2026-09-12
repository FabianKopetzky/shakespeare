<script setup lang="ts">
import { ref } from "vue";
import type { Language } from "../../types/schema";
import LanguageInput from "./LanguageInput.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import { defaultLanguageIcon } from "../../utils/languageIcons.ts";

interface Props {
  language: Language;
  deletable: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", lang: Language): void;
  (e: "delete", code: string): void;
}>();

const editorOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

function confirmEdit(lang: Language): void {
  emit("edit", lang);
}

function confirmDelete(): void {
  emit("delete", props.language.code);
}
</script>

<template>
  <div class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated">
    <div class="flex flex-row gap-4 h-full w-full items-center justify-between">
      <div class="flex flex-row gap-2 items-center justify-start ml-2">
        <UIcon
          class="h-6 w-auto aspect-square"
          :name="language.icon ?? defaultLanguageIcon" />
        <span class="font-semibold">{{ props.language.display }}</span>
        <span class="ml-2 text-dimmed">{{ props.language.code }}</span>
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
          v-if="props.deletable"
          @click="showDeleteConfirm = true"
          variant="ghost"
          icon="material-symbols:delete-outline-sharp"
          class="aspect-square h-10 w-auto"
          :ui="{ base: 'flex items-center justify-center' }"
          color="secondary" />
      </div>
    </div>
  </div>
  <LanguageInput
    v-model:open="editorOpen"
    mode="Update"
    :language="props.language"
    @submit="confirmEdit" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete language"
    :description="`Are you sure you want to delete '${props.language.display}' (${props.language.code})? This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

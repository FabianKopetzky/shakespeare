<script setup lang="ts">
import { ref } from "vue";
import type { Language } from "../../types/schema";
import LanguageInput from "./LanguageInput.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

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
  <div class="flex flex-row gap-4 justify-start items-center">
    <p>
      <span class="font-bold mr-4">{{ props.language.code }}</span
      >{{ props.language.display }}
    </p>
    <UButton @click="editorOpen = true" icon="material-symbols:edit" />
    <UButton
      v-if="deletable"
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
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

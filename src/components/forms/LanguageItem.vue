<script setup lang="ts">
import { ref } from "vue";
import type { Language } from "../../types/schema";
import LanguageInput from "./LanguageInput.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const isEditing = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);

interface Props {
  language: Language;
  deletable: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", lang: Language): void;
  (e: "delete", code: string): void;
}>();

function enableEdit(): void {
  isEditing.value = true;
}

function editLanguage(lang: Language): void {
  isEditing.value = false;
  emit("edit", lang);
}

function confirmDelete(): void {
  emit("delete", props.language.code);
}
</script>

<template>
  <div v-if="!isEditing" class="flex flex-row gap-4 justify-start items-center">
    <p>
      <span class="font-bold mr-4">{{ props.language.code }}</span
      >{{ props.language.display }}
    </p>
    <UButton @click="enableEdit" icon="material-symbols:edit" />
    <UButton
      v-if="deletable"
      @click="showDeleteConfirm = true"
      icon="material-symbols:delete"
      color="error" />
  </div>
  <LanguageInput
    v-else
    mode="Update"
    :language="props.language"
    @submit="editLanguage" />

  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete language"
    :description="`Are you sure you want to delete '${props.language.display}' (${props.language.code})? This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="confirmDelete" />
</template>

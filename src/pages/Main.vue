<script setup lang="ts">
import { ref } from "vue";
import ImportFileDialog from "../components/forms/ImportFileDialog.vue";
import CreateFileDialog from "../components/forms/CreateFileDialog.vue";

const showImportDialogue = ref<boolean>(false);
const showCreateNewDialogue = ref<boolean>(false);
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 min-h-full">
    <h1>Welcome to Dialogue Editor</h1>
    <p>
      Create and edit dialogues, storylines and branches and export directly to
      Unity!
    </p>
    <div class="flex flex-row gap-4">
      <UButton @click="showCreateNewDialogue = true">Create workspace</UButton>
      <UButton @click="showImportDialogue = true" variant="outline"
        >Import workspace</UButton
      >
    </div>
  </div>

  <ImportFileDialog v-model:open="showImportDialogue" />
  <CreateFileDialog v-model:open="showCreateNewDialogue" />
</template>

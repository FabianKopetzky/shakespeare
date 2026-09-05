<script setup lang="ts">
import { ref } from "vue";
import ImportFileDialog from "../components/forms/ImportFileDialog.vue";
import CreateFileDialog from "../components/forms/CreateFileDialog.vue";
import Hero from "../components/widget/Hero.vue";

const showImportDialogue = ref<boolean>(false);
const showCreateNewDialogue = ref<boolean>(false);
</script>

<template>
  <div
    class="flex flex-col justify-center items-center gap-4 min-h-full mx-[5vw]">
    <Hero />
    <div
      class="flex flex-row gap-4 items-center justify-start mt-8 ml-12 w-full">
      <UButton @click="showCreateNewDialogue = true" color="primary" size="xl"
        >New Project</UButton
      >
      <UButton
        @click="showImportDialogue = true"
        variant="soft"
        color="secondary"
        size="xl"
        >Open Project</UButton
      >
    </div>

    <!-- <div class="w-10 h-10 bg-muted border-2" />
    <div class="w-10 h-10 bg-muted border-muted border-2" />
    <div class="w-10 h-10 bg-muted border-accented border-2" />
    <div class="w-10 h-10 bg-muted border-inverted border-2" /> -->
  </div>

  <ImportFileDialog v-model:open="showImportDialogue" />
  <CreateFileDialog v-model:open="showCreateNewDialogue" />
</template>

<template>
  <div class="w-full h-full relative">
    <div
      class="flex flex-col justify-center items-center gap-4 min-h-full mx-[5vw]">
      <Hero />
      <div
        class="flex flex-row gap-4 items-center justify-start mt-8 ml-12 w-full">
        <UButton @click="showCreateNewDialogue = true" color="primary" size="xl"
          >New Project</UButton
        >
        <UButton
          v-if="!isNativeApp"
          @click="showImportDialogue = true"
          variant="soft"
          color="secondary"
          size="xl"
          >Import Project</UButton
        >
        <UButton
          v-else
          variant="soft"
          color="secondary"
          size="xl"
          @click="projectListOpen = true"
          >Open Project</UButton
        >
      </div>
      <div class="flex flex-row gap-4 self-start ml-6 mt-20 w-full">
        <FlipCard
          icon="material-symbols:auto-stories-sharp"
          title="Create."
          content="Plan and write interactive stories with an intuitive and easy-to-use story graph."
          backsideContent="Shakespeare offers a visual story graph where you can drag and drop nodes and connect them with lines to create a story flow - simple, intuitive and easy to maintain." />
        <FlipCard
          icon="material-symbols:code-sharp"
          title="Code."
          content="Include variables, conditions and events in your story and communicate with your Unity code."
          backsideContent="No custom unity code is required for basic functionality, but shakespeare allows you to communicate with your unity project in both directions to enable you to build a fully custom story for your game." />
        <FlipCard
          icon="material-symbols:build-sharp"
          title="Compile."
          content="Import your stories to Unity* and bring them to life with just one click."
          backsideContent="Shakespeare generates .json files from your stories. The Shakespeare unity package can now read, parse and process the files. It also comes with premade components handling text rendering, branches and logic execution." />
      </div>
    </div>
    <div
      class="absolute top-4 right-4 flex flex-row items-center justify-end gap-2">
      <UTooltip :delayDuration="50" text="Open documentation">
        <UButton
          @click="openLink('https://fabiankopetzky.github.io/unity-docs/#/')"
          variant="soft"
          color="secondary"
          class="w-12 aspect-square flex items-center justify-center"
          icon="material-symbols:unknown-document-sharp" />
      </UTooltip>
      <UTooltip :delayDuration="50" text="Get Unity package">
        <UButton
          @click="openLink('https://fabiankopetzky.github.io/unity-docs/#/')"
          variant="soft"
          color="secondary"
          class="w-12 aspect-square flex items-center justify-center"
          icon="bi:unity" />
      </UTooltip>
      <UTooltip :delayDuration="50" text="Download desktop app">
        <UButton
          v-if="!isNativeApp"
          @click="openLink('https://fabiankopetzky.github.io/unity-docs/#/')"
          variant="soft"
          color="secondary"
          class="w-12 aspect-square flex items-center justify-center"
          icon="material-symbols:download-sharp" />
      </UTooltip>
    </div>
    <div class="absolute bottom-0 right-0 w-full">
      <p class="text-xs text-muted text-right">
        *To use imported Shakespeare files in Unity, the Shakespeare Unity
        package is required. Refer to the documentation for details. • v{{
          SHAKESPEARE_VERSION
        }}
        • Copyright © {{ new Date(Date.now()).getFullYear() }} Fabian Kopetzky -
        all rights reserved
      </p>
    </div>
  </div>

  <ImportFileDialog v-model:open="showImportDialogue" />
  <CreateFileDialog v-model:open="showCreateNewDialogue" />
  <ProjectList v-model:open="projectListOpen" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import ImportFileDialog from "../forms/ImportFileDialog.vue";
import CreateFileDialog from "../forms/CreateFileDialog.vue";
import Hero from "./Hero.vue";
import FlipCard from "./FlipCard.vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app.ts";

import { open } from "@tauri-apps/plugin-shell";
import ProjectList from "../forms/ProjectList.vue";
import { SHAKESPEARE_VERSION } from "../../composables/projectHandler.ts";

const { isNativeApp } = storeToRefs(useAppStore());

const showImportDialogue = ref<boolean>(false);
const showCreateNewDialogue = ref<boolean>(false);
const projectListOpen = ref<boolean>(false);

async function openLink(link: string): Promise<void> {
  if (isNativeApp.value) {
    await open(link);
    return;
  }
  window.open(link, "_blank");
}
</script>

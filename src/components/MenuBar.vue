<script setup lang="ts">
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "../stores/app";
import CreateFileDialog from "./forms/CreateFileDialog.vue";
import { ref } from "vue";
import ImportFileDialog from "./forms/ImportFileDialog.vue";

const app = useAppStore();
const appWindow = app.isNativeApp ? getCurrentWindow() : null;

const fileItems = [
  [
    { label: "New Project", onSelect: () => (createDialogueOpen.value = true) },
    {
      label: "Open Project",
      onSelect: () => (importDialogueOpen.value = true),
    },
    {
      label: "Open Recent",
      children: [
        { label: "Sample", onSelect: () => console.log("sample project") },
      ],
    },
  ],
  [{ label: "Save", onSelect: () => console.log("save") }],
  [{ label: "Quit", onSelect: () => appWindow?.close() }],
];

const compileItems = [
  [
    { label: "Download Project", onSelect: () => console.log("download") },
    {
      label: "Compile & Download",
      children: [
        { label: "All", onSelect: () => console.log("all") },
        { label: "Project Main", onSelect: () => console.log("main") },
        { label: "Stories", onSelect: () => console.log("stories") },
      ],
    },
    {
      label: "Compile & Build",
      children: [
        { label: "All", onSelect: () => console.log("all") },
        { label: "Project Main", onSelect: () => console.log("main") },
        { label: "Stories", onSelect: () => console.log("stories") },
      ],
    },
  ],
];

const menus: { title: string; items: any[] }[] = [
  {
    title: "File",
    items: fileItems,
  },
  {
    title: "Export",
    items: compileItems,
  },
];

function minimize() {
  appWindow?.minimize();
}

async function toggleMaximize() {
  await appWindow?.toggleMaximize();
}

function close() {
  appWindow?.close();
}

const createDialogueOpen = ref<boolean>(false);
const importDialogueOpen = ref<boolean>(false);
</script>

<template>
  <div
    data-tauri-drag-region
    class="flex h-8 items-center bg-default border-b border-default select-none">
    <div class="flex items-center gap-0.5 pl-2">
      <img src="/icon.svg" alt="" class="w-4 h-4 mr-1.5" />

      <UDropdownMenu
        v-for="menu in menus"
        :content="{ sideOffset: 0 }"
        :ui="{ content: 'mt-0' }"
        :items="menu.items">
        <UButton
          :label="menu.title"
          variant="ghost"
          color="neutral"
          size="sm"
          class="rounded-none h-8" />
      </UDropdownMenu>
    </div>

    <div
      data-tauri-drag-region
      class="flex-1 text-center text-s text-muted pointer-events-none"
      @dblclick="toggleMaximize">
      Shakespeare
    </div>

    <div class="flex h-full">
      <button
        class="flex items-center justify-center w-11.5 h-full hover:bg-elevated"
        @click="minimize">
        <UIcon name="i-lucide-minus" class="w-4 h-4" />
      </button>
      <button
        class="flex items-center justify-center w-11.5 h-full hover:bg-elevated"
        @click="toggleMaximize">
        <UIcon name="i-lucide-square" class="w-3.5 h-3.5" />
      </button>
      <button
        class="flex items-center justify-center w-11.5 h-full hover:bg-red-600 hover:text-white"
        @click="close">
        <UIcon name="i-lucide-x" class="w-4 h-4" />
      </button>
    </div>
  </div>
  <CreateFileDialog v-model:open="createDialogueOpen" />
  <ImportFileDialog v-model:open="importDialogueOpen" />
</template>

<script setup lang="ts">
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "../stores/app";
import CreateFileDialog from "./forms/CreateFileDialog.vue";
import { computed, onMounted, ref } from "vue";
import ImportFileDialog from "./forms/ImportFileDialog.vue";
import { storeToRefs } from "pinia";
import {
  type ProjectFileEntry,
  useProjectHandler,
} from "../composables/projectHandler.ts";
import ExportTranslationsDialog from "./forms/ExportTranslationsDialog.vue";
import ImportTranslationsDialog from "./forms/ImportTranslationsDialog.vue";

const app = useAppStore();
const { projectLoaded, isNativeApp } = storeToRefs(useAppStore());

const appWindow = isNativeApp.value ? getCurrentWindow() : null;

const {
  exportProject,
  saveCurrentProject,
  downloadCompiledProject,
  downloadCompiledStories,
  getProjects,
  openProject,
  buildProject,
  buildStories,
} = useProjectHandler();

const projects = ref<ProjectFileEntry[]>([]);
const projectItems = computed(() => {
  return projects.value.map((p) => ({
    label: p.name,
    onSelect: () => openProject(p.path),
  }));
});

async function regenerateProjectList(): Promise<void> {
  projects.value = await getProjects();
}

const fileItems = computed(() => [
  [
    { label: "New Project", onSelect: () => (createDialogueOpen.value = true) },
    {
      label: "Import Project",
      onSelect: () => (importDialogueOpen.value = true),
    },
    {
      label: "Open Project",
      disabled: !projectItems.value || projectItems.value.length <= 0,
      children: projectItems.value,
    },
  ],
  [
    {
      label: "Save",
      disabled: !projectLoaded.value,
      onSelect: () => saveCurrentProject(app.currentProjectPath, true),
    },
  ],
  [{ label: "Quit", onSelect: () => appWindow?.close() }],
]);

const languageItems = computed(() => [
  [
    {
      label: "Import translation map",
      onSelect: () => (importTranslationsOpen.value = true),
    },
    {
      label: "Export translation map",
      onSelect: () => (exportTranslationsOpen.value = true),
    },
  ],
]);

const compileItems = [
  [
    { label: "Download Project", onSelect: () => exportProject() },
    {
      label: "Compile & Download",
      children: [
        {
          label: "All",
          onSelect: () => {
            downloadCompiledProject();
            downloadCompiledStories();
          },
        },
        { label: "Project Main", onSelect: () => downloadCompiledProject() },
        { label: "Stories", onSelect: () => downloadCompiledStories() },
      ],
    },
    {
      label: "Compile & Build",
      children: [
        {
          label: "All",
          onSelect: () => {
            buildProject();
            buildStories();
          },
        },
        { label: "Project Main", onSelect: () => buildProject() },
        { label: "Stories", onSelect: () => buildStories() },
      ],
    },
  ],
];

const menus = computed(() => [
  {
    title: "File",
    items: fileItems.value,
  },
  {
    title: "Translations",
    items: languageItems.value,
  },
  {
    title: "Export",
    items: compileItems,
  },
]);

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
const exportTranslationsOpen = ref<boolean>(false);
const importTranslationsOpen = ref<boolean>(false);

onMounted(() => {
  regenerateProjectList();
});
</script>

<template>
  <div
    data-tauri-drag-region
    class="flex h-8 items-center bg-muted border-b border-default select-none">
    <div class="flex items-center gap-0.5 pl-2">
      <img src="/sp_gradient.png" alt="" class="w-6 h-6 mr-1.5" />

      <UDropdownMenu
        v-for="menu in menus"
        variant="soft"
        :content="{ sideOffset: 0 }"
        :items="menu.items"
        @update:open="
          (open: boolean) => {
            if (open && menu.title === 'File') regenerateProjectList();
          }
        ">
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
  <ExportTranslationsDialog v-model:open="exportTranslationsOpen" />
  <ImportTranslationsDialog v-model:open="importTranslationsOpen" />
</template>

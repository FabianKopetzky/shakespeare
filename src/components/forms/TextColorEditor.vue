<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useContentStore } from "../../stores/content";
import type { TextColor } from "../../types/schema";
import TextColorInput from "./TextColorInput.vue";
import TextColorItem from "./TextColorItem.vue";
import { storeToRefs } from "pinia";
import { useCompiler } from "../../composables/compiler.ts";
import Help from "../widget/Help.vue";
import { useAppStore } from "../../stores/app.ts";
import { useProjectHandler } from "../../composables/projectHandler.ts";

const { dialogues, storyNodes, textColors, settings } =
  storeToRefs(useContentStore());
const { resolveColorVariable } = useCompiler();

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());
const { saveCurrentProject } = useProjectHandler();

const addTextColorModalOpen = ref<boolean>(false);

async function addNewColor(color: TextColor) {
  textColors.value.push(color);

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function editColor(color: TextColor) {
  const idx = textColors.value.findIndex((c) => c.name == color.name);
  if (idx >= 0 && idx < textColors.value.length) {
    textColors.value[idx] = color;
  }

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function deleteColor(name: string) {
  const idx = textColors.value.findIndex((c) => c.name == name);
  if (idx < 0) return;

  // clean up
  for (const dialogue of dialogues.value) {
    for (const sentence of dialogue?.sentences ?? []) {
      for (const key of Object.keys(sentence.translations)) {
        sentence.translations[key] = resolveColorVariable(
          sentence.translations[key],
          textColors.value[idx].name,
          textColors.value[idx].hex,
        );
      }
    }
  }

  for (const node of Object.keys(storyNodes.value)) {
    if (storyNodes.value[node].type === "branch") {
      for (const branch of storyNodes.value[node].branches) {
        for (const key of Object.keys(branch.labels)) {
          branch.labels[key] = resolveColorVariable(
            branch.labels[key],
            textColors.value[idx].name,
            textColors.value[idx].hex,
          );
        }
      }
    }
  }

  textColors.value.splice(idx, 1);

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col lg:flex-row gap-2 justify-between mb-12">
      <div
        class="flex flex-row gap-2 items-center justify-between lg:justify-start">
        <h2>Text Colors</h2>
        <Help
          title="Text Colors"
          messageHtml='<p>Text color variables are used to define colors that can color text within dialogues. You can use them to highlight special words within your text, such as <span class="text-primary">danger, hints</span> or <span class="text-primary">quest-relevant info</span>. Changing the color of the variable will also update all texts this variable was used for.<br><br>When compiling the stories, the actual color value will be baked into the text. If you want to reference the defined color variables in Unity, you can enable the setting <span class="text-primary">"Compile color variables"</span> in the settings to compile the defined text colors into the main file of the project.</p>' />
      </div>
      <UButton
        icon="material-symbols:add-box-sharp"
        @click="addTextColorModalOpen = true"
        >New Color</UButton
      >
    </div>

    <template v-if="textColors.length > 0">
      <div class="flex flex-col gap-2">
        <div v-for="color in textColors" :key="color.name">
          <TextColorItem
            @edit="editColor"
            @delete="deleteColor"
            :color="color" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center text-muted">
        <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
        <span>No text colors defined</span>
      </div>
    </template>

    <TextColorInput
      v-model:open="addTextColorModalOpen"
      @submit="addNewColor"
      :color="undefined"
      mode="Create" />
  </div>
</template>

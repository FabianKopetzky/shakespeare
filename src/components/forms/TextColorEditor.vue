<script setup lang="ts">
import { ref } from "vue";
import { useContentStore } from "../../stores/content";
import type { TextColor } from "../../types/schema";
import TextColorInput from "./TextColorInput.vue";
import TextColorItem from "./TextColorItem.vue";
import { storeToRefs } from "pinia";
import { useCompiler } from "../../composables/compiler.ts";

const { dialogues, storyNodes, textColors } = storeToRefs(useContentStore());
const { resolveColorVariable } = useCompiler();
const addTextColorModalOpen = ref<boolean>(false);

function addNewColor(color: TextColor) {
  textColors.value.push(color);
}
function editColor(color: TextColor) {
  const idx = textColors.value.findIndex((c) => c.name == color.name);
  if (idx >= 0 && idx < textColors.value.length) {
    textColors.value[idx] = color;
  }
}
function deleteColor(name: string) {
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
}
</script>

<template>
  <div>
    <div class="flex flex-row justify-between mb-12">
      <h2>Text Colors</h2>
      <UButton
        icon="material-symbols:add-box-sharp"
        @click="addTextColorModalOpen = true"
        >New Text Color</UButton
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
      <p>There are no text colors defined...</p>
    </template>

    <TextColorInput
      v-model:open="addTextColorModalOpen"
      @submit="addNewColor"
      :color="undefined"
      mode="Create" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { StoryVariable } from "../../types/schema.ts";
import StoryVariableItem from "./StoryVariableItem.vue";
import StoryVariableInput from "./StoryVariableInput.vue";
import { storeToRefs } from "pinia";
import { useCompiler } from "../../composables/compiler.ts";

const { storyVariables, dialogues, storyNodes } =
  storeToRefs(useContentStore());
const { resolveStoryVariable } = useCompiler();
const addStoryVariableModalOpen = ref<boolean>(false);

function addNewVariable(variable: StoryVariable) {
  storyVariables.value.push(variable);
}
function editVariable(variable: StoryVariable) {
  const idx = storyVariables.value.findIndex((v) => v.name == variable.name);
  if (idx >= 0 && idx < storyVariables.value.length) {
    storyVariables.value[idx] = variable;
  }
}
function deleteVariable(name: string) {
  const idx = storyVariables.value.findIndex((v) => v.name == name);
  if (idx < 0) return;

  const toDelete = storyVariables.value[idx];

  // clean up variable
  for (const dialogue of dialogues.value) {
    for (const sentence of dialogue?.sentences ?? []) {
      for (const key of Object.keys(sentence.translations)) {
        sentence.translations[key] = resolveStoryVariable(
          sentence.translations[key],
          toDelete.name,
          toDelete.defaultValue,
        );
      }
    }
  }

  for (const nodeKey of Object.keys(storyNodes.value)) {
    const node = storyNodes.value[nodeKey];
    switch (node.type) {
      case "branch":
        for (const branch of node.branches) {
          for (const key of Object.keys(branch.labels)) {
            branch.labels[key] = resolveStoryVariable(
              branch.labels[key],
              toDelete.name,
              toDelete.defaultValue,
            );
          }
        }
        break;
      case "operation":
        if (node.operation?.variableName === toDelete.name) {
          node.operation = null;
        }
        break;
      case "event":
        for (const arg of node.args) {
          if (arg.kind === "variable" && arg.value === toDelete.name) {
            arg.kind = "literal";
            arg.value = toDelete.defaultValue;
          }
        }
        break;
      case "condition":
        for (const clause of node.condition ?? []) {
          const comparison = clause.comparison;
          if (
            comparison.left.kind === "variable" &&
            comparison.left.value === toDelete.name
          ) {
            comparison.left.value = toDelete.defaultValue;
            comparison.left.kind = "literal";
          }
          if (
            comparison.right.kind === "variable" &&
            comparison.right.value === toDelete.name
          ) {
            comparison.right.value = toDelete.defaultValue;
            comparison.right.kind = "literal";
          }
        }
        break;
    }
  }

  storyVariables.value.splice(idx, 1);
}
</script>

<template>
  <h2>Story Variables</h2>

  <template v-if="storyVariables.length > 0">
    <div v-for="variable in storyVariables" :key="variable.name">
      <StoryVariableItem
        @edit="editVariable"
        @delete="deleteVariable"
        :variable="variable" />
    </div>
  </template>
  <template v-else>
    <p>There are no story variables defined...</p>
  </template>

  <USeparator class="my-8" />

  <UButton @click="addStoryVariableModalOpen = true">Create new</UButton>

  <StoryVariableInput
    v-model:open="addStoryVariableModalOpen"
    @submit="addNewVariable"
    :variable="undefined"
    mode="Create" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { StoryVariable } from "../../types/schema.ts";
import StoryVariableItem from "./StoryVariableItem.vue";
import StoryVariableInput from "./StoryVariableInput.vue";

const { storyVariables } = useContentStore();
const addStoryVariableModalOpen = ref<boolean>(false);

function addNewVariable(variable: StoryVariable) {
  storyVariables.push(variable);
}
function editVariable(variable: StoryVariable) {
  const idx = storyVariables.findIndex((v) => v.name == variable.name);
  if (idx >= 0 && idx < storyVariables.length) {
    storyVariables[idx] = variable;
  }
}
function deleteVariable(name: string) {
  const idx = storyVariables.findIndex((v) => v.name == name);
  if (idx >= 0) {
    storyVariables.splice(idx, 1);
  }
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

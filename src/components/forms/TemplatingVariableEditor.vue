<script setup lang="ts">
import { useContentStore } from "../../stores/content";
import type { TemplatingVariable } from "../../types/schema";
import TemplatingVariableInput from "./TemplatingVariableInput.vue";
import TemplatingVariableItem from "./TemplatingVariableItem.vue";

const { templatingVariables } = useContentStore();

function addNewVariable(variable: TemplatingVariable) {
  templatingVariables.push(variable);
}
function editVariable(variable: TemplatingVariable) {
  const idx = templatingVariables.findIndex((v) => v.name == variable.name);
  if (idx >= 0 && idx < templatingVariables.length) {
    templatingVariables[idx] = variable;
  }
}
function deleteVariable(name: string) {
  const idx = templatingVariables.findIndex((v) => v.name == name);
  if (idx >= 0) {
    templatingVariables.splice(idx, 1);
  }
}
</script>

<template>
  <h2>Templating Variables</h2>

  <template v-if="templatingVariables.length > 0">
    <div v-for="variable in templatingVariables" :key="variable.name">
      <TemplatingVariableItem
        @edit="editVariable"
        @delete="deleteVariable"
        :variable="variable" />
    </div>
  </template>
  <template v-else>
    <p>There are no templating variables defined...</p>
  </template>

  <USeparator class="my-8" />

  <TemplatingVariableInput
    @submit="addNewVariable"
    :variable="undefined"
    mode="Create" />
</template>

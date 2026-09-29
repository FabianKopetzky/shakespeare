<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { Condition, StoryVariable } from "../../types/schema.ts";
import StoryVariableItem from "./StoryVariableItem.vue";
import StoryVariableInput from "./StoryVariableInput.vue";
import { storeToRefs } from "pinia";
import { useCompiler } from "../../composables/compiler.ts";
import { useAppStore } from "../../stores/app.ts";
import { useProjectHandler } from "../../composables/projectHandler.ts";

const { storyVariables, dialogues, storyNodes, settings } =
  storeToRefs(useContentStore());
const { resolveStoryVariable } = useCompiler();
const addStoryVariableModalOpen = ref<boolean>(false);

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());
const { saveCurrentProject } = useProjectHandler();

async function addNewVariable(variable: StoryVariable) {
  storyVariables.value.push(variable);

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function editVariable(variable: StoryVariable) {
  const idx = storyVariables.value.findIndex((v) => v.name == variable.name);
  if (idx >= 0 && idx < storyVariables.value.length) {
    storyVariables.value[idx] = variable;
  }

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function deleteVariable(name: string) {
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
          resolveStoryVariableInCondition(toDelete, branch.condition);
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
      case "switch":
        if (node.switchValue === toDelete.name) {
          node.switchValue = undefined;
          node.cases = node.cases.filter((c) => c.isDefault);
        }
        break;
      case "condition":
        resolveStoryVariableInCondition(toDelete, node.condition);
        break;
    }
  }

  storyVariables.value.splice(idx, 1);

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}

function resolveStoryVariableInCondition(
  toDelete: StoryVariable,
  condition: Condition | null,
): void {
  for (const clause of condition ?? []) {
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
}
</script>

<template>
  <div>
    <div class="flex flex-col lg:flex-row gap-2 justify-between mb-12">
      <div
        class="flex flex-row gap-2 items-center justify-between lg:justify-start">
        <h2>Story Variables</h2>
        <Help
          title="Story Variables"
          messageHtml='<p>Story variables hold the state of your project and stories globally. They are used for <span class="text-primary">templating</span> in your dialogue sentences and are responsible for <span class="text-primary">logic</span> in your stories.<span class="text-primary">Branches, Conditions</span> and <span class="text-primary">story nodes</span> use story variables to execute logic.<br><br>Story variables can be mutated in the Shakespeare editor using <span class="text-primary">Operation nodes</span>.<br><br>Story variables can also be read and mutated inside of Unity. Use the <span class="text-primary">GetVariable&lt;T&gt;</span> and <span class="text-primary">SetVariable&lt;T&gt;</span> methods of your <span class="text-primary">ShakespeareCore</span> instance to access variables at runtime.</p>' />
      </div>
      <UButton
        icon="material-symbols:add-box-sharp"
        @click="addStoryVariableModalOpen = true"
        >New Variable</UButton
      >
    </div>

    <template v-if="storyVariables.length > 0">
      <div class="flex flex-col gap-2">
        <div v-for="variable in storyVariables" :key="variable.name">
          <StoryVariableItem
            @edit="editVariable"
            @delete="deleteVariable"
            :variable="variable" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center text-muted">
        <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
        <span>No story variables defined</span>
      </div>
    </template>

    <StoryVariableInput
      v-model:open="addStoryVariableModalOpen"
      @submit="addNewVariable"
      :variable="undefined"
      mode="Create" />
  </div>
</template>

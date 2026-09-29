<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { ComputedProperty, Condition } from "../../types/schema.ts";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app.ts";
import { useProjectHandler } from "../../composables/projectHandler.ts";
import ComputedPropertyItem from "./ComputedPropertyItem.vue";
import ComputedPropertyInput from "./ComputedPropertyInput.vue";
import { useCompiler } from "../../composables/compiler.ts";

const { computedProperties, settings, dialogues, storyNodes } =
  storeToRefs(useContentStore());
const addComputedPropertyModalOpen = ref<boolean>(false);

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());
const { saveCurrentProject } = useProjectHandler();

const { resolveComputedProperty } = useCompiler();

async function addComputedProperty(property: ComputedProperty) {
  computedProperties.value.push(property);

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function editComputedProperty(property: ComputedProperty) {
  const idx = computedProperties.value.findIndex(
    (c) => c.name == property.name,
  );
  if (idx >= 0 && idx < computedProperties.value.length) {
    computedProperties.value[idx] = property;
  }

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function deleteComputedProperty(name: string) {
  const idx = computedProperties.value.findIndex((c) => c.name == name);
  if (idx < 0) return;

  const toDelete = computedProperties.value[idx];

  // clean up property
  for (const dialogue of dialogues.value) {
    for (const sentence of dialogue?.sentences ?? []) {
      for (const key of Object.keys(sentence.translations)) {
        sentence.translations[key] = resolveComputedProperty(
          sentence.translations[key],
          toDelete.name,
          "[unknown property]",
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
            branch.labels[key] = resolveComputedProperty(
              branch.labels[key],
              toDelete.name,
              "[unknown property]",
            );
          }
          resolveComputedPropertyInCondition(toDelete, branch.condition);
        }
        break;
      case "switch":
        if (node.switchValue === toDelete.name) {
          node.switchValue = undefined;
          node.cases = node.cases.filter((c) => c.isDefault);
        }
        break;
      case "condition":
        resolveComputedPropertyInCondition(toDelete, node.condition);
        break;
    }
  }
  computedProperties.value.splice(idx, 1);

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}

function resolveComputedPropertyInCondition(
  toDelete: ComputedProperty,
  condition: Condition | null,
): void {
  for (const clause of condition ?? []) {
    const comparison = clause.comparison;
    if (
      comparison.left.kind === "computed" &&
      comparison.left.value === toDelete.name
    ) {
      let value: string | number | boolean = "";
      switch (toDelete.returnType) {
        case "Boolean":
          value = false;
          break;
        case "Integer":
          value = 0;
          break;
        case "String":
          value = "";
          break;
      }
      comparison.left = { kind: "literal", value: value };
    }
    if (
      comparison.right.kind === "computed" &&
      comparison.right.value === toDelete.name
    ) {
      let value: string | number | boolean = "";
      switch (toDelete.returnType) {
        case "Boolean":
          value = false;
          break;
        case "Integer":
          value = 0;
          break;
        case "String":
          value = "";
          break;
      }
      comparison.right = { kind: "literal", value: value };
    }
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col xl:flex-row gap-2 justify-between mb-12">
      <div
        class="flex flex-row gap-2 items-center justify-between xl:justify-start">
        <h2>Computed properties</h2>
        <Help
          title="Computed properties"
          messageHtml="<p>Computed properties are compound variables that dynamically calculate values based on their parameters. Examples would include a <span class='text-primary'>has_quest(string id)</span> property that calculates the boolean value of having a quest by the id.<br><br>Computed properties are calculated from your Unity code: Here, you only define their signature and in Unity, you can register the property with <span class='text-primary'>RegisterComputedProperty(name, handler)</span> in your Shakespeare instance.</p>" />
      </div>
      <UButton
        icon="material-symbols:add-box-sharp"
        @click="addComputedPropertyModalOpen = true"
        >New Computed</UButton
      >
    </div>

    <template v-if="computedProperties.length > 0">
      <div
        v-for="property in computedProperties"
        :key="property.name"
        class="mb-2">
        <ComputedPropertyItem
          @edit="editComputedProperty"
          @delete="deleteComputedProperty"
          :computedProperty="property" />
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center text-muted">
        <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
        <span>No computed properties defined</span>
      </div>
    </template>

    <ComputedPropertyInput
      v-model:open="addComputedPropertyModalOpen"
      @submit="addComputedProperty"
      :computedProperty="undefined"
      mode="Create" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { ComputedProperty } from "../../types/schema.ts";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app.ts";
import { useProjectHandler } from "../../composables/projectHandler.ts";
import ComputedPropertyItem from "./ComputedPropertyItem.vue";
import ComputedPropertyInput from "./ComputedPropertyInput.vue";

const { computedProperties, settings } = storeToRefs(useContentStore());
const addComputedPropertyModalOpen = ref<boolean>(false);

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());
const { saveCurrentProject } = useProjectHandler();

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

  // for (const node of Object.keys(storyNodes.value)) {
  //   if (
  //     storyNodes.value[node].type === "event" &&
  //     storyNodes.value[node].event === name
  //   ) {
  //     storyNodes.value[node].event = null;
  //     storyNodes.value[node].args = [];
  //   }
  // }
  computedProperties.value.splice(idx, 1);

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

<script setup lang="ts">
import { ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { CustomFieldSchema } from "../../types/schema.ts";
import CustomFieldItem from "./CustomFieldItem.vue";
import CustomFieldInput from "./CustomFieldInput.vue";

const { customFields } = useContentStore();
const addCustomFieldModalOpen = ref<boolean>(false);

function addNewField(field: CustomFieldSchema) {
  customFields.push(field);
}
function editField(field: CustomFieldSchema) {
  const idx = customFields.findIndex((f) => f.name == field.name);
  if (idx >= 0 && idx < customFields.length) {
    customFields[idx] = field;
  }
}
function deleteField(name: string) {
  const idx = customFields.findIndex((f) => f.name == name);
  if (idx >= 0) {
    customFields.splice(idx, 1);
  }
}
</script>

<template>
  <h2>Fields</h2>

  <template v-if="customFields.length > 0">
    <div v-for="field in customFields" :key="field.name">
      <CustomFieldItem @edit="editField" @delete="deleteField" :field="field" />
    </div>
  </template>
  <template v-else>
    <p>There are no custom fields defined...</p>
  </template>

  <USeparator class="my-8" />

  <UButton @click="addCustomFieldModalOpen = true">Create new</UButton>

  <CustomFieldInput
    v-model:open="addCustomFieldModalOpen"
    @submit="addNewField"
    :field="undefined"
    mode="Create" />
</template>

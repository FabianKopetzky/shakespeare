<script setup lang="ts">
import { ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { CustomFieldSchema } from "../../types/schema.ts";
import CustomFieldItem from "./CustomFieldItem.vue";
import CustomFieldInput from "./CustomFieldInput.vue";

const { customFields, dialogues, stories, storyNodes } = useContentStore();
const addCustomFieldModalOpen = ref<boolean>(false);

function addNewField(field: CustomFieldSchema) {
  customFields.push(field);

  ensureCustomFields(field);
}
function editField(field: CustomFieldSchema) {
  const idx = customFields.findIndex((f) => f.name == field.name);
  if (idx >= 0 && idx < customFields.length) {
    customFields[idx] = field;

    ensureCustomFields(field);
  }
}

function ensureCustomFields(field: CustomFieldSchema) {
  // add the field to all existing instances
  switch (field.model) {
    case "dialogue":
      for (const dialogue of dialogues) {
        if (!dialogue) continue;
        if (!dialogue?.fields) dialogue.fields = { data: [] };
        const includes = dialogue?.fields?.data.find(
          (f) => f.name === field.name,
        );
        if (!includes) {
          dialogue?.fields?.data.push({
            name: field.name,
            value: field.defaultValue,
          });
        }
      }
      break;
    case "dialogue_sentence":
      for (const dialogue of dialogues) {
        if (!dialogue) continue;
        for (const sentence of dialogue.sentences) {
          if (!sentence) continue;
          if (!sentence.fields) sentence.fields = { data: [] };
          const includes = sentence?.fields?.data?.find(
            (f) => f.name === field.name,
          );
          if (!includes) {
            sentence?.fields?.data.push({
              name: field.name,
              value: field.defaultValue,
            });
          }
        }
      }
      break;
    case "branch":
      for (const node of Object.values(storyNodes)) {
        if (!node || node.type !== "branch") continue;

        for (const branch of node.branches) {
          if (!branch) continue;
          if (!branch.fields) branch.fields = { data: [] };
          const includes = branch?.fields?.data?.find(
            (f) => f.name === field.name,
          );
          if (!includes) {
            branch?.fields?.data.push({
              name: field.name,
              value: field.defaultValue,
            });
          }
        }
      }
      break;
    case "story":
      for (const story of stories) {
        if (!story) continue;
        if (!story.fields) story.fields = { data: [] };
        const includes = story?.fields?.data.find((f) => f.name === field.name);
        if (!includes) {
          story?.fields?.data.push({
            name: field.name,
            value: field.defaultValue,
          });
        }
      }
      break;
  }
}
function deleteField(name: string) {
  const idx = customFields.findIndex((f) => f.name == name);
  if (idx < 0) return;

  // clean up fields
  const field = customFields[idx];
  switch (field.model) {
    case "dialogue":
      for (const dialogue of dialogues) {
        if (!dialogue?.fields?.data) continue;
        dialogue.fields.data = dialogue?.fields?.data.filter(
          (f) => f.name !== name,
        );
      }
      break;
    case "dialogue_sentence":
      for (const dialogue of dialogues) {
        if (!dialogue) continue;
        for (const sentence of dialogue.sentences) {
          if (!sentence?.fields?.data) continue;
          sentence.fields.data = sentence.fields.data.filter(
            (f) => f.name !== name,
          );
        }
      }
      break;
    case "branch":
      for (const node of Object.values(storyNodes)) {
        if (!node || node.type !== "branch") continue;
        for (const branch of node.branches) {
          // was inverted (`if (!branch?.fields?.data)`), which skipped the
          // filter whenever data actually existed, and crashed when it
          // didn't (branch.fields.data assigned on an undefined branch.fields).
          // this now mirrors the guard-and-filter pattern used by every
          // other case above.
          if (!branch?.fields?.data) continue;
          branch.fields.data = branch.fields.data.filter(
            (f) => f.name !== name,
          );
        }
      }
      break;
    case "story":
      for (const story of stories) {
        if (!story?.fields?.data) continue;
        story.fields.data = story?.fields?.data.filter((f) => f.name !== name);
      }
      break;
  }

  customFields.splice(idx, 1);
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

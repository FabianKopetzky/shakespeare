<script setup lang="ts">
import { computed, ref } from "vue";
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

const dialogueExtensions = computed(() =>
  customFields.filter((f) => f.model === "dialogue"),
);
const sentenceExtensions = computed(() =>
  customFields.filter((f) => f.model === "dialogue_sentence"),
);
const storyExtensions = computed(() =>
  customFields.filter((f) => f.model === "story"),
);
const branchExtensions = computed(() =>
  customFields.filter((f) => f.model === "branch"),
);
const extensionLists = computed(() => [
  { label: "Dialogue Extensions", fields: dialogueExtensions.value },
  { label: "Dialogue Sentence Extensions", fields: sentenceExtensions.value },
  { label: "Story Extensions", fields: storyExtensions.value },
  { label: "Branch Extensions", fields: branchExtensions.value },
]);
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row gap-2 justify-between mb-12">
      <div
        class="flex flex-row gap-2 items-center justify-between sm:justify-start">
        <h2>Model Extensions</h2>
        <Help
          title="Model Extensions"
          messageHtml="<p>Custom fields allow you to extend the data models of <span class=text-primary>Stories, Dialogues, Dialogue Sentences</span> and <span class=text-primary>Branches</span>. To extend a model, add a field targeting the desired model and define its data type. In the editor, these fields will now show up for you to edit.<br><br>Custom fields can be used to add your own data, such as <span class=text-primary>character names</span> to dialogues, <span class=text-primary>types</span> to branches or even <span class=text-primary>audio file names</span> to dialogue sentences to add a voice over in your app.<br><br>In Unity, you can access custom fields using <code class=text-primary>CustomFields.GetField(fieldName)</code> on the model to directly resolve the value of that field. These can be used as direct values, point to objects in a game database or in any way you like.</p>" />
      </div>
      <UButton
        icon="material-symbols:add-box-sharp"
        @click="addCustomFieldModalOpen = true"
        >New Field</UButton
      >
    </div>

    <template v-if="customFields.length > 0">
      <template v-for="group in extensionLists" :key="group.label">
        <div v-if="group.fields.length > 0">
          <p class="text-dimmed text-sm mb-2">{{ group.label }}</p>
          <div class="flex flex-col gap-2 mb-8">
            <CustomFieldItem
              v-for="field in group.fields"
              @edit="editField"
              @delete="deleteField"
              :field="field" />
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center text-muted">
        <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
        <span>No model extensions defined</span>
      </div>
    </template>

    <CustomFieldInput
      v-model:open="addCustomFieldModalOpen"
      @submit="addNewField"
      :field="undefined"
      mode="Create" />
  </div>
</template>

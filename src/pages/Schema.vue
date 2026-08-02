<template>
  <div>
    <div class="flex flex-row justify-between">
      <h1>Schema</h1>
      <span class="self-end"
        >Allows you define custom data entries and extend dialogue and story
        models.</span
      >
    </div>
    <USeparator class="h-6" orientation="horizontal" />
    <UTabs :items="sections">
      <template #model>
        <p>Model</p>
      </template>
      <template #templating>
        <TextColorEditor />
      </template>
      <template #languages>
        <LanguageEditor />
      </template>
      <template #variables>
        <StoryVariableEditor />
      </template>
    </UTabs>
  </div>
</template>
<script setup lang="ts">
import LanguageEditor from "../components/forms/LanguageEditor.vue";
import StoryVariableEditor from "../components/forms/StoryVariableEditor.vue";
import TextColorEditor from "../components/forms/TextColorEditor.vue";

const sections = [
  {
    label: "Model Extensions",
    icon: "proicons:database-add",
    slot: "model",
  },
  {
    label: "Templating",
    icon: "tabler:template-filled",
    slot: "templating",
  },
  {
    label: "Languages",
    icon: "lucide:languages",
    slot: "languages",
  },
  {
    label: "Variables",
    icon: "mdi:variable",
    slot: "variables",
  },
];
</script>

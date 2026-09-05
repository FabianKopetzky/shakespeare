<template>
  <div class="h-full">
    <div>
      <h1>Schema</h1>
      <span class="self-end text-dimmed text-balance"
        >Define variables & events, add languages and extend the data models
        with your own custom fields.</span
      >
    </div>
    <div class="w-full h-0.5 bg-accented mt-12 mb-6" />
    <UTabs :items="sections">
      <template #model>
        <CustomFieldEditor class="mt-8" />
      </template>
      <template #events>
        <EventEditor class="mt-8" />
      </template>
      <template #languages>
        <LanguageEditor class="mt-8" />
      </template>
      <template #variables>
        <div class="flex flex-row h-full gap-12 mt-8">
          <StoryVariableEditor class="flex-5" />
          <div class="bg-accented w-0.5"></div>
          <TextColorEditor class="flex-4" />
        </div>
      </template>
    </UTabs>
  </div>
</template>
<script setup lang="ts">
import CustomFieldEditor from "../components/forms/CustomFieldEditor.vue";
import EventEditor from "../components/forms/EventEditor.vue";
import LanguageEditor from "../components/forms/LanguageEditor.vue";
import StoryVariableEditor from "../components/forms/StoryVariableEditor.vue";
import TextColorEditor from "../components/forms/TextColorEditor.vue";

const sections = [
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
  {
    label: "Events",
    icon: "mynaui:lightning-solid",
    slot: "events",
  },
  {
    label: "Model Extensions",
    icon: "proicons:database-add",
    slot: "model",
  },
];
</script>

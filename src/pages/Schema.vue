<template>
  <div class="h-full">
    <div class="flex flex-row justify-between">
      <h1>Schema</h1>
      <!-- <span class="self-end"
        >Allows you define custom data entries and extend dialogue and story
        models.</span
      > -->
    </div>
    <USeparator class="h-6" orientation="horizontal" />
    <UTabs :items="sections">
      <template #model>
        <CustomFieldEditor />
      </template>
      <template #events>
        <EventEditor />
      </template>
      <template #languages>
        <LanguageEditor />
      </template>
      <template #variables>
        <div class="flex flex-row h-full gap-12 mt-8">
          <StoryVariableEditor class="flex-3" />
          <div class="bg-accented w-0.5"></div>
          <TextColorEditor class="flex-2" />
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
    label: "Model Extensions",
    icon: "proicons:database-add",
    slot: "model",
  },
  {
    label: "Events",
    icon: "mynaui:lightning-solid",
    slot: "events",
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

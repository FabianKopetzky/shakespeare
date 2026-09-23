<template>
  <div class="h-full flex flex-col">
    <div>
      <h1>Schema</h1>
      <span class="self-end text-dimmed text-balance"
        >Define variables & events, add languages and extend the data models
        with your own custom fields.</span
      >
    </div>
    <div class="w-full h-0.5 bg-accented mt-12 mb-6" />
    <UTabs
      :items="sections"
      class="flex-1 min-h-0"
      :ui="{ content: 'flex-1 min-h-0' }">
      <template #model>
        <div class="h-full overflow-y-auto mt-8">
          <CustomFieldEditor />
        </div>
      </template>
      <template #events>
        <div class="h-full overflow-y-auto mt-8 flex flex-row gap-12">
          <EventEditor class="flex-1" />
          <div class="bg-accented w-0.5"></div>
          <ComputedPropertyEditor class="flex-1" />
        </div>
      </template>
      <template #languages>
        <div class="h-full overflow-y-auto mt-8">
          <LanguageEditor />
        </div>
      </template>
      <template #variables>
        <div class="h-full overflow-y-auto mt-8 flex flex-row gap-12">
          <StoryVariableEditor class="flex-5" />
          <div class="bg-accented w-0.5"></div>
          <TextColorEditor class="flex-4" />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import ComputedPropertyEditor from "../components/forms/ComputedPropertyEditor.vue";
import CustomFieldEditor from "../components/forms/CustomFieldEditor.vue";
import EventEditor from "../components/forms/EventEditor.vue";
import LanguageEditor from "../components/forms/LanguageEditor.vue";
import StoryVariableEditor from "../components/forms/StoryVariableEditor.vue";
import TextColorEditor from "../components/forms/TextColorEditor.vue";

const sections = [
  {
    label: "Languages",
    icon: "material-symbols:translate",
    slot: "languages",
  },
  {
    label: "Variables",
    icon: "material-symbols:code-xml-sharp",
    slot: "variables",
  },
  {
    label: "Events & Properties",
    icon: "ic:sharp-electric-bolt",
    slot: "events",
  },
  {
    label: "Model Extensions",
    icon: "mdi:database-plus",
    slot: "model",
  },
];
</script>

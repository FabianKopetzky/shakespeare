<script setup lang="ts">
import { ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { Event } from "../../types/schema.ts";
import EventItem from "./EventItem.vue";
import EventInput from "./EventInput.vue";
import { storeToRefs } from "pinia";

const { events, storyNodes } = storeToRefs(useContentStore());
const addEventModalOpen = ref<boolean>(false);

function addEvent(event: Event) {
  events.value.push(event);
}
function editEvent(event: Event) {
  const idx = events.value.findIndex((e) => e.name == event.name);
  if (idx >= 0 && idx < events.value.length) {
    events.value[idx] = event;
  }
}
function deleteEvent(name: string) {
  const idx = events.value.findIndex((e) => e.name == name);
  if (idx < 0) return;

  for (const node of Object.keys(storyNodes.value)) {
    if (
      storyNodes.value[node].type === "event" &&
      storyNodes.value[node].event === name
    ) {
      storyNodes.value[node].event = null;
      storyNodes.value[node].args = [];
    }
  }
  events.value.splice(idx, 1);
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row gap-2 justify-between mb-12">
      <div
        class="flex flex-row gap-2 items-center justify-between sm:justify-start">
        <h2>Events</h2>
        <Help
          title="Events"
          messageHtml='<p>Text color variables are used to define colors that can color text within dialogues. You can use them to highlight special words within your text, such as <span class="text-primary">danger, hints</span> or <span class="text-primary">quest-relevant info</span>. Changing the color of the variable will also update all texts this variable was used for.<br><br>When compiling the stories, the actual color value will be baked into the text. If you want to reference the defined color variables in Unity, you can enable the setting <span class="text-primary">"Compile color variables"</span> in the settings to compile the defined text colors into the main file of the project.</p>' />
      </div>
      <UButton
        icon="material-symbols:add-box-sharp"
        @click="addEventModalOpen = true"
        >New Event</UButton
      >
    </div>

    <template v-if="events.length > 0">
      <div v-for="event in events" :key="event.name" class="mb-2">
        <EventItem @edit="editEvent" @delete="deleteEvent" :event="event" />
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center justify-center text-muted">
        <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
        <span>No events defined</span>
      </div>
    </template>

    <EventInput
      v-model:open="addEventModalOpen"
      @submit="addEvent"
      :event="undefined"
      mode="Create" />
  </div>
</template>

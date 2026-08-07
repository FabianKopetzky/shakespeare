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
  <h2>Events</h2>

  <template v-if="events.length > 0">
    <div v-for="event in events" :key="event.name">
      <EventItem @edit="editEvent" @delete="deleteEvent" :event="event" />
    </div>
  </template>
  <template v-else>
    <p>There are no events defined...</p>
  </template>

  <USeparator class="my-8" />

  <UButton @click="addEventModalOpen = true">Create new</UButton>

  <EventInput
    v-model:open="addEventModalOpen"
    @submit="addEvent"
    :event="undefined"
    mode="Create" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { Event } from "../../types/schema.ts";
import EventItem from "./EventItem.vue";
import EventInput from "./EventInput.vue";

const { events } = useContentStore();
const addEventModalOpen = ref<boolean>(false);

function addEvent(event: Event) {
  events.push(event);
}
function editEvent(event: Event) {
  const idx = events.findIndex((e) => e.name == event.name);
  if (idx >= 0 && idx < events.length) {
    events[idx] = event;
  }
}
function deleteEvent(name: string) {
  const idx = events.findIndex((e) => e.name == name);
  if (idx < 0) return;

  events.splice(idx, 1);
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

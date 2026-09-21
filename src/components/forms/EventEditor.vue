<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useContentStore } from "../../stores/content.ts";
import type { Event } from "../../types/schema.ts";
import EventItem from "./EventItem.vue";
import EventInput from "./EventInput.vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app.ts";
import { useProjectHandler } from "../../composables/projectHandler.ts";

const { events, storyNodes, settings } = storeToRefs(useContentStore());
const addEventModalOpen = ref<boolean>(false);

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());
const { saveCurrentProject } = useProjectHandler();

async function addEvent(event: Event) {
  events.value.push(event);

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function editEvent(event: Event) {
  const idx = events.value.findIndex((e) => e.name == event.name);
  if (idx >= 0 && idx < events.value.length) {
    events.value[idx] = event;
  }

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
}
async function deleteEvent(name: string) {
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

  await nextTick();
  if (settings.value.autoSaveProject && isNativeApp) {
    await saveCurrentProject(
      currentProjectPath.value,
      settings.value.showAutoSaveMessages,
    );
  }
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
          messageHtml="<p>Events can be used to <span class='text-primary'>execute your own logic in your C# code</span>. You can define an event signature here in Shakespeare and <span class='text-primary'>invoke events from event nodes</span> in your stories. In Unity, you can subscribe to events via their name and attach your own listeners to execute custom logic, such as <span class='text-primary'>starting quests, adding items or opening menus</span>.</p>" />
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

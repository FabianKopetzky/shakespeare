<template>
  <div class="w-full h-full">
    <div class="flex flex-row justify-between items-start">
      <div>
        <p class="text-muted -mb-2">{{ getGreetingMessage() }}</p>
        <h1>{{ projectTitle }}</h1>
        <div class="max-w-200">
          <span class="self-end text-dimmed text-balance"
            >Created: {{ meta?.createdAt }} • Edited: {{ meta?.lastEdited }} •
            Version {{ meta?.version }}</span
          >
        </div>
      </div>
      <div class="flex flex-row-reverse items-start justify-end gap-2">
        <UButton color="primary" variant="solid">Exit project</UButton>
        <UButton color="secondary" variant="soft">Open location</UButton>
      </div>
    </div>
    <div class="w-full h-0.5 bg-accented mt-12 mb-6" />

    <PageSection title="Statistics" />
    <div class="flex flex-row items-start justify-start gap-4 flex-wrap">
      <StatsCard
        icon="material-symbols:forum-sharp"
        title="Dialogues"
        :count="dialogues.length" />
      <StatsCard
        icon="material-symbols:import-contacts-sharp"
        title="Stories"
        :count="stories.length" />
      <StatsCard
        icon="material-symbols:web-asset-sharp"
        title="Nodes"
        :count="Object.keys(storyNodes).length" />
    </div>
    <div class="mt-4 flex flex-row items-start justify-start gap-4 flex-wrap">
      <StatsCard
        icon="material-symbols:translate"
        title="Languages"
        :count="languages.length" />
      <StatsCard
        icon="material-symbols:code-xml-sharp"
        title="Variables"
        :count="storyVariables.length" />
      <StatsCard
        icon="material-symbols:colors-sharp"
        title="Text Colors"
        :count="textColors.length" />
      <StatsCard
        icon="ic:sharp-electric-bolt"
        title="Events"
        :count="events.length" />
      <StatsCard
        icon="mdi:database-plus"
        title="Extensions"
        :count="customFields.length" />
    </div>
    <PageSection title="Project Management" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContentStore } from "../../stores/content";
import StatsCard from "./StatsCard.vue";

const {
  projectTitle,
  projectAuthor,
  meta,
  dialogues,
  stories,
  storyVariables,
  storyNodes,
  languages,
  events,
  textColors,
  customFields,
} = storeToRefs(useContentStore());

const earlyMorningMessages = [
  `Already up, ${projectAuthor.value}?`,
  `Early shift, ${projectAuthor.value}?`,
];
const morningMessages = [
  `Good morning, ${projectAuthor.value}!`,
  `Let's get to work, ${projectAuthor.value}!`,
];
const afternoonMessages = [
  `Afternoon, ${projectAuthor.value}!`,
  `Good day, ${projectAuthor.value}!`,
];
const eveningMessages = [
  `Good evening, ${projectAuthor.value}!`,
  `Let's finish for today, ${projectAuthor.value}!`,
];
const nightMessages = [
  `Good night, ${projectAuthor.value}!`,
  `Still up, ${projectAuthor.value}?`,
];
function getGreetingMessage(): string {
  const time = new Date(Date.now()).getHours();

  if (time >= 4 && time <= 6)
    return earlyMorningMessages[
      Math.floor(Math.random() * earlyMorningMessages.length)
    ];
  else if (time >= 7 && time <= 12)
    return morningMessages[Math.floor(Math.random() * morningMessages.length)];
  else if (time >= 13 && time <= 17)
    return afternoonMessages[
      Math.floor(Math.random() * afternoonMessages.length)
    ];
  else if (time >= 18 && time <= 21)
    return eveningMessages[Math.floor(Math.random() * eveningMessages.length)];
  else return nightMessages[Math.floor(Math.random() * nightMessages.length)];
}
</script>

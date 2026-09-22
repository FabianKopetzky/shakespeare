<template>
  <div class="w-full h-full">
    <div class="flex flex-row justify-between items-start">
      <div>
        <p class="text-muted -mb-2">{{ greetingMessage }}</p>
        <h1>{{ projectTitle }}</h1>
        <div class="max-w-200">
          <span class="self-end text-dimmed text-balance"
            >Created: {{ meta?.createdAt }} • Edited: {{ meta?.lastEdited }} •
            Version {{ meta?.version }}</span
          >
        </div>
      </div>
      <div class="flex flex-row-reverse items-start justify-end gap-2">
        <UButton @click="showExitConfirm = true" color="primary" variant="solid"
          >Exit project</UButton
        >
        <UButton
          v-if="isNativeApp"
          @click="openProjectInExplorer(currentProjectPath)"
          color="secondary"
          variant="soft"
          >Open location</UButton
        >
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
        icon="material-symbols:calculate-sharp"
        title="Computed"
        :count="computedProperties.length" />
      <StatsCard
        icon="mdi:database-plus"
        title="Extensions"
        :count="customFields.length" />
    </div>
    <PageSection title="Project Management" />
    <p>
      Quickly get started with
      <span class="text-toned">{{ projectTitle }}</span> here:
    </p>
    <div class="my-4 flex flex-row justify-between gap-4 items-center">
      <div class="flex flex-row items-center justify-start gap-4">
        <UButton
          @click="editProjectTitleOpen = true"
          icon="material-symbols:edit-sharp"
          color="primary"
          variant="solid"
          >Edit project</UButton
        >
        <UButton
          @click="router.push('/export')"
          color="secondary"
          variant="soft"
          icon="material-symbols:code-sharp"
          >Compile project</UButton
        >
        <UButton
          icon="material-symbols:settings-sharp"
          @click="router.push('/settings')"
          color="secondary"
          variant="soft"
          >Project settings</UButton
        >
      </div>
      <UButton
        v-if="isNativeApp"
        @click="showDeleteConfirm = true"
        color="error"
        variant="soft"
        icon="material-symbols:delete-outline-sharp"
        >Delete project</UButton
      >
    </div>
    <div v-if="isNativeApp">
      <p>or manage your local projects:</p>
      <UButton
        @click="projectListOpen = true"
        icon="material-symbols:lists-sharp"
        class="mt-4"
        variant="solid"
        color="primary"
        >Project list</UButton
      >
    </div>
    <div class="h-12" />
  </div>
  <ProjectList v-model:open="projectListOpen" />
  <CreateFileDialog v-model:open="editProjectTitleOpen" mode="Update" />
  <ConfirmDialog
    v-model:open="showDeleteConfirm"
    title="Delete project"
    :description="`Are you sure you want to delete the project ${projectTitle} by ${projectAuthor}? The project file will be removed from your disk, but already compiled or downloaded files remain untouched. This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline-sharp"
    @confirm="deleteOpenProject" />
  <ConfirmDialog
    v-model:open="showExitConfirm"
    title="Exit project"
    :description="`Are you sure you want to exit ${projectTitle}? Changes in your current project will not be saved. Verify that your current project is saved before exiting it.`"
    confirm-label="Exit"
    color="primary"
    icon="material-symbols:close"
    @confirm="unloadProject" />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContentStore } from "../../stores/content";
import StatsCard from "./StatsCard.vue";
import ProjectList from "../forms/ProjectList.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import CreateFileDialog from "../forms/CreateFileDialog.vue";
import { useAppStore } from "../../stores/app.ts";
import { useProjectHandler } from "../../composables/projectHandler.ts";

const router = useRouter();

const { unloadProject, deleteProject, openProjectInExplorer } =
  useProjectHandler();

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
  computedProperties,
  textColors,
  customFields,
} = storeToRefs(useContentStore());

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());

const projectListOpen = ref<boolean>(false);
const showDeleteConfirm = ref<boolean>(false);
const showExitConfirm = ref<boolean>(false);
const editProjectTitleOpen = ref<boolean>(false);

async function deleteOpenProject(): Promise<void> {
  const res = await deleteProject(projectTitle.value);
  if (res) router.push("/");
}
const greetingMessage = computed<string>(() => {
  const name = projectAuthor.value;
  const hour = new Date().getHours();

  let messages: string[];
  if (hour >= 4 && hour <= 6)
    messages = [`Already up, ${name}?`, `Early shift, ${name}?`];
  else if (hour >= 7 && hour <= 12)
    messages = [`Good morning, ${name}!`, `Let's get to work, ${name}!`];
  else if (hour >= 13 && hour <= 16)
    messages = [`Afternoon, ${name}!`, `Good day, ${name}!`];
  else if (hour >= 17 && hour <= 21)
    messages = [`Good evening, ${name}!`, `Let's finish for today, ${name}!`];
  else messages = [`Good night, ${name}!`, `Still up, ${name}?`];

  return messages[Math.floor(Math.random() * messages.length)];
});
</script>

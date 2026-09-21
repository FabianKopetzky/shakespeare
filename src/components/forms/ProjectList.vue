<template>
  <UModal
    v-model:open="open"
    title="Project List"
    :ui="{ content: 'max-w-2xl' }">
    <template #body>
      <div v-if="isNativeApp">
        <div v-if="projects.length > 0">
          <UFormField class="w-full">
            <UInput
              class="w-full"
              size="lg"
              placeholder="Search projects..."
              leading-icon="material-symbols:search-sharp"
              v-model="currentSearch" />
          </UFormField>
          <div
            v-if="filteredProjects.length > 0"
            class="mt-4 h-100 overflow-y-scroll flex flex-col justify-start gap-2 w-full">
            <ProjectItem
              v-for="project in filteredProjects"
              :key="project.name"
              :project="project"
              :deletable="project.path !== currentProjectPath"
              :openable="project.path !== currentProjectPath"
              @delete="deleteProjectFromList"
              @open="openProjectFromList" />
          </div>
          <div
            v-else
            class="h-100 flex flex-col flex-1 self-center items-center justify-center text-muted">
            <UIcon
              name="material-symbols:sentiment-dissatisfied"
              class="w-12 h-12" />
            <span>No projects match your search</span>
          </div>
        </div>
        <div v-else>
          <div
            class="h-100 flex flex-col flex-1 self-center items-center justify-center text-muted">
            <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
            <span>You currently do not have any projects</span>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="text-error">
          A project list is only available in the native app.
        </p>
      </div>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app";
import { computed, ref, watch } from "vue";
import { useProjectHandler } from "../../composables/projectHandler";
import type { ProjectFileEntry } from "../../composables/projectHandler";
import ProjectItem from "./ProjectItem.vue";
import { useRouter } from "vue-router";

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());
const { deleteProject, openProject } = useProjectHandler();

const open = defineModel<boolean>("open", { default: false });
const { getProjects } = useProjectHandler();

const projects = ref<ProjectFileEntry[]>([]);
const currentSearch = ref<string>("");

const router = useRouter();

const filteredProjects = computed<ProjectFileEntry[]>(() => {
  return projects.value.filter((p) =>
    p?.name.toLowerCase().includes(currentSearch.value.toLowerCase()),
  );
});

async function deleteProjectFromList(projectName: string): Promise<void> {
  const res = await deleteProject(projectName);
  if (res) await regenerateProjects();
}
async function openProjectFromList(projectPath: string): Promise<void> {
  const res = await openProject(projectPath);
  if (res) router.push("/");
  open.value = false;
}

watch(open, async (isOpen) => {
  if (isOpen) {
    currentSearch.value = "";
    await regenerateProjects();
  }
});

async function regenerateProjects(): Promise<void> {
  projects.value = await getProjects();
}
</script>

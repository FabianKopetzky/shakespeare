<template>
  <div class="h-full">
    <div>
      <h1>Export</h1>
      <span class="self-end text-dimmed text-balance"
        >Save, download and compile your project for Unity. Also bulk import
        translations with .csv files!</span
      >
    </div>
    <div class="w-full h-0.5 bg-accented mt-12 mb-6" />

    <PageSection title="Project" />

    <div class="flex flex-col gap-2 mt-4 w-[70%]">
      <p>
        Download the project file to the
        <span class="text-primary">Downloads</span> folder of your device.
      </p>
      <span class="text-dimmed text-sm"
        >The project file is a single .json file containing your entire project.
        You can backup this file to create a backup of your project or share it
        with team members.
        <span v-if="isNativeApp" class="text-dimmed text-sm"
          >The project file also sits at
          <span class="text-primary text-sm">{{ currentProjectPath }}</span> on
          your machine. Shakespeare loads it from there.
        </span></span
      >

      <div class="flex flex-row gap-4 mt-8">
        <UButton
          color="primary"
          variant="solid"
          icon="material-symbols:download-sharp"
          class="w-fit"
          @click="exportProject"
          >Download project file</UButton
        >
        <UButton
          v-if="isNativeApp"
          color="secondary"
          variant="soft"
          icon="material-symbols:folder-open-sharp"
          >Open project location</UButton
        >
      </div>
    </div>
    <PageSection title="Compile" />

    <div class="flex flex-col gap-2 mt-4 w-[70%]">
      <p>
        Compiling your project means splitting your stories and translations
        into multiple .json files and structuring them so that the
        <span class="text-primary">Shakespeare Unity Package</span> can load and
        process them.
      </p>
      <span class="text-dimmed text-sm"
        >Compiling creates a project main file called
        <span class="text-dimmed text-sm">main.json</span> and a file for every
        story for every translation. This allows Unity to only load data that is
        actually required into memory. Do not rename the generated files!</span
      >
      <p class="mt-8">
        Compile and download the files to the
        <span class="text-primary">Downloads</span> folder.
      </p>
      <div class="flex flex-row gap-4">
        <UButton
          color="primary"
          variant="solid"
          icon="material-symbols:build-sharp"
          class="w-fit"
          @click="compileAndDownloadAll"
          >Compile & download all</UButton
        >
        <UButton
          @click="downloadCompiledProject"
          color="secondary"
          variant="soft"
          >Only project main</UButton
        >
        <UButton
          @click="downloadCompiledStories"
          color="secondary"
          variant="soft"
          >Only stories</UButton
        >
      </div>

      <p v-if="isNativeApp" class="mt-8">
        Compile and build the files directly into your Unity project. Configure
        the
        <span class="text-primary">Unity Streaming Assets Path</span> in the
        project settings.
      </p>
      <div v-if="isNativeApp" class="flex flex-row gap-4">
        <UButton
          color="primary"
          variant="solid"
          icon="material-symbols:construction"
          class="w-fit"
          @click="compileAndBuildAll"
          >Compile & build all</UButton
        >
        <UButton @click="buildProject" color="secondary" variant="soft"
          >Only project main</UButton
        >
        <UButton @click="buildStories" color="secondary" variant="soft"
          >Only stories</UButton
        >
      </div>
    </div>
    <PageSection title="Translations" />
    <div class="flex flex-col gap-2 mt-4 w-[70%]">
      <p>
        Export all translations into a single .csv file and edit them all at
        once, give them to a translator or automatically translate them. Import
        a translation file to automatically translate your project.
      </p>
      <div class="flex flex-row gap-4 mt-8">
        <UButton
          color="primary"
          variant="solid"
          icon="material-symbols:table-edit-sharp"
          class="w-fit"
          @click="exportTranslationsOpen = true"
          >Export translations</UButton
        >
        <UButton
          color="primary"
          variant="solid"
          icon="material-symbols:table-convert-sharp"
          class="w-fit"
          @click="importTranslationsOpen = true"
          >Import translations</UButton
        >
      </div>
    </div>
    <div class="h-12" />
  </div>
  <ExportTranslationsDialog v-model:open="exportTranslationsOpen" />
  <ImportTranslationsDialog v-model:open="importTranslationsOpen" />
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useProjectHandler } from "../composables/projectHandler";
import { useAppStore } from "../stores/app";
import { ref } from "vue";
const {
  exportProject,
  downloadCompiledStories,
  downloadCompiledProject,
  buildProject,
  buildStories,
} = useProjectHandler();

const { isNativeApp, currentProjectPath } = storeToRefs(useAppStore());

function compileAndDownloadAll(): void {
  downloadCompiledProject();
  downloadCompiledStories();
}
function compileAndBuildAll(): void {
  buildProject();
  buildStories();
}

const exportTranslationsOpen = ref<boolean>(false);
const importTranslationsOpen = ref<boolean>(false);
</script>

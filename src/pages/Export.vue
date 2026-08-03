<template>
  <div>
    <div class="flex flex-row justify-between">
      <h1>Export</h1>
      <p>Save and compile your project!</p>
    </div>
    <USeparator class="h-6" orientation="horizontal" />
    <div class="flex flex-col gap-2">
      <div>
        <h2>Export project</h2>
        <p>
          Save your project in one file that you can import again later or share
          between people!
        </p>
        <UButton @click="exportProject">Export project</UButton>
      </div>
      <div>
        <h2>Compile files</h2>
        <p>Compile your files and export directly to Unity!</p>
        <UButton @click="downloadCompiledStories">Download stories</UButton>
        <UButton @click="downloadCompiledProject">Download project</UButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useProjectHandler } from "../composables/projectHandler";
const { exportProject, downloadCompiledStories, downloadCompiledProject } =
  useProjectHandler();
</script>

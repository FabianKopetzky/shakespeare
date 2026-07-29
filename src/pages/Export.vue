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
        <UButton @click="tryCompileStories">Compile stories</UButton>
        <h2>Compile languages</h2>
        <div class="flex flex-row justify-start items-center gap-4">
          <UButton
            v-for="language in languages"
            @click="tryCompileLanguage(language.code)"
            >Compile {{ language.code }} ({{ language.display }})</UButton
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useProjectHandler } from "../composables/projectHandler";
import { useWidget } from "../composables/widget";
import { useContentStore } from "../stores/content";

const { languages, projectTitle } = useContentStore();
const { exportProject, compileLanguage, compileStories } = useProjectHandler();
const { displayError, displaySuccess } = useWidget();

function tryCompileLanguage(lang: string): void {
  const res = compileLanguage(lang);
  if (res) displaySuccess(`Successfully compiled language '${lang}'`);
  else displayError(`An error occurred compiling language '${lang}'`);
}
function tryCompileStories(): void {
  const res = compileStories();
  if (res)
    displaySuccess(
      `Successfully compiled stories for project '${projectTitle}'`,
    );
  else
    displayError(
      `An error occurred compiling stories for project '${projectTitle}'`,
    );
}
</script>

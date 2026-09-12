<template>
  <div class="h-full">
    <div>
      <h1>Settings</h1>
      <span class="self-end text-dimmed text-balance"
        >Manage preferences of this project. Settings are stored per project and
        are directly tied to it.</span
      >
    </div>
    <div class="w-full h-0.5 bg-accented mt-12 mb-6" />

    <div
      class="w-full h-14 bg-elevated flex flex-row items-center justify-start mb-4">
      <div class="h-full w-2 bg-primary" />
      <h3 class="ml-4">Unity</h3>
    </div>

    <div class="flex flex-col gap-2 w-[50%]">
      <UFormField class="w-full" label="Unity Streaming Assets Path">
        <div class="flex flex-row items-center gap-4">
          <UInput class="w-full" v-model="settings.unityStreamingAssetsPath" />
          <Help
            title="Streaming Assets Path"
            messageHtml='<p>Provide the base path to the <span class="text-primary">StreamingAssets</span> folder of your unity project. The folder should be located at the base of the project:<br><br> <code class="text-primary">YourProject/Assets/StreamingAssets</code><br><br> Shakespeare will then infer the correct main and story path from the project structure. Make sure your project is configured correctly.</p>' />
        </div>
      </UFormField>
      <div class="flex flex-row items-center justify-between gap-4 w-full">
        <UCheckbox
          size="xl"
          label="Compile text colors"
          v-model="settings.compileTextColors" />
        <Help
          title="Compile text colors"
          messageHtml='<p>If checked, <span class="text-primary">Text Color Variables</span> will be compiled and included in the <code class="text-primary">main.json</code> file and therefore accessable over the <span class="text-primary">Shakespeare Core Instance</span>. This enables you to use your color definitons from Shakespeare in other parts of your project as well.</p>' />
      </div>
    </div>

    <div
      class="w-full h-14 bg-elevated flex flex-row items-center justify-start mb-4 mt-12">
      <div class="h-full w-2 bg-primary" />
      <h3 class="ml-4">Editor</h3>
    </div>

    <div class="flex flex-col gap-2 w-[50%] mt-4">
      <div class="flex flex-row items-center justify-between gap-4 w-full">
        <UCheckbox
          size="xl"
          label="Allow empty dialogue sentences"
          v-model="settings.allowEmptyDialogues" />
      </div>
      <div class="flex flex-row items-center justify-between gap-4 w-full">
        <UCheckbox
          size="xl"
          label="Warn before discarding editor changes"
          v-model="settings.warnBeforeDiscarding" />
      </div>
      <div class="flex flex-row items-center justify-between gap-4 w-full">
        <UCheckbox
          size="xl"
          label="Auto-save project"
          v-model="settings.autoSaveProject" />
        <Help
          title="Auto Save"
          messageHtml='<p>If checked, your project will be <span class="text-primary">saved automatically</span> whenever you confirm changes in your project:<br><ul><li>When you create new objects</li><li>When you edit objects</li><li>When you modify story flows</li></ul></p>' />
      </div>
      <div class="flex flex-row items-center justify-between gap-4 w-full">
        <UCheckbox
          size="xl"
          label="Show auto-save messages"
          v-model="settings.showAutoSaveMessages" />
      </div>
      <div class="flex flex-row items-center justify-between gap-4 w-full">
        <UCheckbox
          size="xl"
          label="Warn before quitting app"
          v-model="settings.warnBeforeClosing" />
      </div>
      <div class="flex flex-row items-center justify-between gap-4 w-full">
        <UCheckbox
          size="xl"
          label="Show missing translations"
          v-model="settings.showMissingTranslations" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContentStore } from "../stores/content";

const { settings } = storeToRefs(useContentStore());
</script>

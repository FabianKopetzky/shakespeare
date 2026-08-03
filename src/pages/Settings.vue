<template>
  <div>
    <div class="flex flex-row justify-between">
      <h1>Settings</h1>
      <p>Preferenecs</p>
    </div>
    <USeparator class="h-6" orientation="horizontal" />
    <div class="flex flex-col gap-2">
      <UFormField
        label="Unity Streaming Assets Path"
        help="Provide the base path to the StreamingAssets folder of your project. Shakespeare will infer the correct main and story path from the project structure. Make sure your project is configured correctly.">
        <UInput v-model="unityStreamingAssetsPath" />
      </UFormField>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContentStore } from "../stores/content";

const { unityStreamingAssetsPath } = storeToRefs(useContentStore());
</script>

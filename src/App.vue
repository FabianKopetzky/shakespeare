<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
import { useAppStore } from "./stores/app.ts";

const app = useAppStore();
</script>

<template>
  <UApp>
    <div v-if="!app.isLoading" class="w-screen h-screen flex flex-row">
      <Sidebar class="w-20 h-full" />
      <UMain class="max-w-screen flex-1 min-h-screen overflow-y-scroll p-12">
        <RouterView />
      </UMain>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </UApp>
</template>

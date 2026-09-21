<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Sidebar from "./components/Sidebar.vue";
import { useAppStore } from "./stores/app.ts";
import MenuBar from "./components/MenuBar.vue";

const appStore = useAppStore();
const { isNativeApp, isLoading, projectLoaded } = storeToRefs(appStore);
const router = useRouter();

router.beforeEach((to) => {
  if (to.path !== "/" && !projectLoaded.value) {
    router.push("/");
    return false;
  }
});
</script>

<template>
  <UApp>
    <div
      v-if="!isLoading"
      class="w-screen h-screen flex flex-col overflow-y-hidden overflow-x-hidden">
      <MenuBar v-if="isNativeApp" />
      <div
        class="w-full h-full flex flex-row overflow-y-hidden overflow-x-hidden">
        <Sidebar v-if="projectLoaded" class="w-20 h-full" />
        <UMain
          class="max-w-screen flex-1 overflow-y-scroll overflow-x-hidden p-12">
          <RouterView />
        </UMain>
      </div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </UApp>
</template>

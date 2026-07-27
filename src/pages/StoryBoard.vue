<template>
  <template v-if="!story">
    <h1>A story with the id {{ route.params.id }} does not exist!</h1>
  </template>
  <template v-else>
    <p>{{ story.id }}</p>
  </template>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { Story } from "../types/schema";
import { useContentStore } from "../stores/content";

const route = useRoute();
const story = ref<Story>(undefined);
const { stories } = useContentStore();

onMounted(() => {
  const id = route.params.id;
  story.value = stories.find((s) => s?.id == id);
});
watch(
  () => route.fullPath,
  () => {
    const id = route.params.id;
    story.value = stories.find((s) => s?.id == id);
  },
);
</script>

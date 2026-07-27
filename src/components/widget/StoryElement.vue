<template>
  <div
    class="flex flex-row justify-start items-center gap-4 h-12 bg-white/5 hover:bg-white/10 rounded-lg p-2 cursor-pointer">
    <div class="flex flex-row justify-between items-center gap-2">
      <UIcon name="material-symbols:key-rounded" />
      <span class="font-bold">{{ story?.id }}</span>
    </div>
    <span>{{ descriptionPreview }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { Story } from "../../types/schema";

interface Props {
  story: Story;
}
const props = defineProps<Props>();
const descriptionPreview = computed(() => {
  if (!props.story?.description) return "";
  return props.story?.description?.length >= 20
    ? props.story?.description.substring(0, 16) + "..."
    : props.story?.description;
});
</script>

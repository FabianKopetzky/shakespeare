<template>
  <div
    class="flex flex-row justify-start items-center gap-4 h-12 bg-white/5 hover:bg-white/10 rounded-lg p-2 cursor-pointer">
    <div class="flex flex-row justify-between items-center gap-2">
      <UIcon name="material-symbols:key-rounded" />
      <span class="font-bold">{{ node?.id }}</span>
    </div>
    <span>{{ descriptionPreview }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { DialogueNode } from "../../types/schema";

interface Props {
  node: DialogueNode;
}
const props = defineProps<Props>();
const descriptionPreview = computed(() => {
  if (!props.node?.description) return "";
  return props.node?.description?.length >= 20
    ? props.node?.description.substring(0, 16) + "..."
    : props.node?.description;
});
</script>

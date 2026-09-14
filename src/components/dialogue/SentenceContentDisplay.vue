<script setup lang="ts">
import { computed } from "vue";
import { parseContent } from "../../utils/dialogueContent";
import type { StoryVariable } from "../../types/schema";
import ContentNodeRenderer from "./ContentNodeRenderer.vue";

interface Props {
  content: string;
  variables: StoryVariable[];
}
const props = defineProps<Props>();
const nodes = computed(() => parseContent(props.content ?? ""));
</script>

<template>
  <div
    class="w-full min-h-12 px-3 py-2 rounded-none! border-none! border-0! bg-muted! shadow-sm ring-1 ring-inset ring-[#4a3f30] focus:ring-1 focus:ring-inset focus:ring-[#4a3f30] outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-75">
    <p v-if="content" class="whitespace-pre-wrap leading-relaxed">
      <ContentNodeRenderer :nodes="nodes" :variables="variables" />
    </p>
    <p v-else class="text-dimmed text-sm">
      No content for this language yet...
    </p>
  </div>
</template>

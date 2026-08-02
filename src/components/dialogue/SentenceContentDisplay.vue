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
  <p v-if="content" class="whitespace-pre-wrap leading-relaxed">
    <ContentNodeRenderer :nodes="nodes" :variables="variables" />
  </p>
  <p v-else class="text-gray-400 italic text-sm">
    No content for this language yet.
  </p>
</template>

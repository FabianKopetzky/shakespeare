<script setup lang="ts">
defineOptions({ name: "ContentNodeRenderer" });

import type { ContentNode } from "../../utils/dialogueContent";
import { placeholderForVariable } from "../../utils/dialogueContent";
import type { TemplatingVariable } from "../../types/schema";

interface Props {
  nodes: ContentNode[];
  variables: TemplatingVariable[];
}
defineProps<Props>();
</script>

<template>
  <template v-for="(node, i) in nodes" :key="i">
    <span v-if="node.type === 'text'">{{ node.value }}</span>
    <span v-else-if="node.type === 'variable'" class="dialogue-variable-chip">
      {{ placeholderForVariable(node.name, variables) }}
    </span>
    <strong v-else-if="node.type === 'bold'">
      <ContentNodeRenderer :nodes="node.children" :variables="variables" />
    </strong>
    <em v-else-if="node.type === 'italic'">
      <ContentNodeRenderer :nodes="node.children" :variables="variables" />
    </em>
    <span v-else-if="node.type === 'color'" :style="{ color: node.hex }">
      <ContentNodeRenderer :nodes="node.children" :variables="variables" />
    </span>
  </template>
</template>

<style>
/* Unscoped: this renderer is recursive and reused across preview contexts. */
.dialogue-variable-chip {
  display: inline-block;
  padding: 0 0.375rem;
  margin: 0 1px;
  border-radius: 0.25rem;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9em;
}
</style>

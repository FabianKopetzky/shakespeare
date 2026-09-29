<script setup lang="ts">
defineOptions({ name: "ContentNodeRenderer" });

import type { ComputedArg, ContentNode } from "../../utils/dialogueContent";
import { placeholderForVariable } from "../../utils/dialogueContent";
import type { ComputedProperty, StoryVariable } from "../../types/schema";
import { useContentStore } from "../../stores/content";
import { storeToRefs } from "pinia";

interface Props {
  nodes: ContentNode[];
  variables: StoryVariable[];
  computedProperties: ComputedProperty[];
}
defineProps<Props>();

const HEX_PATTERN = /^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
const { textColors } = storeToRefs(useContentStore());

function formatComputed(name: string, args: ComputedArg[]): string {
  return `${name}(${args.map((a) => a.value).join(",")})`;
}
</script>

<template>
  <template v-for="(node, i) in nodes" :key="i">
    <span v-if="node.type === 'text'">{{ node.value }}</span>
    <code
      v-else-if="node.type === 'variable'"
      class="dialogue-variable-chip bg-primary/10">
      {{ placeholderForVariable(node.name, variables) }}
    </code>
    <code
      v-else-if="node.type === 'computed'"
      class="dialogue-variable-chip bg-primary/10">
      {{ formatComputed(node.name, node.args) }}
    </code>
    <strong v-else-if="node.type === 'bold'">
      <ContentNodeRenderer
        :nodes="node.children"
        :variables="variables"
        :computed-properties="computedProperties" />
    </strong>
    <em v-else-if="node.type === 'italic'">
      <ContentNodeRenderer
        :nodes="node.children"
        :variables="variables"
        :computed-properties="computedProperties" />
    </em>
    <span
      v-else-if="node.type === 'color'"
      :style="{
        color: HEX_PATTERN.test(node.value)
          ? node.value
          : (textColors.find((c) => c.name === node.value)?.hex ?? '#FFFFFF'),
      }">
      <ContentNodeRenderer
        :nodes="node.children"
        :variables="variables"
        :computed-properties="computedProperties" />
    </span>
  </template>
</template>

<style>
/* Unscoped: this renderer is recursive and reused across preview contexts. */
.dialogue-variable-chip {
  display: inline-block;
  padding: 0 0.375rem;
  margin: 0 1px;
  color: var(--ui-primary);
  font-weight: 600;
  font-size: 0.9em;
}
</style>

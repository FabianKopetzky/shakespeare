<script setup lang="ts">
import type { NodeTypeDefinition } from "../../composables/nodeRegistry";
import Help from "../widget/Help.vue";

interface Props {
  nodes: NodeTypeDefinition<any>[];
  storyName: string;
  nodeCount: number;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "addNode", type: any): void;
}>();
</script>

<template>
  <div
    class="absolute z-10 bottom-4 right-4 left-4 h-14 bg-default border border-accented flex flex-row justify-between items-center px-2">
    <div class="flex flex-row items-center justify-start h-full gap-2">
      <div class="flex flex-col items-start justify-start w-fit gap-0">
        <span class="text-primary font-semibold w-full truncate">{{
          props.storyName
        }}</span>
        <span class="text-dimmed text-sm"
          >{{ props.nodeCount }}
          {{ props.nodeCount === 1 ? "node" : "nodes" }}</span
        >
      </div>
      <div class="h-[70%] ml-8 mr-2 bg-accented w-px" />
      <UTooltip
        v-for="node in props.nodes"
        :text="`Insert ${node.label} node`"
        :content="{ side: 'top', sideOffset: 12, collisionPadding: 8 }">
        <UButton
          @click="emit('addNode', node.type)"
          square
          color="neutral"
          variant="ghost"
          :icon="node.icon"
          class="h-auto w-8 aspect-square flex items-center justify-center" />
      </UTooltip>
    </div>
    <Help title="Story Graph" message-html="<p>Test</p>" />
  </div>
</template>

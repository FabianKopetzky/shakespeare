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
    <Help
      title="Story Graph"
      message-html="<p>The story graph is used to draft and create interactive stories.<br><br><span class='text-primary font-semibold'>Nodes</span><br>Create nodes using the toolbar or right click in the editor. Configure the node to your liking by clicking on it (play a dialogue, execute logic...). Drag connections from the output pins to the desired next node. Right click a node to set it as the graph's starting point or to delete it.<br><br><span class='font-semibold text-primary'>Connections</span><br>A connection is a line from a node output to a node input. Simply drag from a pin to create a connection. To delete a connection, click on it to select it and press the <span class=text-toned>delete</span> key on your keyboard, or delete the node the connection leads to.</p>" />
  </div>
</template>

<template>
  <div class="story-editor relative rounded-3xl overflow-hidden">
    <!-- <div
      v-if="story"
      class="absolute top-4 left-4 p-4 z-20 bg-muted rounded-2xl">
      <h3>{{ story.id }}</h3>
      <span>{{ story.description }}</span>
    </div> -->
    <VueFlow
      :nodes="flowNodes"
      :edges="flowEdges"
      :node-types="nodeTypes"
      :apply-default="false"
      :delete-key-code="['Backspace', 'Delete']"
      :node-drag-threshold="4"
      :min-zoom="0.15"
      :max-zoom="2"
      fit-view-on-init
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      @node-click="onNodeClick"
      @node-drag-stop="onNodeDragStop"
      @pane-context-menu="onPaneContextMenu"
      @node-context-menu="onNodeContextMenu"
      @edge-context-menu="onEdgeContextMenu"
      @pane-click="closeMenu"
      @move-start="closeMenu">
      <Background variant="lines" :gap="50" pattern-color="#FFFFFF15" />
      <Controls />
    </VueFlow>

    <ContextMenu
      v-if="menu"
      :x="menu.x"
      :y="menu.y"
      :items="menuItems"
      @select="onMenuSelect" />
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, provide, ref } from "vue";
import {
  VueFlow,
  useVueFlow,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type NodeMouseEvent,
  type NodeDragEvent,
  type EdgeMouseEvent,
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";

import ContextMenu, { type ContextMenuItem } from "./ContextMenu.vue";
import BaseNodeCard from "./nodes/BaseNodeCard.vue";
import { useStoryGraph } from "../../composables/storyGraph.ts";
import { ENTRY_NODE_ID_KEY } from "../../composables/storyEditorKeys";
import { useWidget } from "../../composables/widget.ts"; // adjust path to match your project
import type { AnyStoryNode, Story } from "../../types/schema";

const props = defineProps<{ story: Story }>();
const emit = defineEmits<{
  "open-node": [node: AnyStoryNode];
}>();

const { displayError } = useWidget();

const graph = useStoryGraph(() => props.story);
const { applyNodeChanges, applyEdgeChanges, screenToFlowCoordinate } =
  useVueFlow();

const { flowNodes, flowEdges, availableNodeTypes } = graph;

// every registered node type renders through the same generic card -
// adding a new node type never requires touching this map.
// markRaw is required here: vue-flow stores nodeTypes in its own reactive
// store, and without markRaw, Vue will deep-wrap the component definition
// object itself in a reactive proxy (harmless but wasteful, and Vue warns
// about it).
const rawBaseNodeCard = markRaw(BaseNodeCard);
const nodeTypes = Object.fromEntries(
  availableNodeTypes.map((def) => [def.type, rawBaseNodeCard]),
);

provide(
  ENTRY_NODE_ID_KEY,
  computed(() => props.story?.entryNodeId ?? null),
);

// --- node / edge interaction -------------------------------------------

function onNodesChange(changes: NodeChange[]) {
  const passthrough: NodeChange[] = [];
  for (const change of changes) {
    if (change.type === "remove") {
      graph.deleteNode(change.id);
    } else {
      passthrough.push(change);
    }
  }
  if (passthrough.length) applyNodeChanges(passthrough);
}

function onEdgesChange(changes: EdgeChange[]) {
  const passthrough: EdgeChange[] = [];
  for (const change of changes) {
    if (change.type === "remove") {
      if (change.sourceHandle) {
        graph.disconnect(change.source, change.sourceHandle);
      }
    } else {
      passthrough.push(change);
    }
  }
  if (passthrough.length) applyEdgeChanges(passthrough);
}

function onConnect(connection: Connection) {
  if (!connection.sourceHandle) {
    displayError("This node has no matching output pin for that connection.");
    return;
  }
  // dragging a new wire from a pin that already has one simply overwrites
  // the old target - there is only ever one live edge per output pin,
  // since the pin *is* a targetId field under the hood.
  graph.connect(connection.source, connection.sourceHandle, connection.target);
}

// node-drag-threshold (above) already stops vue-flow from firing node-click
// after a real drag in most cases, but it's a pixel-distance heuristic and
// can still misfire depending on input device / trackpad jitter. Belt and
// suspenders: explicitly remember which node just finished a drag and skip
// the very next click for it.
const justDraggedNodeId = ref<string | null>(null);

function onNodeClick({ node }: NodeMouseEvent) {
  if (justDraggedNodeId.value === node.id) return;
  const domainNode = graph.nodesById.value[node.id];
  if (domainNode) emit("open-node", domainNode);
}

function onNodeDragStop({ node }: NodeDragEvent) {
  graph.updateNodePosition(node.id, { x: node.position.x, y: node.position.y });
  justDraggedNodeId.value = node.id;
  // node-click (if the browser fires one for this gesture at all) always
  // arrives right after drag-stop, in the same tick - clear the guard on
  // the next tick so it doesn't block a later, genuine click.
  requestAnimationFrame(() => {
    if (justDraggedNodeId.value === node.id) justDraggedNodeId.value = null;
  });
}

// --- context menus -------------------------------------------------------

type MenuState =
  | { kind: "pane"; x: number; y: number; flowX: number; flowY: number }
  | { kind: "node"; x: number; y: number; nodeId: string }
  | {
      kind: "edge";
      x: number;
      y: number;
      source: string;
      sourceHandle: string;
    };

const menu = ref<MenuState | null>(null);

function closeMenu() {
  menu.value = null;
}

const menuItems = computed<ContextMenuItem[]>(() => {
  if (!menu.value) return [];

  if (menu.value.kind === "pane") {
    return availableNodeTypes.map((def) => ({
      key: `add:${def.type}`,
      label: `Create ${def.label} node`,
    }));
  }

  if (menu.value.kind === "node") {
    const isEntry = props.story?.entryNodeId === menu.value.nodeId;
    return [
      { key: "set-entry", label: "Set as entry point", disabled: isEntry },
      { key: "delete-node", label: "Delete node", danger: true },
    ];
  }

  return [{ key: "delete-edge", label: "Delete connection", danger: true }];
});

function onPaneContextMenu(event: MouseEvent) {
  event.preventDefault();
  const { x, y } = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  });
  menu.value = {
    kind: "pane",
    x: event.clientX,
    y: event.clientY,
    flowX: x,
    flowY: y,
  };
}

function onNodeContextMenu({ event, node }: NodeMouseEvent) {
  event.preventDefault();
  menu.value = {
    kind: "node",
    x: (event as MouseEvent).clientX,
    y: (event as MouseEvent).clientY,
    nodeId: node.id,
  };
}

function onEdgeContextMenu({ event, edge }: EdgeMouseEvent) {
  event.preventDefault();
  if (!edge.sourceHandle) return;
  menu.value = {
    kind: "edge",
    x: (event as MouseEvent).clientX,
    y: (event as MouseEvent).clientY,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
  };
}

function onMenuSelect(key: string) {
  const current = menu.value;
  closeMenu();
  if (!current) return;

  if (current.kind === "pane" && key.startsWith("add:")) {
    const type = key.slice("add:".length);
    try {
      graph.addNode(type, { x: current.flowX, y: current.flowY });
    } catch (err) {
      displayError(`Could not create node: ${(err as Error).message}`);
    }
    return;
  }

  if (current.kind === "node") {
    if (key === "delete-node") graph.deleteNode(current.nodeId);
    if (key === "set-entry") graph.setEntryNode(current.nodeId);
    return;
  }

  if (current.kind === "edge" && key === "delete-edge") {
    graph.disconnect(current.source, current.sourceHandle);
  }
}
</script>

<style scoped>
.story-editor {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: #0b1221;
}
</style>

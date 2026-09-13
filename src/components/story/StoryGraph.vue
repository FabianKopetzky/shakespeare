<template>
  <UContextMenu :items="paneMenuItems">
    <div
      class="story-editor relative rounded-none border border-accented overflow-hidden"
      @contextmenu="rememberPanePos">
      <VueFlow
        :nodes="flowNodes"
        :edges="flowEdges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :apply-default="false"
        :delete-key-code="['Backspace', 'Delete']"
        :connection-line-type="ConnectionLineType.Step"
        :connection-line-style="{
          stroke: 'var(--ui-text-muted)',
          strokeWidth: 2.5,
        }"
        :node-drag-threshold="4"
        :min-zoom="0.15"
        :max-zoom="2"
        fit-view-on-init
        @nodes-change="onNodesChange"
        @edges-change="onEdgesChange"
        @connect="onConnect"
        @node-click="onNodeClick"
        @node-drag-stop="onNodeDragStop">
        <Background
          :variant="
            settings.storyGraphPattern !== 'none'
              ? (settings.storyGraphPattern as BackgroundVariantType)
              : 'lines'
          "
          :bg-color="
            settings.storyGraphPattern === 'none' ? 'var(--ui-bg-muted)' : ''
          "
          :gap="settings.storyGraphPatternGap"
          :size="settings.storyGraphPatternSize"
          pattern-color="var(--ui-bg-elevated)" />
        <Controls />
      </VueFlow>
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import { computed, markRaw, provide, ref, nextTick } from "vue";
import {
  VueFlow,
  useVueFlow,
  type Connection,
  type NodeChange,
  type EdgeChange,
  ConnectionLineType,
  type NodeMouseEvent,
  type NodeDragEvent,
} from "@vue-flow/core";
import { Background, type BackgroundVariantType } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import type { ContextMenuItem } from "@nuxt/ui";
import StoryEdge from "./StoryEdge.vue";
import BaseNodeCard from "./nodes/BaseNodeCard.vue";
import { useStoryGraph } from "../../composables/storyGraph.ts";
import {
  ENTRY_NODE_ID_KEY,
  STORY_EDITOR_ACTIONS_KEY,
} from "../../composables/storyEditorKeys";
import { useWidget } from "../../composables/widget.ts"; // adjust path to match your project
import type { AnyStoryNode, Story } from "../../types/schema";
import { storeToRefs } from "pinia";
import { useContentStore } from "../../stores/content.ts";

const props = defineProps<{ story: Story }>();
const emit = defineEmits<{
  // fired on node click - the actual dialogue / branch editor UI is not
  // built yet, this is just the hook point for it.
  "open-node": [node: AnyStoryNode];
}>();

const { displayError } = useWidget();
const { settings } = storeToRefs(useContentStore());

const graph = useStoryGraph(() => props.story);
const {
  applyNodeChanges,
  applyEdgeChanges,
  screenToFlowCoordinate,
  updateNodeInternals,
} = useVueFlow();

const { flowNodes, flowEdges, availableNodeTypes } = graph;
function updateNodeContent(id: string, content: Partial<AnyStoryNode>) {
  graph.updateNodeContent(id, content);
  nextTick(() => {
    updateNodeInternals([id]);
  });
}

defineExpose({ updateNodeContent });

// every registered node type renders through the same generic card -
// adding a new node type never requires touching this map.
// markRaw is required here: vue-flow stores nodeTypes/edgeTypes in its own
// reactive store, and without markRaw, Vue will deep-wrap the component
// definition object itself in a reactive proxy (harmless but wasteful, and
// Vue warns about it).
const rawBaseNodeCard = markRaw(BaseNodeCard);
const nodeTypes = Object.fromEntries(
  availableNodeTypes.map((def) => [def.type, rawBaseNodeCard]),
);
const edgeTypes = { default: markRaw(StoryEdge) };

provide(
  ENTRY_NODE_ID_KEY,
  computed(() => props.story?.entryNodeId ?? null),
);

// the node card's and edge's own nested context menus call these directly,
// since they render deep inside <VueFlow> and don't have their own access
// to `graph`.
provide(STORY_EDITOR_ACTIONS_KEY, {
  deleteNode: graph.deleteNode,
  setEntryNode: graph.setEntryNode,
  disconnect: graph.disconnect,
});

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

// --- pane context menu ("create node") -----------------------------------
//
// Nodes and edges each carry their own nested UContextMenu now (see
// BaseNodeCard.vue / StoryEdge.vue) - right-clicking one of them opens that
// menu and the event never reaches this outer one, since their trigger
// already marked it as handled. Right-clicking empty canvas falls through
// to here.

// UContextMenu positions its popup from the real contextmenu event on its
// trigger, so we don't control that - but we DO need the click position
// ourselves, to know where in the story to drop a newly created node. This
// listener runs alongside (not instead of) the menu's own trigger.
const lastPanePos = ref({ x: 0, y: 0 });
function rememberPanePos(event: MouseEvent) {
  lastPanePos.value = { x: event.clientX, y: event.clientY };
}

const paneMenuItems = computed<ContextMenuItem[]>(() =>
  availableNodeTypes.map((def) => ({
    label: `Create ${def.label} node`,
    icon: "i-lucide-plus",
    onSelect: () => {
      const { x, y } = screenToFlowCoordinate(lastPanePos.value);
      try {
        graph.addNode(def.type, { x, y });
      } catch (err) {
        displayError(`Could not create node: ${(err as Error).message}`);
      }
    },
  })),
);
</script>

<style scoped>
.story-editor {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: var(--ui-bg-muted);
}
</style>

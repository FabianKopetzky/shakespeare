<template>
  <UContextMenu :items="paneMenuItems">
    <div
      ref="editorRootEl"
      class="story-editor relative rounded-none border border-accented overflow-hidden isolate"
      @contextmenu="rememberPanePos">
      <h1
        class="absolute top-0 right-2 text-muted opacity-15 text-8xl uppercase max-w-200 truncate">
        {{ story?.id }}
      </h1>
      <UButton
        @click="router.push('/stories')"
        square
        class="absolute top-4 left-4 h-auto aspect-square z-10"
        color="neutral"
        variant="outline"
        icon="material-symbols:arrow-back" />
      <StoryToolBar
        @add-node="(type: any) => addNodeFromToolbar(type)"
        :nodes="availableNodeTypes"
        :story-name="story?.id"
        :node-count="story?.nodes.length ?? 0" />
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
        @connect-start="onConnectStart"
        @connect-end="onConnectEnd"
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
  type OnConnectStartParams,
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
import { useWidget } from "../../composables/widget.ts";
import type { AnyStoryNode, Story } from "../../types/schema";
import { storeToRefs } from "pinia";
import { useContentStore } from "../../stores/content.ts";
import { useRouter } from "vue-router";

const props = defineProps<{ story: Story }>();
const emit = defineEmits<{
  "open-node": [node: AnyStoryNode];
}>();

const { displayError } = useWidget();
const { settings } = storeToRefs(useContentStore());

const router = useRouter();

const graph = useStoryGraph(() => props.story);
const {
  applyNodeChanges,
  applyEdgeChanges,
  screenToFlowCoordinate,
  updateNodeInternals,
  getNodes,
  findNode,
  addSelectedNodes,
  removeSelectedNodes,
  fitView,
} = useVueFlow();

const { flowNodes, flowEdges, availableNodeTypes } = graph;
function updateNodeContent(id: string, content: Partial<AnyStoryNode>) {
  graph.updateNodeContent(id, content);
  nextTick(() => {
    updateNodeInternals([id]);
  });
}

defineExpose({ updateNodeContent });

const rawBaseNodeCard = markRaw(BaseNodeCard);
const nodeTypes = Object.fromEntries(
  availableNodeTypes.map((def) => [def.type, rawBaseNodeCard]),
);
const edgeTypes = { default: markRaw(StoryEdge) };

provide(
  ENTRY_NODE_ID_KEY,
  computed(() => props.story?.entryNodeId ?? null),
);

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

  graph.connect(connection.source, connection.sourceHandle, connection.target);
}

const justDraggedNodeId = ref<string | null>(null);

function onNodeClick({ node }: NodeMouseEvent) {
  if (justDraggedNodeId.value === node.id) return;
  const domainNode = graph.nodesById.value[node.id];
  if (domainNode) emit("open-node", domainNode);
}

function onNodeDragStop({ node }: NodeDragEvent) {
  graph.updateNodePosition(node.id, { x: node.position.x, y: node.position.y });
  justDraggedNodeId.value = node.id;

  requestAnimationFrame(() => {
    if (justDraggedNodeId.value === node.id) justDraggedNodeId.value = null;
  });
}

const NEW_NODE_PADDING = 60;
const DEFAULT_NODE_HEIGHT = 160;

function computeNextNodePosition(): { x: number; y: number } {
  const nodes = getNodes.value;
  if (!nodes.length) return { x: 0, y: 0 };

  let maxBottom = -Infinity;
  let leftMostX = Infinity;

  for (const node of nodes) {
    const height = node.dimensions?.height || DEFAULT_NODE_HEIGHT;
    const bottom = node.position.y + height;
    if (bottom > maxBottom) maxBottom = bottom;
    if (node.position.x < leftMostX) leftMostX = node.position.x;
  }

  return {
    x: leftMostX === Infinity ? 0 : leftMostX,
    y: maxBottom + NEW_NODE_PADDING,
  };
}

async function focusNode(id: string) {
  await nextTick();
  const node = findNode?.(id);
  if (!node) return;

  try {
    removeSelectedNodes?.(getNodes.value);
    addSelectedNodes?.([node]);
    fitView?.({ nodes: [id], duration: 400, padding: 0.4, maxZoom: 1 });
  } catch (err) {
    console.warn("Could not focus new node", err);
  }
}

function addNodeFromToolbar(type: any): void {
  const { x, y } = computeNextNodePosition();
  const newNode = graph.addNode(type, { x, y });
  if (newNode) focusNode(newNode.id);
}

const editorRootEl = ref<HTMLElement | null>(null);
const lastPanePos = ref({ x: 0, y: 0 });

function rememberPanePos(event: MouseEvent) {
  lastPanePos.value = { x: event.clientX, y: event.clientY };

  if (event.isTrusted) {
    pendingConnectionSource.value = null;
  }
}

function openPaneMenuAt(clientX: number, clientY: number) {
  const el = editorRootEl.value;
  if (!el) return;
  el.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX,
      clientY,
    }),
  );
}

const connectionDragSource = ref<{
  nodeId: string;
  handleId: string | null;
} | null>(null);
const pendingConnectionSource = ref<{
  nodeId: string;
  handleId: string | null;
} | null>(null);

function onConnectStart({
  nodeId,
  handleId,
}: { event?: MouseEvent } & OnConnectStartParams) {
  connectionDragSource.value = nodeId
    ? { nodeId, handleId: handleId ?? null }
    : null;
}

function onConnectEnd(event?: MouseEvent | TouchEvent) {
  const source = connectionDragSource.value;
  connectionDragSource.value = null;
  if (!source || !event) return;

  const target = event.target as HTMLElement | null;
  const droppedOnPane = !!target?.classList?.contains("vue-flow__pane");
  if (!droppedOnPane) return;

  const point = "changedTouches" in event ? event.changedTouches[0] : event;
  if (!point) return;

  pendingConnectionSource.value = source;
  openPaneMenuAt(point.clientX, point.clientY);
}

const paneMenuItems = computed<ContextMenuItem[]>(() =>
  availableNodeTypes.map((def) => ({
    label: `Create ${def.label} node`,
    icon: def.icon,
    onSelect: () => {
      const { x, y } = screenToFlowCoordinate(lastPanePos.value);
      const source = pendingConnectionSource.value;
      pendingConnectionSource.value = null;

      try {
        const newNode = graph.addNode(def.type, { x, y });
        if (newNode && source?.handleId) {
          graph.connect(source.nodeId, source.handleId, newNode.id);
        }
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

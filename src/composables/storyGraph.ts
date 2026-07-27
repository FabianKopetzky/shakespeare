import { computed, ref, watch } from "vue";
import type { Node as VFNode, Edge as FlowEdge } from "@vue-flow/core";
import { useContentStore } from "../stores/content";
import { useNodeRegistry } from "./nodeRegistry";
import type { AnyStoryNode, Story } from "../types/schema";

// @nuxt/ui pulls in `motion-v`, which globally augments Vue's HTMLAttributes
// with its own animation props (dragControls, animate, ...). vue-flow's own
// Node.domAttributes field is typed as `Omit<HTMLAttributes, ...>`, so once
// both packages are in the same project, TS sees two incompatible shapes
// for that one field - even though we never set domAttributes ourselves.
// Re-typing it as `any` here is a type-only patch; it changes nothing about
// how vue-flow actually renders. If you don't use @nuxt/ui (or ever remove
// it), you can drop this and import Node directly from '@vue-flow/core'.
type FlowNode<T> = Omit<VFNode<T>, "domAttributes"> & { domAttributes?: any };

export type StoryNodeCardData = {
  node: AnyStoryNode;
  title: string;
  typeLabel: string;
  color: string;
  outputs: { id: string; label?: string }[];
};

/**
 * `getStory` is a getter rather than a plain Story so this composable works
 * whether the caller holds the story in a ref, a computed, or a reactive
 * prop - it just needs to always return the *current* story.
 *
 * IMPORTANT ASSUMPTION: this expects the content store to expose a flat
 * `storyNodes: Record<string, AnyStoryNode>` map holding every node object
 * for every story, keyed by id. `Story.nodes` stays as-is (just the ordered
 * list of ids that belong to this story). See the README for the small
 * addition this requires in stores/content.ts.
 */
export function useStoryGraph(getStory: () => Story) {
  const contentStore = useContentStore();
  const { get: getNodeType, all: allNodeTypes } = useNodeRegistry();

  const nodes = computed<AnyStoryNode[]>(() => {
    const story = getStory();
    if (!story) return [];
    return story.nodes
      .map((id) => contentStore.storyNodes[id])
      .filter((n): n is AnyStoryNode => !!n);
  });

  const nodesById = computed<Record<string, AnyStoryNode>>(() => {
    const map: Record<string, AnyStoryNode> = {};
    for (const n of nodes.value) map[n.id] = n;
    return map;
  });

  function buildFlowNodes(): FlowNode<StoryNodeCardData>[] {
    return nodes.value.map((node) => {
      const def = getNodeType(node.type);
      return {
        id: node.id,
        type: node.type,
        position: { ...node.position },
        data: {
          node,
          title: def.getTitle(node),
          typeLabel: def.label,
          color: def.color,
          outputs: def.getOutputs(node),
        },
      };
    });
  }

  // A real ref, not a computed: vue-flow is bound to this in "controlled"
  // mode and needs a stable array to render from / apply position changes
  // to while dragging. We only rebuild it wholesale when the *set* of node
  // ids changes (add/delete) - see StoryEditor.vue for how live position
  // updates during drag are handled without fighting this resync.
  const flowNodes = ref<FlowNode<StoryNodeCardData>[]>(buildFlowNodes());
  watch(
    () => nodes.value.map((n) => n.id).join("|"),
    () => {
      flowNodes.value = buildFlowNodes();
    },
  );

  // Edges are never stored anywhere - they are always exactly what the
  // domain data says right now. No sync issues possible, so this can stay
  // a plain computed.
  const flowEdges = computed<FlowEdge[]>(() => {
    const edges: FlowEdge[] = [];
    for (const node of nodes.value) {
      const def = getNodeType(node.type);
      for (const pin of def.getOutputs(node)) {
        const targetId = def.getTargetId(node, pin.id);
        if (targetId && nodesById.value[targetId]) {
          edges.push({
            id: `${node.id}__${pin.id}__${targetId}`,
            source: node.id,
            sourceHandle: pin.id,
            target: targetId,
          });
        }
      }
    }
    return edges;
  });

  function addNode(type: string, position: { x: number; y: number }) {
    const story = getStory();
    if (!story) return null;
    const def = getNodeType(type);
    const id = crypto.randomUUID();
    const node = def.createDefault(id, position);
    contentStore.storyNodes[id] = node;
    story.nodes.push(id);
    if (!story.entryNodeId) story.entryNodeId = id; // first node in an empty story becomes the entry by default
    return node;
  }

  function updateNodePosition(id: string, position: { x: number; y: number }) {
    const node = contentStore.storyNodes[id];
    if (node) node.position = position;
  }

  function connect(sourceId: string, sourceHandle: string, targetId: string) {
    const source = contentStore.storyNodes[sourceId];
    if (!source) return;
    getNodeType(source.type).setTargetId(source, sourceHandle, targetId);
  }

  function disconnect(sourceId: string, sourceHandle: string) {
    const source = contentStore.storyNodes[sourceId];
    if (!source) return;
    getNodeType(source.type).setTargetId(source, sourceHandle, null);
  }

  function deleteNode(id: string) {
    const story = getStory();
    if (!story) return;
    // clear any other node/branch that pointed at this one, so we never
    // leave a dangling targetId behind
    for (const other of nodes.value) {
      const def = getNodeType(other.type);
      for (const pin of def.getOutputs(other)) {
        if (def.getTargetId(other, pin.id) === id) {
          def.setTargetId(other, pin.id, null);
        }
      }
    }
    story.nodes = story.nodes.filter((n) => n !== id);
    delete contentStore.storyNodes[id];
    if (story.entryNodeId === id) story.entryNodeId = null;
  }

  function setEntryNode(id: string) {
    const story = getStory();
    if (!story) return;
    story.entryNodeId = id;
  }

  return {
    nodes,
    nodesById,
    flowNodes,
    flowEdges,
    availableNodeTypes: allNodeTypes(),
    addNode,
    updateNodePosition,
    connect,
    disconnect,
    deleteNode,
    setEntryNode,
  };
}
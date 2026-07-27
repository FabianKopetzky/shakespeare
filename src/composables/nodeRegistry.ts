import type { AnyStoryNode, StoryNode, BranchNode } from "../types/schema";

export type OutputPin = {
  id: string; // unique per node, used as the vue-flow source handle id
  label?: string; // shown next to the pin, e.g. a branch's label
};

/**
 * Everything the editor needs to know about a node type, without knowing
 * anything about *how* it's rendered. All node types share the same visual
 * shell (BaseNodeCard) - to add a new node type later:
 *   1. add its shape to `AnyStoryNode` in types/schema.ts
 *   2. write one `registerNodeType(...)` call below
 * Nothing else in the editor (canvas, drag, connect, delete, context menu)
 * needs to change.
 */
export interface NodeTypeDefinition<T extends AnyStoryNode = AnyStoryNode> {
  type: T["type"];
  label: string; // type badge text, e.g. "Story", "Branch"
  color: string; // header accent color for this node type
  createDefault: (id: string, position: { x: number; y: number }) => T;
  getTitle: (node: T) => string;
  // one output pin per possible outgoing connection. StoryNode has exactly
  // one; BranchNode has one per branch. A node type with no outputs (e.g. a
  // future "End" node) can just return [].
  getOutputs: (node: T) => OutputPin[];
  getTargetId: (node: T, handleId: string) => string | null;
  setTargetId: (node: T, handleId: string, targetId: string | null) => void;
}

const registry = new Map<string, NodeTypeDefinition<any>>();

export function registerNodeType<T extends AnyStoryNode>(
  definition: NodeTypeDefinition<T>,
) {
  registry.set(definition.type, definition as NodeTypeDefinition<any>);
}

export function useNodeRegistry() {
  function get(type: string): NodeTypeDefinition<any> {
    const def = registry.get(type);
    if (!def) throw new Error(`Unknown story node type "${type}"`);
    return def;
  }

  return {
    get,
    has: (type: string) => registry.has(type),
    all: () => Array.from(registry.values()),
  };
}

registerNodeType<StoryNode>({
  type: "story",
  label: "Story",
  color: "#4c7ef3",
  createDefault: (id, position) => ({
    id,
    type: "story",
    position,
    dialogueId: "",
    targetId: null,
  }),
  getTitle: (node) => node.dialogueId ? `Plays dialogue '${node.dialogueId}'` : "No dialogue selected",
  getOutputs: () => [{ id: "out", label: 'On Finish' }],
  getTargetId: (node) => node.targetId,
  setTargetId: (node, _handleId, targetId) => {
    node.targetId = targetId;
  },
});

registerNodeType<BranchNode>({
  type: "branch",
  label: "Branch",
  color: "#f2a341",
  createDefault: (id, position) => ({
    id,
    type: "branch",
    position,
    branches: [],
  }),
  getTitle: (node) =>
    node.branches.length === 1
      ? "1 choice"
      : `${node.branches.length} choices`,
  getOutputs: (node) =>
    node.branches.map((branch) => ({
      id: branch.id,
      label: branch.labels?.en || "(no label)",
    })),
  getTargetId: (node, handleId) =>
    node.branches.find((b) => b.id === handleId)?.targetId ?? null,
  setTargetId: (node, handleId, targetId) => {
    const branch = node.branches.find((b) => b.id === handleId);
    if (branch) branch.targetId = targetId;
  },
});
import type { AnyStoryNode, StoryNode, BranchNode, ConditionNode, RandomNode, OperationNode, EventNode } from "../types/schema";
import { useConditionUtils } from "../utils/conditionUtils";

const { conditionToString, operationToString, eventInvokationToString } = useConditionUtils();

export type OutputPin = {
  id: string; // unique per node, used as the vue-flow source handle id
  label?: string; // shown next to the pin, e.g. a branch's label
};
export interface NodeTypeDefinition<T extends AnyStoryNode = AnyStoryNode> {
  type: T["type"];
  label: string;
  color: string;
  icon: string;
  createDefault: (id: string, position: { x: number; y: number }) => T;
  getTitle: (node: T) => string;
  
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
  label: "Dialogue",
  color: "#61A8CC",
  icon: 'material-symbols:forum-sharp',
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
  color: "#E0975C",
  icon: 'material-symbols:arrow-split',
  createDefault: (id, position) => ({
    id,
    type: "branch",
    position,
    branches: []
  }),
  getTitle: (node) =>
    node.branches.length === 1
      ? "1 choice"
      : `${node.branches.length} choices`,
  getOutputs: (node) =>
    node.branches.map((branch, index) => ({
      id: branch.id,
      label: `Branch ${index + 1}${branch.condition ? ' (?)' : ''}`,
    } as OutputPin)),
  getTargetId: (node, handleId) =>
    node.branches.find((b) => b.id === handleId)?.targetId ?? null,
  setTargetId: (node, handleId, targetId) => {
    const branch = node.branches.find((b) => b.id === handleId);
    if (branch) branch.targetId = targetId;
  },
});

registerNodeType<ConditionNode>({
  type: "condition",
  label: "Condition",
  color: "#61CC61",
  icon: 'material-symbols:help-center-sharp',
  createDefault: (id, position) => ({
    id,
    type: "condition",
    position,
    condition: null,
    targetIdTrue: null,
    targetIdFalse: null
  }),
  getTitle: (node) => node.condition ? conditionToString(node.condition) :'No condition assigned',
  getOutputs: () => [{ id: "true", label: "On True" }, { id: "false", label: "On False" }],
  getTargetId: (node, handleId) => handleId === 'true' ? node.targetIdTrue : node.targetIdFalse,
  setTargetId: (node, handleId, targetId) => {
    if(handleId === 'true') node.targetIdTrue = targetId;
    else node.targetIdFalse = targetId;
  },
});


registerNodeType<RandomNode>({
  type: "random",
  label: "Random",
  color: "#A161CC",
  icon: 'famicons:dice-sharp',
  createDefault: (id, position) => ({
    id,
    type: "random",
    position,
    branches: [
      {
        id: crypto.randomUUID(),
        targetId: null,
        weight: 1
      }
    ]
  }),
  getTitle: (node) => node.branches.length > 0 ? `Selects one of ${node.branches.length} branches at random` : 'No random branches assigned',
  getOutputs: (node) => {
      const total = (node.branches ?? []).reduce((sum, b) => sum + (b.weight || 0), 0);
      return node.branches.map((branch) => ({
        id: branch.id,
        label: `${total <= 0 ? 0 : ((branch.weight / total) * 100).toFixed(1)}%`,
      } as OutputPin)) },
    getTargetId: (node, handleId) =>
      node.branches.find((b) => b.id === handleId)?.targetId ?? null,
    setTargetId: (node, handleId, targetId) => {
      const branch = node.branches.find((b) => b.id === handleId);
      if (branch) branch.targetId = targetId;
    },
});

registerNodeType<OperationNode>({
  type: "operation",
  label: "Operation",
  color: "#CC6161",
  icon: 'material-symbols:settings-sharp',
  createDefault: (id, position) => ({
    id,
    type: "operation",
    position,
    operation: null,
    targetId: null,
  }),
  getTitle: (node) => node.operation ? operationToString(node.operation) : 'No operation set',
  getOutputs: () => [{ id: "out", label: 'On Finish' }],
  getTargetId: (node) => node.targetId,
  setTargetId: (node, _handleId, targetId) => {
    node.targetId = targetId;
  },
});

registerNodeType<EventNode>({
  type: "event",
  label: "Event",
  color: "#E2D16C",
  icon: 'ic:sharp-electric-bolt',
  createDefault: (id, position) => ({
    id,
    type: "event",
    position,
    targetId: null,
    event: null,
    args: []
  }),
  getTitle: (node) => node.event ? eventInvokationToString(node.event, node.args) : 'No event invokation assigned',
  getOutputs: () => [{ id: "out", label: 'On Finish' }],
  getTargetId: (node) => node.targetId,
  setTargetId: (node, _handleId, targetId) => {
    node.targetId = targetId;
  },
});
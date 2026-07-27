import type { ComputedRef, InjectionKey } from "vue";

// Provided by StoryEditor.vue, injected by BaseNodeCard.vue.
// Kept as its own reactive source (rather than baked into each flow node's
// `data`) so that marking a different node as the entry point updates every
// node's badge immediately, without needing to rebuild the whole node list.
export const ENTRY_NODE_ID_KEY: InjectionKey<ComputedRef<string | null>> =
  Symbol("story-editor-entry-node-id");

// The subset of useStoryGraph's mutations that nested components (the node
// card's own context menu, an edge's own context menu) need to call
// directly, since they render deep inside <VueFlow> and don't have their
// own access to the graph composable.
export interface StoryEditorActions {
  deleteNode: (id: string) => void;
  setEntryNode: (id: string) => void;
  disconnect: (sourceId: string, sourceHandle: string) => void;
}

export const STORY_EDITOR_ACTIONS_KEY: InjectionKey<StoryEditorActions> =
  Symbol("story-editor-actions");
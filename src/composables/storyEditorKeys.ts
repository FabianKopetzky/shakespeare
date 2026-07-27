import type { ComputedRef, InjectionKey } from "vue";

// Provided by StoryEditor.vue, injected by BaseNodeCard.vue.
// Kept as its own reactive source (rather than baked into each flow node's
// `data`) so that marking a different node as the entry point updates every
// node's badge immediately, without needing to rebuild the whole node list.
export const ENTRY_NODE_ID_KEY: InjectionKey<ComputedRef<string | null>> = Symbol("story-editor-entry-node-id");
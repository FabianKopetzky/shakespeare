<template>
  <UContextMenu :items="menuItems">
    <div
      class="story-node"
      :style="{ '--accent': data.color }"
      :class="{ 'story-node--entry': isEntry }">
      <Handle
        type="target"
        :position="Position.Top"
        class="story-node__pin story-node__pin--in" />

      <div class="story-node__header" :style="{ '--accent': data.color }">
        <span class="story-node__type">{{ data.typeLabel }}</span>
        <UIcon
          v-if="isEntry"
          name="material-symbols:flag-sharp"
          class="story-node__entry-badge size-5" />
      </div>

      <div class="story-node__title">{{ data.title }}</div>

      <div v-if="data.outputs.length" class="story-node__outputs">
        <div
          v-for="(pin, index) in data.outputs"
          :key="pin.id"
          class="story-node__output-row">
          <span class="story-node__output-label">{{ pin.label }}</span>

          <Handle
            :id="pin.id"
            type="source"
            :position="Position.Bottom"
            class="story-node__pin story-node__pin--out"
            :style="{
              left: `${((index + 1) / (data.outputs.length + 1)) * 100}%`,
            }" />
        </div>
      </div>
    </div>
  </UContextMenu>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { Handle, Position } from "@vue-flow/core";
import type { ContextMenuItem } from "@nuxt/ui";
import type { StoryNodeCardData } from "../../../composables/storyGraph.ts";
import {
  ENTRY_NODE_ID_KEY,
  STORY_EDITOR_ACTIONS_KEY,
} from "../../../composables/storyEditorKeys";
import adjustLightness from "../../../utils/color-adjustments.ts";

// vue-flow passes many more props (selected, dragging, zIndex, ...) that
// this presentational component doesn't need - inheritAttrs is off so none
// of them accidentally leak onto the root element.
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  id: string;
  data: StoryNodeCardData;
}>();

// Injected rather than passed through `data` so that changing which node is
// the entry point updates instantly, without needing to rebuild every
// node's data object.
const entryNodeId = inject(
  ENTRY_NODE_ID_KEY,
  computed(() => null),
);
const isEntry = computed(() => entryNodeId.value === props.id);

const actions = inject(STORY_EDITOR_ACTIONS_KEY);

// UContextMenu uses `as-child` internally, so wrapping the node's own root
// div here does NOT add an extra wrapper element - it merges the trigger's
// listeners directly onto that div. Right-clicking a node opens this menu;
// right-clicking empty canvas bubbles past it to the pane's own menu in
// StoryEditor.vue, since this trigger already marked the event as handled.
const menuItems = computed<ContextMenuItem[]>(() => [
  {
    label: "Set as entry point",
    icon: "material-symbols:flag-sharp",
    disabled: isEntry.value,
    onSelect: () => actions?.setEntryNode(props.id),
  },
  {
    label: "Delete node",
    icon: "material-symbols:delete-outline-sharp",
    color: "error",
    onSelect: () => actions?.deleteNode(props.id),
  },
]);
</script>

<style scoped>
.story-node {
  min-width: 200px;
  border-radius: 0;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border-muted);
  font-size: 12px;
  position: relative;
}

.story-node--entry {
  border: 1px solid var(--accent);
}

.story-node__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  min-height: 2.25rem;
  background: var(--accent);
  color: #12131a;
  font-weight: 600;
}

.story-node__type {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  font-family: var(--font-sans);
  letter-spacing: 0.06em;
  color: var(--accent);

  @apply brightness-30;
}

.story-node__entry-badge {
  color: var(--accent);

  @apply brightness-40;
}

.story-node__title {
  padding: 9px 10px;
  font-weight: 400;
  font-size: 11px;
  word-break: break-word;
}

.story-node__outputs {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 2px 0 7px;
}

.story-node__output-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 3px 10px;
  min-height: 16px;
}

.story-node__output-label {
  font-size: 10px;
  color: var(--text-color-dimmed);
}

.story-node__pin {
  width: 10px;
  height: 10px;
  border-radius: 0;
  background: var(--ui-bg-accented);
  border: 1px solid var(--ui-border-muted);
}

.story-node__pin--in {
  left: 50%;
  background: var(--accent);
}
</style>

<template>
  <div class="story-node" :class="{ 'story-node--entry': isEntry }">
    <Handle
      type="target"
      :position="Position.Top"
      class="story-node__pin story-node__pin--in" />

    <div class="story-node__header" :style="{ '--accent': data.color }">
      <span class="story-node__type">{{ data.typeLabel }}</span>
      <span v-if="isEntry" class="story-node__entry-badge">Entry</span>
    </div>

    <div class="story-node__title">{{ data.title }}</div>

    <div v-if="data.outputs.length" class="story-node__outputs">
      <div
        v-for="pin in data.outputs"
        :key="pin.id"
        class="story-node__output-row">
        <span class="story-node__output-label">{{ pin.label }}</span>
        <Handle
          :id="pin.id"
          type="source"
          :position="Position.Bottom"
          class="story-node__pin story-node__pin--out" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { Handle, Position } from "@vue-flow/core";
import type { StoryNodeCardData } from "../../../composables/storyGraph";
import { ENTRY_NODE_ID_KEY } from "../../../composables/storyEditorKeys";

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
</script>

<style scoped>
.story-node {
  min-width: 190px;
  border-radius: 8px;
  background: #1e1f24;
  border: 1px solid #34363f;
  color: #e7e7ea;
  font-size: 12px;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.story-node--entry {
  border-color: #5ad46b;
  box-shadow:
    0 0 0 1px #5ad46b,
    0 2px 10px rgba(90, 212, 107, 0.35);
}

.story-node__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--accent, #4c7ef3);
  border-radius: 8px 8px 0 0;
  color: #12131a;
  font-weight: 600;
}

.story-node__type {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.06em;
}

.story-node__entry-badge {
  font-size: 9px;
  font-weight: 700;
  background: #12131a;
  color: #5ad46b;
  padding: 1px 6px;
  border-radius: 4px;
}

.story-node__title {
  padding: 9px 10px;
  font-weight: 500;
  word-break: break-word;
}

.story-node__outputs {
  display: flex;
  flex-direction: column;
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
  font-size: 11px;
  color: #9a9ba3;
}

.story-node__pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7d8291;
  border: 1px solid #12131a;
}

.story-node__pin--in {
  left: 50%;
}
</style>

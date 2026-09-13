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
        <div class="flex flex-row items-center justify-start gap-2">
          <UIcon
            :name="data.icon"
            class="size-4 text-(--accent) brightness-30" />
          <span class="story-node__type">{{ data.typeLabel }}</span>
        </div>
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

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  id: string;
  data: StoryNodeCardData;
}>();

const entryNodeId = inject(
  ENTRY_NODE_ID_KEY,
  computed(() => null),
);
const isEntry = computed(() => entryNodeId.value === props.id);

const actions = inject(STORY_EDITOR_ACTIONS_KEY);

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
  background: var(--ui-text-muted);
  border: 1px solid var(--ui-border-muted);
}

.story-node__pin--in {
  left: 50%;
}
</style>

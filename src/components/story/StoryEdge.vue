<template>
  <BaseEdge :id="id" :path="path" :marker-end="markerEnd" :style="edgeStyle" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@vue-flow/core";

defineOptions({ inheritAttrs: false });

const props = defineProps<EdgeProps>();

const pathData = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 0,
  }),
);

const path = computed(() => pathData.value[0]);

const edgeStyle = computed(() => ({
  stroke: "var(--ui-text-muted)",
  strokeWidth: 2.5,
}));
</script>

<style scoped>
/* .story-edge__handle {
  fill: #8a4141;
  stroke: #aa5656;
  stroke-width: 1.5px;
  cursor: context-menu;
}

.story-edge__handle:hover {
  fill: #b15555;
  stroke: #d67474;
  cursor: pointer;
} */
</style>

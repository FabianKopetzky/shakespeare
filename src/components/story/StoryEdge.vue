<template>
  <BaseEdge :id="id" :path="path" :marker-end="markerEnd" />
  <!-- <circle
    @click="removeEdge"
    :cx="labelX"
    :cy="labelY"
    r="3"
    class="story-edge__handle" /> -->
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { BaseEdge, getBezierPath, type EdgeProps } from "@vue-flow/core";
// import { STORY_EDITOR_ACTIONS_KEY } from "../../composables/storyEditorKeys";

defineOptions({ inheritAttrs: false });

const props = defineProps<EdgeProps>();
// const actions = inject(STORY_EDITOR_ACTIONS_KEY);

// function removeEdge(): void {
//   if (props.sourceHandleId)
//     actions?.disconnect(props.source, props.sourceHandleId);
// }

const pathData = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  }),
);
const path = computed(() => pathData.value[0]);
// const labelX = computed(() => pathData.value[1]);
// const labelY = computed(() => pathData.value[2]);
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

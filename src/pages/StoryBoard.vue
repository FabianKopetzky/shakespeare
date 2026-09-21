<template>
  <template v-if="!story">
    <h1>A story with the id {{ route.params.id }} does not exist!</h1>
  </template>
  <template v-else>
    <StoryGraph ref="storyGraphRef" :story="story" @open-node="onOpenNode" />
  </template>
  <!-- EDITOR OVERLAYS -->
  <StoryNodeEditor
    @onsave="onNodeContentChange"
    :story-node-id="currentStoryNode"
    v-model:is-open="storyNodeEditorOpen" />

  <BranchNodeEditor
    @onsave="onNodeContentChange"
    :branch-node-id="currentBranchNode"
    v-model:is-open="branchNodeEditorOpen" />

  <ConditionNodeEditor
    @onsave="onNodeContentChange"
    :condition-node-id="currentConditionNode"
    v-model:is-open="conditionNodeEditorOpen" />

  <OperationNodeEditor
    @onsave="onNodeContentChange"
    :operation-node-id="currentOperationNode"
    v-model:is-open="operationNodeEditorOpen" />

  <RandomNodeEditor
    @onsave="onNodeContentChange"
    :random-node-id="currentRandomNode"
    v-model:is-open="randomNodeEditorOpen" />

  <EventNodeEditor
    @onsave="onNodeContentChange"
    :event-node-id="currentEventNode"
    v-model:is-open="eventNodeEditorOpen" />
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { AnyStoryNode, Story } from "../types/schema";
import { useContentStore } from "../stores/content";
import StoryGraph from "../components/story/StoryGraph.vue";
import StoryNodeEditor from "../components/story/editor/StoryNodeEditor.vue";
import BranchNodeEditor from "../components/story/editor/BranchNodeEditor.vue";
import ConditionNodeEditor from "../components/story/editor/ConditionNodeEditor.vue";
import OperationNodeEditor from "../components/story/editor/OperationNodeEditor.vue";
import RandomNodeEditor from "../components/story/editor/RandomNodeEditor.vue";
import EventNodeEditor from "../components/story/editor/EventNodeEditor.vue";

const route = useRoute();
const story = ref<Story>(undefined);
const { stories, storyNodes } = useContentStore();

onMounted(() => {
  const id = route.params.id;
  story.value = stories.find((s) => s?.id == id);
});
watch(
  () => route.fullPath,
  () => {
    const id = route.params.id;
    story.value = stories.find((s) => s?.id == id);
  },
);

// current nodes lookup
const currentStoryNode = ref<string>("");
const storyNodeEditorOpen = ref<boolean>(false);

const currentBranchNode = ref<string>("");
const branchNodeEditorOpen = ref<boolean>(false);

const currentConditionNode = ref<string>("");
const conditionNodeEditorOpen = ref<boolean>(false);

const currentOperationNode = ref<string>("");
const operationNodeEditorOpen = ref<boolean>(false);

const currentRandomNode = ref<string>("");
const randomNodeEditorOpen = ref<boolean>(false);

const currentEventNode = ref<string>("");
const eventNodeEditorOpen = ref<boolean>(false);

function onOpenNode(node: AnyStoryNode) {
  // reset all var
  resetOpenNodes();

  if (node.type === "story") {
    currentStoryNode.value = node.id;
    storyNodeEditorOpen.value = true;
  } else if (node.type === "branch") {
    currentBranchNode.value = node.id;
    branchNodeEditorOpen.value = true;
  } else if (node.type === "condition") {
    currentConditionNode.value = node.id;
    conditionNodeEditorOpen.value = true;
  } else if (node.type === "operation") {
    currentOperationNode.value = node.id;
    operationNodeEditorOpen.value = true;
  } else if (node.type === "random") {
    currentRandomNode.value = node.id;
    randomNodeEditorOpen.value = true;
  } else if (node.type === "event") {
    currentEventNode.value = node.id;
    eventNodeEditorOpen.value = true;
  }
}

function resetOpenNodes() {
  currentStoryNode.value = "";
  storyNodeEditorOpen.value = false;

  currentBranchNode.value = "";
  branchNodeEditorOpen.value = false;

  currentConditionNode.value = "";
  conditionNodeEditorOpen.value = false;

  currentOperationNode.value = "";
  operationNodeEditorOpen.value = false;

  currentRandomNode.value = "";
  randomNodeEditorOpen.value = false;

  currentEventNode.value = "";
  eventNodeEditorOpen.value = false;
}

const storyGraphRef = ref<InstanceType<typeof StoryGraph> | null>(null);

function onNodeContentChange(id: string) {
  if (!id) return;
  const content = storyNodes[id];
  if (!content) return;
  storyGraphRef.value?.updateNodeContent(id, content);
}
</script>

<style scoped>
:deep(.story-editor) {
  height: calc(100vh - 0px);
}
</style>

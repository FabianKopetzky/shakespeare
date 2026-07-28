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
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { AnyStoryNode, Story, StoryNode } from "../types/schema";
import { useContentStore } from "../stores/content";
import StoryGraph from "../components/story/StoryGraph.vue";
import StoryNodeEditor from "../components/story/editor/StoryNodeEditor.vue";
import BranchNodeEditor from "../components/story/editor/BranchNodeEditor.vue";

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

function onOpenNode(node: AnyStoryNode) {
  // reset all var
  resetOpenNodes();

  if (node.type === "story") {
    currentStoryNode.value = node.id;
    storyNodeEditorOpen.value = true;
  } else if (node.type === "branch") {
    currentBranchNode.value = node.id;
    branchNodeEditorOpen.value = true;
  }
}

function resetOpenNodes() {
  currentStoryNode.value = "";
  storyNodeEditorOpen.value = false;

  currentBranchNode.value = "";
  branchNodeEditorOpen.value = false;
}

const storyGraphRef = ref<InstanceType<typeof StoryGraph> | null>(null);

function onNodeContentChange(id: string) {
  console.log("CHANGE " + id);
  if (!id) return;
  const content = storyNodes[id];
  if (!content) return;
  console.log("CONTENT " + JSON.stringify(content));
  storyGraphRef.value?.updateNodeContent(id, content);
}
</script>

<style scoped>
:deep(.story-editor) {
  height: calc(100vh - 0px);
}
</style>

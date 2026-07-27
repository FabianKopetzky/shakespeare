<template>
  <template v-if="!story">
    <h1>A story with the id {{ route.params.id }} does not exist!</h1>
  </template>
  <template v-else>
    <StoryGraph :story="story" @open-node="onOpenNode" />
  </template>
  <!-- EDITOR OVERLAYS -->
  <StoryNodeEditor
    @onsave="onNodeContentChange"
    :story-node-id="currentStoryNode"
    v-model:is-open="storyNodeEditorOpen" />
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { AnyStoryNode, Story, StoryNode } from "../types/schema";
import { useContentStore } from "../stores/content";
import StoryGraph from "../components/story/StoryGraph.vue";
import StoryNodeEditor from "../components/story/editor/StoryNodeEditor.vue";

const route = useRoute();
const story = ref<Story>(undefined);
const { stories } = useContentStore();

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

// The dialogue / branch editor UI isn't built yet - this is the hook point
// for it. For now it just logs which node was clicked.
function onOpenNode(node: AnyStoryNode) {
  // reset all var
  resetOpenNodes();

  if (node.type === "story") {
    currentStoryNode.value = node.id;
    storyNodeEditorOpen.value = true;
  }
}

function resetOpenNodes() {
  currentStoryNode.value = "";
  storyNodeEditorOpen.value = false;
}

function onNodeContentChange() {}
</script>

<style scoped>
:deep(.story-editor) {
  height: calc(100vh - 0px);
}
</style>

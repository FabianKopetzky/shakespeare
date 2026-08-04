<template>
  <div>
    <div class="flex flex-row justify-between">
      <h1>Dialogue Nodes</h1>
      <UButton @click="createNewNode()" class="h-10" icon="basil:add-solid"
        >Create new</UButton
      >
    </div>
    <USeparator class="h-6" orientation="horizontal" />
    <div class="flex flex-col gap-2">
      <DialogueNodeElement
        v-for="node in dialogues"
        :node="node"
        @edit="editNode(node)"
        @delete="deleteNode(node)" />
    </div>
    <DialogueNodeEditor
      v-model:isOpen="editorOpen"
      :node="currentNode"
      :mode="editorMode" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { type DialogueNode, type FormMode } from "../types/schema.ts";
import DialogueNodeEditor from "../components/dialogue/DialogueNodeEditor.vue";
import DialogueNodeElement from "../components/widget/DialogueNodeElement.vue";
import { useContentStore } from "../stores/content.ts";
import { storeToRefs } from "pinia";

const { dialogues } = storeToRefs(useContentStore());
const editorOpen = ref<boolean>(false);
const editorMode = ref<FormMode>("Create");

const currentNode = ref<DialogueNode>(undefined);

function createNewNode(): void {
  editorMode.value = "Create";
  currentNode.value = undefined;
  editorOpen.value = true;
}
function editNode(node: DialogueNode): void {
  editorMode.value = "Update";
  currentNode.value = node;
  editorOpen.value = true;
}
function deleteNode(node: DialogueNode): void {
  const idx = dialogues.value.findIndex((n) => n?.id === node?.id);
  if (idx >= 0 && idx < dialogues.value.length) {
    dialogues.value.splice(idx, 1);
  }
}
</script>

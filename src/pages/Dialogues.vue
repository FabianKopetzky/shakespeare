<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-row justify-between items-start">
      <div>
        <h1>Dialogues</h1>
        <span class="self-end text-dimmed text-balance"
          >Write dialogues and reference them in any story you want!</span
        >
      </div>
      <UButton icon="material-symbols:add-box-sharp" @click="createNewNode()"
        >New Dialogue</UButton
      >
    </div>
    <div class="w-full h-0.5 bg-accented mt-12 mb-6" />

    <UFormField v-if="dialogues.length > 0" class="w-full">
      <UInput
        class="w-full"
        size="lg"
        placeholder="Search dialogues..."
        leading-icon="material-symbols:search-sharp"
        v-model="currentSearch" />
    </UFormField>

    <div class="flex-1 min-h-0 overflow-y-auto mt-8">
      <div v-if="dialogues.length > 0" class="flex flex-col gap-2">
        <DialogueNodeElement
          v-for="node in listedDialogues"
          :key="node?.id"
          :node="node"
          @edit="editNode(node)"
          @delete="deleteNode(node)" />
      </div>
      <div v-else>
        <div
          class="flex flex-col flex-1 self-center items-center justify-center text-muted">
          <UIcon name="mingcute:empty-box-fill" class="w-12 h-12" />
          <span>No dialogues in the project</span>
          <UButton
            class="mt-4"
            icon="material-symbols:add-box-sharp"
            @click="createNewNode()"
            >First dialogue</UButton
          >
        </div>
      </div>
    </div>

    <div v-if="dialogues.length > 0" class="mt-4 flex justify-center shrink-0">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="PAGE_SIZE"
        sibling-count="1"
        :total="filteredDialogues.length" />
    </div>

    <DialogueNodeEditor
      v-model:isOpen="editorOpen"
      :node="currentNode"
      :mode="editorMode" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
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

// PAGINATION & FILTERING
const PAGE_SIZE = 10;

const currentSearch = ref<string>("");
const currentPage = ref<number>(1);

const filteredDialogues = computed<DialogueNode[]>(() => {
  return dialogues.value.filter((d) =>
    d?.id.toLowerCase().includes(currentSearch.value.toLowerCase()),
  );
});

const listedDialogues = computed<DialogueNode[]>(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredDialogues.value.slice(start, start + PAGE_SIZE);
});
</script>

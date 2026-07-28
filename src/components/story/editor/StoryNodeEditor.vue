<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">Edit dialogue node</p>
        <div class="flex flex-row gap-2">
          <UButton
            color="neutral"
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="close">
            <UIcon class="size-12" name="material-symbols:close" />
          </UButton>
          <UButton
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="save">
            <UIcon class="size-12" name="material-symbols:check" />
          </UButton>
        </div>
      </div>
    </template>
    <template #body>
      <div class="h-full">
        <div v-if="dialogueNode" class="mb-4">
          <span>Plays the following dialogue node:</span>
          <div
            class="bg-elevated mt-2 p-2 rounded-xl flex flex-col justify-start items-start">
            <span class="font-bold">{{ dialogueNodeId }}</span>
            <span class="text-muted">{{
              dialogueNode.description || "No description provided"
            }}</span>
            <UButton variant="subtle" class="mt-2" @click="openReadView">
              Open
            </UButton>
          </div>
        </div>
        <div class="flex flex-col justify-start items-start">
          <span class="font-bold mb-2">Change dialogue to play</span>
          <USelectMenu
            class="self-stretch"
            placeholder="Select dialogue node"
            :items="dialogueNodeItems"
            v-model="dialogueNodeId" />
          <UButton class="mt-4" @click="openCreateView">Create new</UButton>
        </div>
      </div>
    </template>
  </USlideover>

  <DialogueNodeEditor
    v-model:isOpen="dialogueEditorOpen"
    :mode="dialogueEditorMode"
    :node="dialogueEditorNode"
    @onsave="onDialogueSaved" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  StoryNode,
  AnyStoryNode,
  DialogueNode,
  FormMode,
} from "../../../types/schema";
import { useContentStore } from "../../../stores/content";
import { useWidget } from "../../../composables/widget.ts";
import DialogueNodeEditor from "../../dialogue/DialogueNodeEditor.vue";

const { displayError } = useWidget();
const { storyNodes, dialogues } = useContentStore();

interface Props {
  storyNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });

const node = ref<StoryNode>();
const dialogueNodeId = ref<string>("");

const dialogueNode = computed<DialogueNode | undefined>(() =>
  dialogues.find((d) => d?.id === dialogueNodeId.value),
);

const dialogueNodeItems = computed<string[]>(() =>
  dialogues
    .map((d) => d?.id)
    .filter(
      (id): id is string => id !== undefined && id !== dialogueNodeId.value,
    ),
);

// --- nested DialogueNodeEditor state (used for both "Open" read view and "Create new") ---
const dialogueEditorOpen = ref(false);
const dialogueEditorMode = ref<FormMode>("Read");
const dialogueEditorNode = ref<DialogueNode | undefined>(undefined);

function openReadView() {
  if (!dialogueNode.value) return;
  dialogueEditorMode.value = "Read";
  dialogueEditorNode.value = dialogueNode.value;
  dialogueEditorOpen.value = true;
}

function openCreateView() {
  dialogueEditorMode.value = "Create";
  dialogueEditorNode.value = undefined;
  dialogueEditorOpen.value = true;
}

// fires when DialogueNodeEditor saves (only relevant in Create mode here,
// since Read mode never triggers a save) — select the newly created node
function onDialogueSaved(id: string) {
  if (dialogueEditorMode.value === "Create") {
    dialogueNodeId.value = id;
  }
}

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.storyNodeId];
  if (n?.type === "story") {
    node.value = n;

    dialogueEditorOpen.value = false;

    // pre fill fields
    dialogueNodeId.value = n.dialogueId;
  }
});

function save(): void {
  const node: AnyStoryNode = storyNodes[props.storyNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.storyNodeId}" does not exist (anymore)`,
    );
    return;
  }

  updateStoryNode();
  emit("onsave", props.storyNodeId);
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

function updateStoryNode() {
  (storyNodes[props.storyNodeId] as StoryNode).dialogueId =
    dialogueNodeId.value;
}
</script>

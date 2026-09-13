<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <SlideoverHeader title="Edit dialogue node" @close="close" @save="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection label="Properties" />

        <div class="flex flex-col justify-start items-start">
          <UFormField
            class="w-full"
            label="Dialogue"
            help="The dialogue that will be played by this node">
            <div class="flex flex-row gap-2 w-full">
              <USelectMenu
                class="w-full flex-1"
                v-model="dialogueNodeId"
                :items="dialogueNodeItems"
                placeholder="Select dialogue to play" />
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-plus"
                @click="openCreateView">
                New
              </UButton>
            </div>
          </UFormField>
        </div>
        <div v-if="dialogueNode" class="mt-8">
          <SlideoverSection label="Dialogue" />
          <div
            class="bg-muted mt-2 p-4 rounded-none border-accented border flex flex-col justify-start items-start">
            <div class="flex flex-row items-center justify-start gap-2">
              <UIcon name="material-symbols:forum-sharp" class="size-5" />
              <span class="font-semibold">{{ dialogueNodeId }}</span>
            </div>
            <span class="text-muted">{{
              dialogueNode.description || "No description provided"
            }}</span>
            <div class="flex flex-row gap-2">
              <UButton
                variant="subtle"
                color="neutral"
                class="mt-2"
                @click="openEditView">
                Edit
              </UButton>
              <UButton
                variant="subtle"
                color="neutral"
                class="mt-2"
                @click="openReadView">
                Preview
              </UButton>
            </div>
          </div>
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

function openEditView() {
  if (!dialogueNode.value) return;
  dialogueEditorMode.value = "Update";
  dialogueEditorNode.value = dialogueNode.value;
  dialogueEditorOpen.value = true;
}
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

<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">Edit branch node</p>
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
      <div class="h-full"></div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  StoryNode,
  AnyStoryNode,
  BranchNode,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";

const { displayError } = useWidget();
const { storyNodes, dialogues } = useContentStore();

interface Props {
  branchNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave"): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });

const node = ref<BranchNode>();

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.branchNodeId];
  if (n?.type === "branch") {
    node.value = n;

    // pre fill fields
  }
});

function save(): void {
  const node: AnyStoryNode = storyNodes[props.branchNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.branchNodeId}" does not exist (anymore)`,
    );
    return;
  }

  updateBranchNode();
  emit("onsave");
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

function updateBranchNode() {
  // (storyNodes[props.branchNodeId] as BranchNode).branches =
}
</script>

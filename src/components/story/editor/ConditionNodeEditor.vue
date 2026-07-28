<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">Edit condition node</p>
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
      <div class="h-full flex flex-col justify-start items-start gap-2">
        <div v-if="condition" class="mb-4">
          <span>Checks if the following condition is met:</span>
          <div
            class="bg-elevated mt-2 p-2 rounded-xl flex flex-col justify-start items-start">
            <span class="font-bold">{{ conditionToString(condition) }}</span>
          </div>
        </div>
        <span v-else>No condition assigned, result will always be false</span>
        <UButton @click="editorOpen = true">Edit condition</UButton>
      </div>
    </template>
  </USlideover>
  <ConditionInput
    v-model:open="editorOpen"
    @submit="onUpdateCondition"
    :condition="condition ?? undefined"
    :variables="variables" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type {
  AnyStoryNode,
  ConditionNode,
  Condition,
  StoryVariable,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import ConditionInput from "../../forms/ConditionInput.vue";
import { useConditionUtils } from "../../../utils/conditionUtils.ts";

const { displayError } = useWidget();
const { storyNodes } = useContentStore();
const { conditionToString } = useConditionUtils();

const variables: StoryVariable[] = [
  { name: "playerGold", type: "Integer", defaultValue: 0 },
  { name: "hasKey", type: "Boolean", defaultValue: false },
  { name: "playerName", type: "String", defaultValue: "" },
];

interface Props {
  conditionNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });
const node = ref<ConditionNode>();
const condition = ref<Condition | null>();

const editorOpen = ref<boolean>(false);

function onUpdateCondition(c: Condition | null) {
  console.log("saved condition:", c);
  condition.value = c;
}

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.conditionNodeId];
  if (n?.type === "condition") {
    node.value = n;

    editorOpen.value = false;

    // pre fill fields
    condition.value = n.condition ?? null;
  }
});

function save(): void {
  const node: AnyStoryNode = storyNodes[props.conditionNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.conditionNodeId}" does not exist (anymore)`,
    );
    return;
  }

  updateConditionNode();
  emit("onsave", props.conditionNodeId);
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

function updateConditionNode() {
  (storyNodes[props.conditionNodeId] as ConditionNode).condition =
    condition.value ?? null;
}
</script>

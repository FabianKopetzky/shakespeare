<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <SlideoverHeader
        title="Edit condition node"
        @close="close"
        :save-content="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection label="Properties" />
        <div
          class="bg-muted mt-2 p-4 rounded-none border-accented border flex flex-col justify-start items-start">
          <div class="flex flex-row items-center justify-start gap-2">
            <UIcon name="material-symbols:help-center-sharp" class="size-5" />
            <span class="font-semibold">Current condition</span>
          </div>
          <span v-if="condition" class="mt-2">{{
            conditionToString(condition)
          }}</span>
          <span v-else class="text-dimmed"
            >No condition assigned. Node will always execute 'false'</span
          >
          <UButton
            variant="subtle"
            color="neutral"
            class="mt-2"
            :icon="
              condition
                ? 'material-symbols:edit-sharp'
                : 'material-symbols:add-box-sharp'
            "
            @click="editorOpen = true">
            {{ condition ? "Edit" : "Add" }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
  <ConditionInput
    v-model:open="editorOpen"
    @submit="onUpdateCondition"
    :condition="condition ?? undefined"
    :variables="storyVariables" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type {
  AnyStoryNode,
  ConditionNode,
  Condition,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import ConditionInput from "../../forms/ConditionInput.vue";
import { useConditionUtils } from "../../../utils/conditionUtils.ts";

const { displayError } = useWidget();
const { storyNodes, storyVariables } = useContentStore();
const { conditionToString } = useConditionUtils();

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

function save(): boolean {
  const node: AnyStoryNode = storyNodes[props.conditionNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.conditionNodeId}" does not exist (anymore)`,
    );
    return false;
  }

  updateConditionNode();
  emit("onsave", props.conditionNodeId);
  isOpen.value = false;

  return true;
}
function close(): void {
  isOpen.value = false;
}

function updateConditionNode() {
  (storyNodes[props.conditionNodeId] as ConditionNode).condition =
    condition.value ?? null;
}
</script>

<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <SlideoverHeader
        title="Edit random node"
        @close="close"
        :save-content="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection label="Branches" />
        <div class="flex flex-col gap-4">
          <div v-if="!branches || branches.length === 0">
            No branches yet. Add one to get started.
          </div>

          <div
            v-for="(branch, index) in branches"
            :key="branch.id"
            class="mb-2">
            <div class="flex flex-row justify-between items-center">
              <span class="font-semibold"
                >Branch {{ index + 1 }}
                <span class="font-medium text-dimmed">
                  | {{ chanceFor(branch) }}%</span
                ></span
              >
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="material-symbols:delete-outline-sharp"
                @click="removeBranch(branch.id)" />
            </div>

            <UFormField class="w-full" label="Weight">
              <UInput
                v-model.number="branch.weight"
                type="number"
                :min="0"
                step="1"
                class="w-full"
                placeholder="Weight" />
            </UFormField>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            class="self-end"
            @click="addBranch">
            <UIcon name="material-symbols:add-box-sharp" />
            Add branch
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  type AnyStoryNode,
  type RandomNode,
  type RandomBranch,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";

const { displayError } = useWidget();
const { storyNodes } = useContentStore();

interface Props {
  randomNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });
const node = ref<RandomNode>();
const branches = ref<RandomBranch[]>([]);

const editorOpen = ref<boolean>(false);

const totalWeight = computed(() =>
  (branches.value ?? []).reduce((sum, b) => sum + (b.weight || 0), 0),
);

function chanceFor(branch: RandomBranch): string {
  if (!totalWeight.value) return "0";
  return ((branch.weight / totalWeight.value) * 100).toFixed(1);
}

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.randomNodeId];
  if (n?.type === "random") {
    node.value = n;

    editorOpen.value = false;

    // pre fill fields
    branches.value = n.branches ? [...n.branches] : [];
  }
});

function addBranch(): void {
  if (!branches.value) branches.value = [];
  branches.value.push({
    id: crypto.randomUUID(),
    weight: 1,
    targetId: null,
  });
}

function removeBranch(id: string | number): void {
  if (branches.value.length <= 1) {
    displayError("A random node is required to have at least one branch!");
    return;
  }
  branches.value = (branches.value ?? []).filter((b) => b.id !== id);
}

function save(): boolean {
  const node: AnyStoryNode = storyNodes[props.randomNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.randomNodeId}" does not exist (anymore)`,
    );
    return false;
  }

  if (!branches.value || branches.value.length <= 0) {
    displayError(
      "Cannot save node without any branches. Please add a branch to continue.",
    );
    return false;
  }

  if (totalWeight.value <= 0) {
    displayError(
      "Total weight of 0 is not allowed. Please make sure to add the desired weight to branches!",
    );
    return false;
  }

  updateRandomNode();
  emit("onsave", props.randomNodeId);
  isOpen.value = false;

  return true;
}
function close(): void {
  isOpen.value = false;
}

function updateRandomNode() {
  (storyNodes[props.randomNodeId] as RandomNode).branches =
    branches.value ?? [];
}
</script>

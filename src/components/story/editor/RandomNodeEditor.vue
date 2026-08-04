<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">Edit random node</p>
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
      <div class="flex flex-col gap-4">
        <div v-if="!branches || branches.length === 0">
          No branches yet. Add one to get started.
        </div>

        <div
          v-for="branch in branches"
          :key="branch.id"
          class="flex flex-col gap-2 border border-gray-700 rounded-lg p-3">
          <div class="flex flex-row items-center gap-2">
            <div class="flex flex-col flex-1">
              <label class="text-xs text-gray-400 mb-1">Weight</label>
              <UInput
                v-model.number="branch.weight"
                type="number"
                :min="0"
                step="1"
                placeholder="Weight" />
            </div>
            <UButton
              color="error"
              variant="ghost"
              class="rounded-full h-9 w-9 flex justify-center items-center self-end"
              @click="removeBranch(branch.id)">
              <UIcon class="size-8" name="material-symbols:delete-outline" />
            </UButton>
          </div>

          <p class="text-xs text-gray-400">Chance: {{ chanceFor(branch) }}%</p>
        </div>

        <UButton
          color="neutral"
          variant="soft"
          class="self-start"
          @click="addBranch">
          <UIcon name="material-symbols:add" class="mr-1" />
          Add branch
        </UButton>
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

// options for target selection — adjust `label` field to match your node schema
const targetOptions = computed(() =>
  Object.values(storyNodes).map((n: AnyStoryNode) => ({
    label: (n as any).title ?? (n as any).name ?? n.id,
    value: n.id,
  })),
);

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
  branches.value = (branches.value ?? []).filter((b) => b.id !== id);
}

function save(): void {
  const node: AnyStoryNode = storyNodes[props.randomNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.randomNodeId}" does not exist (anymore)`,
    );
    return;
  }

  if (!branches.value || branches.value.length <= 0) {
    displayError(
      "Cannot save node without any branches. Please add a branch to continue.",
    );
    return;
  }

  if (totalWeight.value <= 0) {
    displayError(
      "Total weight of 0 is not allowed. Please make sure to add the desired weight to branches!",
    );
    return;
  }

  updateRandomNode();
  emit("onsave", props.randomNodeId);
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

function updateRandomNode() {
  (storyNodes[props.randomNodeId] as RandomNode).branches =
    branches.value ?? [];
}
</script>

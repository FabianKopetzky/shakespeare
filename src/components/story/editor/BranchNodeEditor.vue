<template>
  <USlideover v-model:open="isOpen" :dismissible="false" :ui="slideoverUi">
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
      <div class="h-full">
        <div class="flex flex-row gap-4 items-end justify-between mt-2">
          <div class="flex flex-row gap-4 items-end">
            <UFormField label="Editing language">
              <USelectMenu
                v-model="currentLanguageCode"
                :items="languageMenuItems"
                value-key="value"
                class="w-52" />
            </UFormField>
            <UFormField v-if="isSplit" label="Reference language">
              <USelectMenu
                v-model="referenceLanguageCode"
                :items="referenceLanguageMenuItems"
                value-key="value"
                class="w-52" />
            </UFormField>
          </div>

          <div class="flex flex-row justify-center gap-2">
            <UButton
              :variant="viewMode === 'edit' ? 'solid' : 'outline'"
              color="neutral"
              size="sm"
              @click="viewMode = 'edit'">
              Edit
            </UButton>
            <UButton
              :variant="viewMode === 'preview' ? 'solid' : 'outline'"
              color="neutral"
              size="sm"
              @click="viewMode = 'preview'">
              Preview
            </UButton>
          </div>
        </div>

        <div class="mb-4 pl-8 mt-4">
          <span class="font-bold">Branches ({{ branches.length ?? 0 }})</span>

          <UContextMenu
            v-for="(branch, index) in branches"
            :key="branch.id"
            :items="branchContextMenuItems(index)">
            <div class="border border-default rounded-lg p-4 mt-3 relative">
              <div class="flex flex-row justify-between items-center mb-3">
                <span class="font-semibold text-sm opacity-70"
                  >Branch {{ index + 1 }}</span
                >
                <UDropdownMenu :items="branchContextMenuItems(index)">
                  <UButton
                    icon="material-symbols:more-vert"
                    color="neutral"
                    variant="ghost"
                    size="xs" />
                </UDropdownMenu>
              </div>

              <DialogueSentenceEditor
                :sentence="branchAsSentence(branch)"
                :current-language="currentLanguageCode"
                :reference-language="isSplit ? referenceLanguageCode : null"
                :is-split="isSplit"
                :variables="templatingVariables"
                :colors="textColors"
                :view-mode="viewMode"
                @remove="removeBranch(index)" />

              <div class="mt-3 pt-3 border-t border-default">
                <div class="flex flex-row justify-between items-start gap-2">
                  <div class="flex flex-col gap-1 min-w-0">
                    <span class="text-xs font-semibold opacity-70"
                      >Condition</span
                    >
                    <span
                      v-if="branch.condition"
                      class="text-sm text-muted truncate">
                      {{ conditionToString(branch.condition) }}
                    </span>
                    <span v-else class="text-sm text-muted italic">
                      Always shown
                    </span>
                  </div>
                  <div class="flex flex-row gap-1 shrink-0">
                    <UButton
                      size="xs"
                      variant="soft"
                      color="neutral"
                      :icon="
                        branch.condition
                          ? 'material-symbols:edit-outline'
                          : 'material-symbols:add'
                      "
                      @click="openConditionEditor(index)">
                      {{ branch.condition ? "Edit" : "Add condition" }}
                    </UButton>
                    <UButton
                      v-if="branch.condition"
                      size="xs"
                      variant="ghost"
                      color="error"
                      icon="material-symbols:close"
                      @click="clearBranchCondition(index)" />
                  </div>
                </div>
              </div>
            </div>
          </UContextMenu>

          <div class="w-full flex flex-row justify-end gap-2">
            <UButton
              @click="createBranch()"
              class="flex items-center justify-center mt-3"
              variant="outline"
              color="neutral"
              leading-icon="basil:add-solid"
              >Add branch</UButton
            >
          </div>
        </div>
      </div>
    </template>
  </USlideover>

  <ConditionInput
    v-model:open="conditionEditorOpen"
    :variables="storyVariables"
    :condition="editingCondition"
    @submit="onConditionSubmit" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  AnyStoryNode,
  BranchNode,
  Branch,
  Condition,
  DialogueSentence,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import { useConditionUtils } from "../../../utils/conditionUtils.ts";
import { validateContent } from "../../../utils/dialogueContent.ts";
import DialogueSentenceEditor from "../../dialogue/DialogueSentenceEditor.vue";
import ConditionInput from "../../forms/ConditionInput.vue";

const { displayError } = useWidget();
const {
  storyNodes,
  languages,
  templatingVariables,
  textColors,
  storyVariables,
} = useContentStore();
const { conditionToString } = useConditionUtils();

interface Props {
  branchNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });

const branches = ref<Branch[]>([]);

const defaultLanguage = computed(() => languages.find((l) => l.isDefault));

const currentLanguageCode = ref<string>("");
const referenceLanguageCode = ref<string>("");
const viewMode = ref<"edit" | "preview">("edit");

const isSplit = computed(
  () =>
    !!defaultLanguage.value &&
    currentLanguageCode.value !== defaultLanguage.value.code,
);

const slideoverUi = computed(() => ({
  content: isSplit.value
    ? "w-[65vw] min-w-160 max-w-none"
    : "w-[40vw] min-w-100 max-w-none",
}));

const languageMenuItems = computed(() =>
  languages.map((l) => ({ label: `${l.code} (${l.display})`, value: l.code })),
);
const referenceLanguageMenuItems = computed(() =>
  languages
    .filter((l) => l.code !== currentLanguageCode.value)
    .map((l) => ({ label: `${l.code} (${l.display})`, value: l.code })),
);

const conditionEditorOpen = ref(false);
const editingBranchIndex = ref<number | null>(null);
const editingCondition = ref<Condition | undefined>(undefined);

function openConditionEditor(index: number) {
  editingBranchIndex.value = index;
  editingCondition.value = branches.value[index].condition ?? undefined;
  conditionEditorOpen.value = true;
}

function onConditionSubmit(condition: Condition | null) {
  if (editingBranchIndex.value === null) return;
  branches.value[editingBranchIndex.value].condition = condition;
  editingBranchIndex.value = null;
}

function clearBranchCondition(index: number) {
  branches.value[index].condition = null;
}

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.branchNodeId];
  if (n?.type === "branch") {
    // clone so edits don't mutate the store until save
    branches.value = (n as BranchNode).branches.map((b) => ({
      id: b.id,
      labels: { ...b.labels },
      targetId: b.targetId,
      condition: b.condition ?? null,
    }));
  }

  currentLanguageCode.value =
    defaultLanguage.value?.code ?? languages[0]?.code ?? "";
  referenceLanguageCode.value =
    defaultLanguage.value?.code ?? languages[0]?.code ?? "";
  viewMode.value = "preview"; // reset each time the node is opened
  conditionEditorOpen.value = false;
  editingBranchIndex.value = null;
});

watch(currentLanguageCode, (code) => {
  if (referenceLanguageCode.value !== code) return;
  referenceLanguageCode.value =
    defaultLanguage.value && defaultLanguage.value.code !== code
      ? defaultLanguage.value.code
      : (languages.find((l) => l.code !== code)?.code ?? code);
});

function branchAsSentence(branch: Branch): DialogueSentence {
  // adapts a Branch's `labels` to the shape DialogueSentenceEditor expects,
  // keeping a reference to the same object so edits stay in sync
  return { key: branch.id, translations: branch.labels };
}

function createBranch() {
  branches.value.push({
    id: crypto.randomUUID(),
    labels: { [currentLanguageCode.value]: "" },
    targetId: null,
    condition: null,
  });
}
function removeBranch(index: number) {
  branches.value.splice(index, 1);
}
function moveBranch(index: number, direction: -1 | 1) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= branches.value.length) return;
  const arr = branches.value;
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
}

function branchContextMenuItems(index: number) {
  return [
    [
      {
        label: "Move up",
        icon: "material-symbols:arrow-upward",
        disabled: index === 0,
        onSelect: () => moveBranch(index, -1),
      },
      {
        label: "Move down",
        icon: "material-symbols:arrow-downward",
        disabled: index === branches.value.length - 1,
        onSelect: () => moveBranch(index, 1),
      },
    ],
    [
      {
        label: branches.value[index].condition
          ? "Edit condition"
          : "Add condition",
        icon: "material-symbols:rule",
        onSelect: () => openConditionEditor(index),
      },
    ],
    [
      {
        label: "Delete",
        icon: "material-symbols:delete-outline",
        color: "error",
        onSelect: () => removeBranch(index),
      },
    ],
  ];
}

function validateAllBranches(): string[] {
  const errors: string[] = [];
  const defaultCode = defaultLanguage.value?.code;

  branches.value.forEach((branch, index) => {
    if (defaultCode) {
      const defaultContent = branch.labels[defaultCode] ?? "";
      if (!defaultContent.trim()) {
        errors.push(
          `Branch ${index + 1} is missing content for the default language.`,
        );
      }
    }
    Object.entries(branch.labels).forEach(([code, content]) => {
      if (!content) return;
      validateContent(content, templatingVariables).forEach((err) =>
        errors.push(`Branch ${index + 1} (${code}): ${err}`),
      );
    });
  });

  return errors;
}

function save(): void {
  const node: AnyStoryNode = storyNodes[props.branchNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.branchNodeId}" does not exist (anymore)`,
    );
    return;
  }
  if (branches.value.length === 0) {
    displayError("Add at least one branch before saving.");
    return;
  }

  const contentErrors = validateAllBranches();
  if (contentErrors.length > 0) {
    displayError(
      contentErrors.length === 1
        ? contentErrors[0]
        : `${contentErrors[0]} (+${contentErrors.length - 1} more issue${
            contentErrors.length > 2 ? "s" : ""
          })`,
    );
    return;
  }

  updateBranchNode();
  emit("onsave", props.branchNodeId);
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

function updateBranchNode() {
  (storyNodes[props.branchNodeId] as BranchNode).branches = branches.value;
}
</script>

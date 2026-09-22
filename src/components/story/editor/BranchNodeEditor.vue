<template>
  <USlideover v-model:open="isOpen" :dismissible="false" :ui="slideoverUi">
    <template #header>
      <SlideoverHeader
        title="Edit branch node"
        mode="Update"
        @close="close"
        :save-content="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection :label="`Branches (${branches.length ?? 0})`">
          <div class="bg-default">
            <UButton
              class="ml-4"
              :color="viewMode === 'edit' ? 'primary' : 'neutral'"
              :variant="viewMode === 'edit' ? 'solid' : 'outline'"
              size="sm"
              @click="viewMode = 'edit'">
              Edit
            </UButton>
            <UButton
              :color="viewMode === 'preview' ? 'primary' : 'neutral'"
              :variant="viewMode === 'preview' ? 'solid' : 'outline'"
              size="sm"
              @click="viewMode = 'preview'">
              Preview
            </UButton>
          </div>
        </SlideoverSection>

        <div
          v-if="languages.length > 1"
          class="flex flex-row gap-4 items-end justify-between mt-2">
          <div class="flex flex-row gap-4 items-end w-full">
            <UFormField
              label="Editing language"
              :class="isSplit ? 'w-[50%]' : 'w-full'">
              <USelectMenu
                v-model="currentLanguageCode"
                :items="languageMenuItems"
                class="w-full"
                :icon="
                  languageMenuItems.find((i) => i.value == currentLanguageCode)
                    ?.icon
                "
                value-key="value">
                <template #item-label="{ item }">
                  <span class="text-sm text-default">{{ item.display }}</span>
                  <span class="text-sm text-dimmed"> ({{ item.value }})</span>
                </template>
                <template #default>
                  <span class="text-sm text-default">{{
                    languageMenuItems.find(
                      (i) => i.value == currentLanguageCode,
                    )?.display
                  }}</span>
                  <span class="text-sm text-dimmed">
                    ({{ currentLanguageCode }})</span
                  >
                </template>
              </USelectMenu>
            </UFormField>
            <UFormField
              v-if="isSplit"
              label="Reference language"
              class="w-[50%]">
              <USelectMenu
                v-model="referenceLanguageCode"
                :items="referenceLanguageMenuItems"
                class="w-full"
                :icon="
                  languageMenuItems.find(
                    (i) => i.value == referenceLanguageCode,
                  )?.icon
                "
                value-key="value">
                <template #item-label="{ item }">
                  <span class="text-sm text-default">{{ item.display }}</span>
                  <span class="text-sm text-dimmed"> ({{ item.value }})</span>
                </template>
                <template #default>
                  <span class="text-sm text-default">{{
                    languageMenuItems.find(
                      (i) => i.value == referenceLanguageCode,
                    )?.display
                  }}</span>
                  <span class="text-sm text-dimmed">
                    ({{ referenceLanguageCode }})</span
                  >
                </template>
              </USelectMenu>
            </UFormField>
          </div>
        </div>

        <div class="mb-4 mt-4">
          <UContextMenu
            v-for="(branch, index) in branches"
            :key="branch.id"
            :items="branchContextMenuItems(index)">
            <div class="relative mt-4">
              <DialogueSentenceEditor
                :sentence="branchAsSentence(branch)"
                :current-language="currentLanguageCode"
                :reference-language="isSplit ? referenceLanguageCode : null"
                :is-split="isSplit"
                :variables="storyVariables"
                :colors="textColors"
                :view-mode="viewMode"
                :exclude-custom-fields="true"
                :can-move-up="index > 0"
                :can-move-down="index < branches.length - 1"
                :extra-menu-items="branchExtraMenuItems(index)"
                @remove="removeBranch(index)"
                @move-up="moveBranch(index, -1)"
                @move-down="moveBranch(index, 1)" />

              <div
                v-if="branchFieldSchemas.length > 0"
                v-show="viewMode === 'edit'"
                class="flex flex-row flex-wrap gap-3 mt-2">
                <div
                  v-for="fieldSchema in branchFieldSchemas"
                  :key="fieldSchema.name"
                  class="min-w-40 flex-1">
                  <FieldInstanceInput
                    @submit="
                      (value) => {
                        const field = branch.fields?.data?.find(
                          (f) => f.name === fieldSchema.name,
                        );
                        if (field) {
                          field.value = value;
                        }
                      }
                    "
                    :schema="fieldSchema"
                    :default-value="
                      branch.fields?.data?.find(
                        (f) => f.name === fieldSchema.name,
                      )?.value ?? undefined
                    " />
                </div>
              </div>

              <div v-show="viewMode === 'edit'" class="mt-3 pt-3">
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
                    <span v-else class="text-sm text-muted">
                      This branch is always shown
                    </span>
                  </div>
                  <div class="flex flex-row gap-1 shrink-0">
                    <UButton
                      size="sm"
                      variant="ghost"
                      color="neutral"
                      :icon="
                        branch.condition
                          ? 'material-symbols:edit-sharp'
                          : 'material-symbols:add-box-sharp'
                      "
                      @click="openConditionEditor(index)">
                      {{
                        branch.condition ? "Edit condition" : "Add condition"
                      }}
                    </UButton>
                    <UButton
                      v-if="branch.condition"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      icon="material-symbols:delete-outline-sharp"
                      @click="clearBranchCondition(index)" />
                  </div>
                </div>
              </div>
            </div>
          </UContextMenu>

          <div class="w-full flex flex-row justify-end gap-2 pb-4 my-4">
            <UButton
              @click="createBranch()"
              variant="ghost"
              color="neutral"
              leading-icon="material-symbols:add-box-sharp"
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
    :computed-properties="computedProperties"
    @submit="onConditionSubmit" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  type AnyStoryNode,
  type BranchNode,
  type Branch,
  type Condition,
  type DialogueSentence,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import { useConditionUtils } from "../../../utils/conditionUtils.ts";
import { validateContent } from "../../../utils/dialogueContent.ts";
import DialogueSentenceEditor from "../../dialogue/DialogueSentenceEditor.vue";
import { type SentenceActionMenuItem } from "../../dialogue/RichSentenceEditor.vue";
import ConditionInput from "../../forms/ConditionInput.vue";
import { storeToRefs } from "pinia";
import { useCustomFieldsUtils } from "../../../utils/customFieldsUtils.ts";
import FieldInstanceInput from "../../forms/FieldInstanceInput.vue";

const { displayError } = useWidget();
const {
  storyNodes,
  languages,
  textColors,
  storyVariables,
  computedProperties,
} = storeToRefs(useContentStore());
const { conditionToString } = useConditionUtils();

const { getCustomFieldsForModel, createDefaultFieldsForModel } =
  useCustomFieldsUtils();

interface Props {
  branchNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });

const branches = ref<Branch[]>([]);

const branchFieldSchemas = computed(() => {
  return getCustomFieldsForModel("branch");
});

const defaultLanguage = computed(() =>
  languages.value.find((l) => l.isDefault),
);

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
  languages.value.map((l) => ({
    label: `${l.code} (${l.display})`,
    value: l.code,
    icon: l.icon,
    display: l.display,
  })),
);
const referenceLanguageMenuItems = computed(() =>
  languages.value
    .filter((l) => l.code !== currentLanguageCode.value)
    .map((l) => ({
      label: `${l.code} (${l.display})`,
      value: l.code,
      icon: l.icon,
      display: l.display,
    })),
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
  const n: AnyStoryNode = storyNodes.value[props.branchNodeId];
  if (n?.type === "branch") {
    // clone so edits don't mutate the store until save
    branches.value = (n as BranchNode).branches.map((b) => ({
      id: b.id,
      labels: { ...b.labels },
      targetId: b.targetId,
      condition: b.condition ?? null,
      fields: b.fields ?? createDefaultFieldsForModel("branch"),
    }));
  }

  currentLanguageCode.value =
    defaultLanguage.value?.code ?? languages.value[0]?.code ?? "";
  referenceLanguageCode.value =
    defaultLanguage.value?.code ?? languages.value[0]?.code ?? "";
  viewMode.value = "edit"; // reset each time the node is opened
  conditionEditorOpen.value = false;
  editingBranchIndex.value = null;
});

watch(currentLanguageCode, (code) => {
  if (referenceLanguageCode.value !== code) return;
  referenceLanguageCode.value =
    defaultLanguage.value && defaultLanguage.value.code !== code
      ? defaultLanguage.value.code
      : (languages.value.find((l) => l.code !== code)?.code ?? code);
});

function branchAsSentence(branch: Branch): DialogueSentence {
  // adapts a Branch's `labels` to the shape DialogueSentenceEditor expects,
  // keeping a reference to the same object so edits stay in sync
  return { key: branch.id, translations: branch.labels, fields: { data: [] } };
}

function createBranch() {
  branches.value.push({
    id: crypto.randomUUID(),
    labels: { [currentLanguageCode.value]: "" },
    targetId: null,
    condition: null,
    fields: createDefaultFieldsForModel("branch"),
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

// Single source of truth for the "Add/Edit condition" entry, shared by the
// right-click card menu and the RichSentenceEditor "..." menu below.
function branchConditionMenuItem(index: number): SentenceActionMenuItem {
  const branch = branches.value[index];
  return {
    label: branch.condition ? "Edit condition" : "Add condition",
    icon: branch.condition
      ? "material-symbols:edit-sharp"
      : "material-symbols:add-box-sharp",
    onSelect: () => openConditionEditor(index),
  };
}

// Injected into DialogueSentenceEditor -> RichSentenceEditor's "..." menu,
// between "Move up/down" and "Remove".
function branchExtraMenuItems(index: number): SentenceActionMenuItem[][] {
  return [[branchConditionMenuItem(index)]];
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
    [branchConditionMenuItem(index)],
    [
      {
        label: "Delete",
        icon: "material-symbols:delete-outline-sharp",
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
      validateContent(content, storyVariables.value, textColors.value).forEach(
        (err) => errors.push(`Branch ${index + 1} (${code}): ${err}`),
      );
    });
  });

  return errors;
}

function save(): boolean {
  const node: AnyStoryNode = storyNodes.value[props.branchNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.branchNodeId}" does not exist (anymore)`,
    );
    return false;
  }
  if (branches.value.length === 0) {
    displayError("Add at least one branch before saving.");
    return false;
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
    return false;
  }

  updateBranchNode();
  emit("onsave", props.branchNodeId);
  isOpen.value = false;

  return true;
}
function close(): void {
  isOpen.value = false;
}

function updateBranchNode() {
  (storyNodes.value[props.branchNodeId] as BranchNode).branches =
    branches.value;
}
</script>

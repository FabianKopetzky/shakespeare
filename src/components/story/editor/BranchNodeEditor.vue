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
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  AnyStoryNode,
  BranchNode,
  Branch,
  DialogueSentence,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import { validateContent } from "../../../utils/dialogueContent.ts";
import DialogueSentenceEditor from "../../dialogue/DialogueSentenceEditor.vue";

const { displayError } = useWidget();
const { storyNodes, languages, templatingVariables, textColors } =
  useContentStore();

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
  languages.map((l) => ({ label: `${l.code} — ${l.display}`, value: l.code })),
);
const referenceLanguageMenuItems = computed(() =>
  languages
    .filter((l) => l.code !== currentLanguageCode.value)
    .map((l) => ({ label: `${l.code} — ${l.display}`, value: l.code })),
);

const targetNodeItems = computed(() => [
  { label: "— No target —", value: null },
  ...Object.entries(storyNodes)
    .filter(([id, n]) => !!n && id !== props.branchNodeId)
    .map(([id, n]) => ({
      label: `${id} (${(n as AnyStoryNode).type})`,
      value: id,
    })),
]);

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.branchNodeId];
  if (n?.type === "branch") {
    // clone so edits don't mutate the store until save
    branches.value = (n as BranchNode).branches.map((b) => ({
      id: b.id,
      labels: { ...b.labels },
      targetId: b.targetId,
      condition: null,
    }));
  }

  currentLanguageCode.value =
    defaultLanguage.value?.code ?? languages[0]?.code ?? "";
  referenceLanguageCode.value =
    defaultLanguage.value?.code ?? languages[0]?.code ?? "";
  viewMode.value = "preview"; // reset each time the node is opened
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

<template>
  <USlideover v-model:open="isOpen" :dismissible="false" :ui="slideoverUi">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">{{ editorTitle }}</p>
        <div class="flex flex-row gap-2">
          <UButton
            color="neutral"
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="close">
            <UIcon class="size-12" name="material-symbols:close" />
          </UButton>
          <UButton
            v-if="props.mode !== 'Read'"
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="save">
            <UIcon class="size-12" name="material-symbols:check" />
          </UButton>
        </div>
      </div>
    </template>
    <template #body>
      <div class="h-full">
        <div class="mb-4">
          <span class="font-bold">Dialogue Node ID</span>
          <UInput
            v-model="nodeKey"
            icon="material-symbols:key-rounded"
            :leading="true"
            :maxlength="64"
            :disabled="props.mode !== 'Create'"
            class="w-full mt-2"
            :class="{ 'opacity-40': props.mode === 'Update' }" />
        </div>
        <div class="mb-4">
          <span class="font-bold"
            >Description<span class="text-sm opacity-50">
              (internal)</span
            ></span
          >
          <UTextarea
            v-model="nodeDescription"
            :disabled="props.mode === 'Read'"
            maxlength="400"
            class="w-full mt-2" />
        </div>

        <div class="mb-4">
          <div v-for="fieldSchema in getCustomFieldsForModel('dialogue')">
            <FieldInstanceInput
              @submit="
                (value) => {
                  const field = nodeFields?.data?.find(
                    (f) => f.name === fieldSchema.name,
                  );
                  if (field) {
                    field.value = value;
                  }
                }
              "
              :schema="fieldSchema"
              :default-value="
                nodeFields?.data?.find((f) => f.name === fieldSchema.name)
                  ?.value ?? undefined
              " />
          </div>
        </div>

        <USeparator
          class="h-4"
          orientation="horizontal"
          type="solid"
          size="sm" />

        <div
          v-if="props.mode !== 'Read'"
          class="flex flex-row gap-4 items-end justify-between mt-2">
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
          <span class="font-bold"
            >Sentences ({{ nodeSentences.length ?? 0 }})</span
          >

          <DialogueSentenceEditor
            v-for="(sentence, index) in nodeSentences"
            :key="sentence.key"
            :sentence="sentence"
            :current-language="currentLanguageCode"
            :reference-language="isSplit ? referenceLanguageCode : null"
            :is-split="isSplit"
            :variables="storyVariables"
            :colors="textColors"
            :view-mode="viewMode"
            @remove="removeSentence(index)" />

          <div
            v-if="props.mode !== 'Read'"
            class="w-full flex flex-row justify-end gap-2 pb-4 mb-4">
            <UButton
              @click="createDialogueSentence()"
              class="flex items-center justify-center mt-2"
              variant="outline"
              color="neutral"
              leading-icon="basil:add-solid"
              >Add sentence</UButton
            >
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  type CustomFields,
  type DialogueNode,
  type DialogueSentence,
  type FormMode,
} from "../../types/schema";
import { useContentStore } from "../../stores/content";
import { useWidget } from "../../composables/widget.ts";
import { validateContent } from "../../utils/dialogueContent";
import DialogueSentenceEditor from "./DialogueSentenceEditor.vue";
import { storeToRefs } from "pinia";
import { useCustomFieldsUtils } from "../../utils/customFieldsUtils.ts";
import FieldInstanceInput from "../forms/FieldInstanceInput.vue";

const { displayError } = useWidget();

interface Props {
  node?: DialogueNode;
  mode: FormMode;
}
const { createDefaultFieldsForModel, getCustomFieldsForModel } =
  useCustomFieldsUtils();
const props = defineProps<Props>();

const isOpen = defineModel<boolean>("isOpen", { required: true });

const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();

const { dialogues, languages, storyVariables, textColors } =
  storeToRefs(useContentStore());

const defaultLanguage = computed(() =>
  languages.value.find((l) => l.isDefault),
);

const nodeKey = ref<string>("");
const nodeDescription = ref<string>("");
const nodeSentences = ref<DialogueSentence[]>([]);
const nodeFields = ref<CustomFields>();

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
  })),
);
const referenceLanguageMenuItems = computed(() =>
  languages.value
    .filter((l) => l.code !== currentLanguageCode.value)
    .map((l) => ({ label: `${l.code} (${l.display})`, value: l.code })),
);

watch(isOpen, (open) => {
  if (!open) return;
  nodeKey.value = props.node?.id ?? "";
  nodeDescription.value = props.node?.description ?? "";
  nodeSentences.value = (props.node?.sentences ?? []).map((s) => ({
    key: s.key,
    translations: { ...s.translations },
    fields: s.fields ?? createDefaultFieldsForModel("dialogue_sentence"),
  }));

  nodeFields.value =
    props.node?.fields ?? createDefaultFieldsForModel("dialogue");

  currentLanguageCode.value =
    defaultLanguage.value?.code ?? languages.value[0]?.code ?? "";
  referenceLanguageCode.value =
    defaultLanguage.value?.code ?? languages.value[0]?.code ?? "";
  if (props.mode === "Read") {
    viewMode.value = "preview"; // reset each time the node is opened
  } else {
    viewMode.value = "edit";
  }
});

watch(currentLanguageCode, (code) => {
  if (referenceLanguageCode.value !== code) return;
  referenceLanguageCode.value =
    defaultLanguage.value && defaultLanguage.value.code !== code
      ? defaultLanguage.value.code
      : (languages.value.find((l) => l.code !== code)?.code ?? code);
});

const editorTitle = computed(() => {
  switch (props.mode) {
    case "Create":
      return "Create new node";
    case "Read":
      return `Node ${props.node?.id}`;
    case "Update":
      return `Update ${props.node?.id}`;
  }
});

function createDialogueSentence() {
  nodeSentences.value.push({
    key: crypto.randomUUID(),
    translations: { [currentLanguageCode.value]: "" },
    fields: createDefaultFieldsForModel("dialogue_sentence"),
  });
}
function removeSentence(index: number) {
  nodeSentences.value.splice(index, 1);
}

function validateAllSentences(): string[] {
  const errors: string[] = [];
  const defaultCode = defaultLanguage.value?.code;

  nodeSentences.value.forEach((sentence, index) => {
    if (defaultCode) {
      const defaultContent = sentence.translations[defaultCode] ?? "";
      if (!defaultContent.trim()) {
        errors.push(
          `Sentence ${index + 1} is missing content for the default language.`,
        );
      }
    }
    Object.entries(sentence.translations).forEach(([code, content]) => {
      if (!content) return;
      validateContent(content, storyVariables.value, textColors.value).forEach(
        (err) => errors.push(`Sentence ${index + 1} (${code}): ${err}`),
      );
    });
  });

  return errors;
}

function save(): void {
  if (!nodeKey.value || nodeKey.value.length <= 0) {
    displayError("The ID of a dialogue node cannot be null!");
    return;
  }
  if (!/^[A-Za-z0-9_]+$/.test(nodeKey.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed for a node key!",
    );
    return;
  }
  if (
    props.mode === "Create" &&
    dialogues.value.find((n) => n?.id === nodeKey.value)
  ) {
    displayError(
      `A dialogue node with the ID "${nodeKey.value}" already exists!`,
    );
    return;
  }
  if (nodeSentences.value.length === 0) {
    displayError("Add at least one sentence before saving.");
    return;
  }

  const contentErrors = validateAllSentences();
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

  upsertDialogueNode();
  emit("onsave", nodeKey.value);
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

function upsertDialogueNode() {
  const newNode: DialogueNode = {
    id: nodeKey.value,
    description: nodeDescription.value,
    sentences: nodeSentences.value,
    fields: nodeFields.value ?? createDefaultFieldsForModel("dialogue"),
  };

  if (props.mode === "Update" && props.node) {
    const index = dialogues.value.findIndex((n) => n?.id === props.node!.id);
    if (index !== -1) {
      dialogues.value[index] = newNode;
      return;
    }
  }
  dialogues.value.push(newNode);
}
</script>

<template>
  <USlideover v-model:open="isOpen" :dismissible="false" :ui="slideoverUi">
    <template #header>
      <SlideoverHeader
        :title="editorTitle"
        :mode="props.mode"
        @close="close"
        @save="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection label="Properties" />
        <div class="mb-4 flex flex-row justify-center items-start gap-4">
          <UFormField class="flex-1" label="ID">
            <UInput
              v-model="nodeKey"
              :leading="true"
              :maxlength="64"
              :disabled="props.mode !== 'Create'"
              class="w-full"
              :class="{ 'opacity-40': props.mode === 'Update' }" />
          </UFormField>
          <UFormField class="flex-2" label="Description (internal)">
            <UInput
              v-model="nodeDescription"
              :disabled="props.mode === 'Read'"
              maxlength="400"
              class="w-full" />
          </UFormField>
        </div>

        <div class="mb-12">
          <div v-for="fieldSchema in getCustomFieldsForModel('dialogue')">
            <FieldInstanceInput
              :readonly="props.mode === 'Read'"
              class="mb-2"
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

        <SlideoverSection :label="`Sentences (${nodeSentences.length})`">
          <div v-if="props.mode !== 'Read'" class="bg-default">
            <UButton
              class="ml-4"
              :color="viewMode === 'edit' ? 'primary' : 'neutral'"
              :variant="viewMode === 'edit' ? 'solid' : 'outline'"
              @click="viewMode = 'edit'">
              Edit
            </UButton>
            <UButton
              :color="viewMode === 'preview' ? 'primary' : 'neutral'"
              :variant="viewMode === 'preview' ? 'solid' : 'outline'"
              @click="viewMode = 'preview'">
              Preview
            </UButton>
          </div></SlideoverSection
        >
        <div
          v-if="props.mode !== 'Read' && languages.length > 1"
          class="flex flex-row gap-4 items-end justify-between mt-2">
          <div class="flex flex-row gap-4 items-end w-full">
            <UFormField
              label="Language"
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
                </template></USelectMenu
              >
            </UFormField>
          </div>
        </div>

        <div class="mb-4 mt-8">
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
            class="w-full flex flex-row justify-end gap-2 pb-4 my-4">
            <UButton
              @click="createDialogueSentence()"
              variant="ghost"
              color="neutral"
              leading-icon="material-symbols:add-box-sharp"
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

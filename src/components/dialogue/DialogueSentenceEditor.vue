<template>
  <div class="w-full mt-3">
    <div
      class="w-full"
      :class="isSplit ? 'grid grid-cols-2 gap-4 items-stretch' : ''">
      <div class="flex flex-col">
        <RichSentenceEditor
          v-model="currentContent"
          class="flex-1"
          :variables="variables"
          :computed-properties="computedProperties"
          :colors="colors"
          :view-mode="viewMode"
          :can-move-up="canMoveUp"
          :can-move-down="canMoveDown"
          :extra-menu-items="extraMenuItems"
          @remove="emit('remove')"
          @move-up="emit('move-up')"
          @move-down="emit('move-down')" />
      </div>
      <div v-if="isSplit" class="flex flex-col">
        <div
          v-if="props.viewMode === 'edit'"
          class="h-7 mb-2 shrink-0"
          aria-hidden="true" />
        <SentenceContentDisplay
          class="flex-1"
          :content="referenceContent"
          :variables="variables" />
      </div>
    </div>

    <div
      v-if="!props.excludeCustomFields && sentenceFieldSchemas.length > 0"
      v-show="viewMode === 'edit'"
      class="flex flex-row flex-wrap gap-3 mt-2">
      <div
        v-for="fieldSchema in sentenceFieldSchemas"
        :key="fieldSchema.name"
        class="min-w-40 flex-1">
        <FieldInstanceInput
          @submit="
            (value) => {
              const field = props.sentence.fields?.data?.find(
                (f) => f.name === fieldSchema.name,
              );
              if (field) {
                field.value = value;
              }
            }
          "
          :schema="fieldSchema"
          :default-value="
            props.sentence.fields?.data?.find(
              (f) => f.name === fieldSchema.name,
            )?.value ?? undefined
          " />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  ComputedProperty,
  DialogueSentence,
  StoryVariable,
  TextColor,
} from "../../types/schema";
import RichSentenceEditor, {
  type SentenceActionMenuItem,
} from "./RichSentenceEditor.vue";
import SentenceContentDisplay from "./SentenceContentDisplay.vue";
import FieldInstanceInput from "../forms/FieldInstanceInput.vue";
import { useCustomFieldsUtils } from "../../utils/customFieldsUtils.ts";

interface Props {
  sentence: DialogueSentence;
  currentLanguage: string;
  referenceLanguage: string | null;

  isSplit: boolean;
  variables: StoryVariable[];
  computedProperties: ComputedProperty[];
  colors: TextColor[];
  viewMode: "edit" | "preview";

  excludeCustomFields?: boolean;

  canMoveUp?: boolean;
  canMoveDown?: boolean;

  extraMenuItems?: SentenceActionMenuItem[][];
}
const props = withDefaults(defineProps<Props>(), {
  excludeCustomFields: false,
  canMoveUp: true,
  canMoveDown: true,
  extraMenuItems: () => [],
});
const emit = defineEmits<{
  (e: "remove"): void;
  (e: "move-up"): void;
  (e: "move-down"): void;
}>();

const { getCustomFieldsForModel } = useCustomFieldsUtils();

const sentenceFieldSchemas = computed(() =>
  getCustomFieldsForModel("dialogue_sentence"),
);

const currentContent = computed<string>({
  get: () => props.sentence.translations[props.currentLanguage] ?? "",
  set: (val) => {
    props.sentence.translations[props.currentLanguage] = val;
  },
});

const referenceContent = computed<string>(() =>
  props.referenceLanguage
    ? (props.sentence.translations[props.referenceLanguage] ?? "")
    : "",
);
</script>

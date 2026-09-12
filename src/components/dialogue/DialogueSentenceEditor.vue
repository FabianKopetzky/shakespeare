<template>
  <UContextMenu
    :items="[
      {
        label: 'Remove',
        icon: 'mdi:trash',
        color: 'error' as const,
        onSelect: () => emit('remove'),
      },
    ]">
    <div class="w-full mt-3">
      <div class="w-full" :class="isSplit ? 'grid grid-cols-2 gap-4' : ''">
        <div>
          <p
            v-if="isSplit"
            class="text-xs font-semibold opacity-60 mb-1 uppercase">
            {{ currentLanguageDisplay }}
          </p>
          <RichSentenceEditor
            v-model="currentContent"
            :variables="variables"
            :colors="colors"
            :view-mode="viewMode" />
        </div>
        <div v-if="isSplit">
          <p
            class="text-xs font-semibold opacity-60 uppercase"
            :class="{ 'mb-10': props.viewMode === 'edit' }">
            Reference ({{ referenceLanguageDisplay }})
          </p>
          <SentenceContentDisplay
            :content="referenceContent"
            :variables="variables" />
        </div>
      </div>

      <div
        v-if="!props.excludeCustomFields && sentenceFieldSchemas.length > 0"
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
  </UContextMenu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  DialogueSentence,
  StoryVariable,
  TextColor,
} from "../../types/schema";
import RichSentenceEditor from "./RichSentenceEditor.vue";
import SentenceContentDisplay from "./SentenceContentDisplay.vue";
import FieldInstanceInput from "../forms/FieldInstanceInput.vue";
import { useCustomFieldsUtils } from "../../utils/customFieldsUtils.ts";

interface Props {
  sentence: DialogueSentence;
  currentLanguage: string;
  referenceLanguage: string | null;

  currentLanguageDisplay: string;
  referenceLanguageDisplay: string;

  isSplit: boolean;
  variables: StoryVariable[];
  colors: TextColor[];
  viewMode: "edit" | "preview";

  excludeCustomFields?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  excludeCustomFields: false,
});
const emit = defineEmits<{ (e: "remove"): void }>();

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

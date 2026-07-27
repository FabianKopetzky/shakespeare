<script setup lang="ts">
import { computed } from "vue";
import type {
  DialogueSentence,
  TemplatingVariable,
  TextColor,
} from "../../types/schema";
import RichSentenceEditor from "./RichSentenceEditor.vue";
import SentenceContentDisplay from "./SentenceContentDisplay.vue";

interface Props {
  sentence: DialogueSentence;
  currentLanguage: string;
  referenceLanguage: string | null;
  isSplit: boolean;
  variables: TemplatingVariable[];
  colors: TextColor[];
  viewMode: "edit" | "preview";
}
const props = defineProps<Props>();
const emit = defineEmits<{ (e: "remove"): void }>();

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
    <div class="w-full mt-3" :class="isSplit ? 'grid grid-cols-2 gap-3' : ''">
      <div
        v-if="isSplit"
        class="rounded-md border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800/40">
        <p class="text-xs font-semibold opacity-60 mb-1 uppercase">
          Reference ({{ referenceLanguage }})
        </p>
        <SentenceContentDisplay
          :content="referenceContent"
          :variables="variables" />
      </div>
      <div>
        <p
          v-if="isSplit"
          class="text-xs font-semibold opacity-60 mb-1 uppercase">
          {{ currentLanguage }}
        </p>
        <RichSentenceEditor
          v-model="currentContent"
          :variables="variables"
          :colors="colors"
          :view-mode="viewMode" />
      </div>
    </div>
  </UContextMenu>
</template>

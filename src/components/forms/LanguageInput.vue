<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { FormMode, Language } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";

interface Props {
  mode: FormMode;
  language: Language | undefined;
}
const props = defineProps<Props>();

const { displayError } = useWidget();
const { languages } = useContentStore();

const languageCode = ref<string>("");
const languageDisplay = ref<string>("");

onMounted(() => {
  if (props.mode === "Update" && props.language) {
    languageCode.value = props.language.code;
    languageDisplay.value = props.language.display;
  }
});

const emit = defineEmits<{
  (e: "submit", language: Language): void;
}>();

function submit() {
  if (!languageCode.value || languageCode.value.length <= 0) {
    displayError("Language code cannot be empty!");
    return;
  }
  if (!languageDisplay.value || languageDisplay.value.length <= 0) {
    displayError("Language display cannot be empty!");
    return;
  }

  if (
    props.mode === "Create" &&
    languages.find((l) => l.code == languageCode.value)
  ) {
    displayError("A language with this code already exists!");
    return;
  }

  emit("submit", {
    code: languageCode.value,
    display: languageDisplay.value,
    isDefault:
      props.mode === "Update" ? (props.language?.isDefault ?? false) : false,
  });
  clear();
}

function clear() {
  languageCode.value = "";
  languageDisplay.value = "";
}
</script>

<template>
  <div class="flex flex-row gap-4 justify-start items-center">
    <UFormField label="Language Code" help="Unique identifier of the language.">
      <UInput :disabled="props.mode !== 'Create'" v-model="languageCode" />
    </UFormField>
    <UFormField label="Display" help="How the language is displayed.">
      <UInput v-model="languageDisplay" />
    </UFormField>
    <UButton @click="submit">{{
      props.mode === "Create" ? "Add" : "Update"
    }}</UButton>
  </div>
</template>

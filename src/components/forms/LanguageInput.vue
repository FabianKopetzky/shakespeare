<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { FormMode, Language } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";

interface Props {
  mode: FormMode;
  language: Language | undefined;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

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

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      languageCode.value = props.language?.code ?? "";
      languageDisplay.value = props.language?.display ?? "";
    }
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
  if (!/^[A-Za-z0-9_]+$/.test(languageCode.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed for the language code",
    );
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
  open.value = false;
  clear();
}

function clear() {
  languageCode.value = "";
  languageDisplay.value = "";
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.mode === 'Create' ? 'Add language' : 'Edit language'">
    <template #body>
      <div class="flex flex-col gap-4 justify-start items-start">
        <UFormField
          class="w-full"
          label="Language Code"
          help="Unique identifier of the language.">
          <UInput
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="languageCode" />
        </UFormField>
        <UFormField
          class="w-full"
          label="Display"
          help="How the language is displayed.">
          <UInput class="w-full" v-model="languageDisplay" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="open = false">
          Cancel
        </UButton>
        <UButton @click="submit">{{
          props.mode === "Create" ? "Add" : "Update"
        }}</UButton>
      </div>
    </template>
  </UModal>
</template>

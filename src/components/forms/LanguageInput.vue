<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type { FormMode, Language } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";
import {
  defaultLanguageIcon,
  languageIconOptions,
  guessLanguageIcon,
} from "../../utils/languageIcons";
import { storeToRefs } from "pinia";

interface Props {
  mode: FormMode;
  language: Language | undefined;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { languages } = storeToRefs(useContentStore());

const languageCode = ref<string>("");
const languageDisplay = ref<string>("");
const languageIcon = ref<string>("");
const iconSearchTerm = ref<string>("");

// True while the form is being populated programmatically (opening the
// panel, resetting it). Auto-guessing is suppressed during this window
// so it only ever reacts to the user actually typing.
const isHydrating = ref(false);

// Tracks the last icon we set via auto-guess, so a manual pick in the
// select menu isn't immediately overwritten by the next keystroke.
const lastGuessedIcon = ref<string>("");

const filteredLanguageIconOptions = computed(() => {
  const query = iconSearchTerm.value.trim().toLowerCase();
  let matches = query
    ? languageIconOptions.filter((o) => o.label.toLowerCase().includes(query))
    : languageIconOptions;

  matches = matches.slice(0, 10);

  // Always keep the currently selected option in the list, even if it
  // doesn't match the search term or fell outside the top 10 — otherwise
  // USelectMenu can't resolve its label and displays the raw value instead.
  if (
    languageIcon.value &&
    !matches.some((o) => o.value === languageIcon.value)
  ) {
    const selected = languageIconOptions.find(
      (o) => o.value === languageIcon.value,
    );
    if (selected) matches = [selected, ...matches];
  }

  return matches;
});

function hydrate(code: string, display: string, icon: string) {
  isHydrating.value = true;
  languageCode.value = code;
  languageDisplay.value = display;
  languageIcon.value = icon;
  lastGuessedIcon.value = icon;
  nextTick(() => {
    isHydrating.value = false;
  });
}

onMounted(() => {
  if (props.mode === "Update" && props.language) {
    hydrate(
      props.language.code,
      props.language.display,
      props.language.icon ?? defaultLanguageIcon,
    );
  }
});

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      hydrate(
        props.language?.code ?? "",
        props.language?.display ?? "",
        props.language?.icon ?? defaultLanguageIcon,
      );
    }
  }
});

watch([languageCode, languageDisplay], () => {
  if (isHydrating.value) return; // opening the panel, not typing — skip
  if (languageIcon.value !== lastGuessedIcon.value) return; // user overrode manually — respect it

  const guess = guessLanguageIcon(languageCode.value, languageDisplay.value);
  languageIcon.value = guess;
  lastGuessedIcon.value = guess;
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
    languages.value.find((l) => l.code == languageCode.value)
  ) {
    displayError("A language with this code already exists!");
    return;
  }

  emit("submit", {
    code: languageCode.value,
    display: languageDisplay.value,
    icon: languageIcon.value || defaultLanguageIcon,
    isDefault:
      props.mode === "Update" ? (props.language?.isDefault ?? false) : false,
  });
  open.value = false;
  clear();
}

function clear() {
  isHydrating.value = true;
  languageCode.value = "";
  languageDisplay.value = "";
  languageIcon.value = defaultLanguageIcon;
  lastGuessedIcon.value = defaultLanguageIcon;
  iconSearchTerm.value = "";
  nextTick(() => {
    isHydrating.value = false;
  });
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
        <UFormField class="w-full" label="Icon">
          <USelectMenu
            class="w-full"
            v-model="languageIcon"
            v-model:search-term="iconSearchTerm"
            :items="filteredLanguageIconOptions"
            value-key="value"
            ignore-filter
            :icon="languageIcon || defaultLanguageIcon" />
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

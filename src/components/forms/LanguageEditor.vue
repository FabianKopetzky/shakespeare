<script setup lang="ts">
import { computed, ref } from "vue";
import { useContentStore } from "../../stores/content";
import type { Language } from "../../types/schema";
import LanguageInput from "./LanguageInput.vue";
import LanguageItem from "./LanguageItem.vue";
import { storeToRefs } from "pinia";

const { languages, storyNodes, dialogues } = storeToRefs(useContentStore());

const defaultLanguage = computed<Language | undefined>(() => {
  return languages.value.find((l) => l.isDefault);
});
const otherLanguages = computed<Language[]>(() => {
  return languages.value.filter((l) => !l.isDefault);
});

const addLanguageModalOpen = ref<boolean>(false);

function addNewLanguage(lang: Language) {
  languages.value.push(lang);
}
function editLanguage(lang: Language) {
  const idx = languages.value.findIndex((l) => l.code == lang.code);
  if (idx >= 0 && idx < languages.value.length) {
    languages.value[idx] = lang;
  }
}
function deleteLanguage(code: string) {
  const idx = languages.value.findIndex((l) => l.code == code);
  if (idx < 0) return;

  // clean up
  for (const dialogue of dialogues.value) {
    for (const sentence of dialogue?.sentences ?? []) {
      delete sentence.translations[code];
    }
  }

  for (const node of Object.keys(storyNodes.value)) {
    if (storyNodes.value[node].type === "branch") {
      for (const branch of storyNodes.value[node].branches) {
        delete branch.labels[code];
      }
    }
  }

  languages.value.splice(idx, 1);
}
</script>

<template>
  <h2>Languages</h2>

  <div v-if="defaultLanguage" class="mt-8">
    <LanguageItem
      @edit="editLanguage"
      :language="defaultLanguage"
      :deletable="false" />
  </div>

  <template v-if="otherLanguages.length > 0">
    <div v-for="lang in otherLanguages" :key="lang.code">
      <LanguageItem
        @edit="editLanguage"
        @delete="deleteLanguage"
        :language="lang"
        :deletable="true" />
    </div>
  </template>
  <template v-else>
    <p>There are no more languages defined...</p>
  </template>

  <USeparator class="my-8" />

  <UButton @click="addLanguageModalOpen = true">Create new</UButton>

  <LanguageInput
    v-model:open="addLanguageModalOpen"
    @submit="addNewLanguage"
    :language="undefined"
    mode="Create" />
</template>

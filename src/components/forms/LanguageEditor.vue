<script setup lang="ts">
import { computed } from "vue";
import { useContentStore } from "../../stores/content";
import type { Language } from "../../types/schema";
import LanguageInput from "./LanguageInput.vue";
import LanguageItem from "./LanguageItem.vue";

const { languages } = useContentStore();

const defaultLanguage = computed<Language | undefined>(() => {
  return languages.find((l) => l.isDefault);
});
const otherLanguages = computed<Language[]>(() => {
  return languages.filter((l) => !l.isDefault);
});

function addNewLanguage(lang: Language) {
  languages.push(lang);
}
function editLanguage(lang: Language) {
  const idx = languages.findIndex((l) => l.code == lang.code);
  if (idx >= 0 && idx < languages.length) {
    languages[idx] = lang;
  }
}
function deleteLanguage(code: string) {
  const idx = languages.findIndex((l) => l.code == code);
  if (idx >= 0) {
    languages.splice(idx, 1);
  }
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

  <LanguageInput @submit="addNewLanguage" :language="undefined" mode="Create" />
</template>

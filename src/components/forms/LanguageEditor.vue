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
  <div>
    <div class="flex flex-col sm:flex-row gap-2 justify-between mb-12">
      <div
        class="flex flex-row gap-2 items-center justify-between sm:justify-start">
        <h2>Languages</h2>
        <Help
          title="Languages"
          messageHtml='<p>Languages allow you to add translations for your stories, dialogues and branches. The default language always holds the ID "<span class=text-primary>default</span>" and its display can be changed to resemble the default language of the project.<br><br>Adding another language will enable translations in the respective editors. You can edit them directly with a reference language or use the <span class=text-primary>Translation Service</span> to export translations to <span class=text-primary>.csv files</span> and reimport them once you are done translating.<br><br>In Unity, all translations of a story are saved separately, so Shakespeare can only load the set language of your application at runtime.</p>' />
      </div>
      <UButton
        icon="material-symbols:add-box-sharp"
        @click="addLanguageModalOpen = true"
        >New Language</UButton
      >
    </div>

    <div v-if="defaultLanguage" class="mt-8">
      <p class="text-dimmed text-sm mb-2">Default language</p>
      <LanguageItem
        @edit="editLanguage"
        :language="defaultLanguage"
        :deletable="false" />
    </div>

    <template v-if="otherLanguages.length > 0">
      <div class="w-full h-0.5 bg-accented mt-4 mb-4" />
      <p class="text-dimmed text-sm mb-2">Translations</p>
      <div v-for="lang in otherLanguages" :key="lang.code" class="mb-2">
        <LanguageItem
          @edit="editLanguage"
          @delete="deleteLanguage"
          :language="lang"
          :deletable="true" />
      </div>
    </template>

    <LanguageInput
      v-model:open="addLanguageModalOpen"
      @submit="addNewLanguage"
      :language="undefined"
      mode="Create" />
  </div>
</template>

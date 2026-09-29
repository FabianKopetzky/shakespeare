<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useWidget } from "../../composables/widget";
import { useTranslationMapping } from "../../composables/translationMapping";
import { useContentStore } from "../../stores/content";
import { storeToRefs } from "pinia";

const open = defineModel<boolean>("open", { default: false });

const { exportTranslationMap } = useTranslationMapping();
const { displaySuccess } = useWidget();
const { projectTitle, languages } = storeToRefs(useContentStore());

const placeholder = ref<string>("");
const separator = ref<string>(";");

watch(open, (isOpen) => {
  if (isOpen) {
    placeholder.value = "<N/A>";
    separator.value = ";";
    selectedTranslations.value = Object.fromEntries(languages.value.map(l => [l.code, l.isDefault]));
  }
});

const separatorOptions = [
  {
    label: "Semicolon",
    value: ";",
  },
  {
    label: "Comma",
    value: ",",
  },
];

async function onConfirm() {
  if (!separator.value) return;

  exportTranslationMap(placeholder.value, separator.value, translationsSelectedForExport.value);
  displaySuccess(
    `Sucessfully exported translation map for project ${projectTitle.value}`,
  );
  open.value = false;
}
function onCancel() {
  open.value = false;
}

const selectedTranslations = ref<Record<string, boolean>>(
  Object.fromEntries(languages.value.map(l => [l.code, true]))
);

const translationsSelectedForExport = computed<string[]>(() => Object.keys(selectedTranslations.value).filter(c => selectedTranslations.value[c]));
</script>

<template>
  <UModal v-model:open="open" title="Export translation map">
    <template #body>
      <div class="flex flex-row gap-2 w-full mb-4">
        <UFormField
          class="flex-2"
          label="Placeholder"
          help="The placeholder that will be used for empty values">
          <UInput class="w-full" v-model="placeholder" />
        </UFormField>
        <UFormField class="flex-1" label="Separator">
          <USelect
            :items="separatorOptions"
            class="w-full"
            v-model="separator" />
        </UFormField>
      </div>
      <div class="flex flex-row gap-2 w-full">
        <UFormField label="Included translations">
          <div class="grid grid-cols-2 gap-x-20 gap-y-2 w-full">
            <UCheckbox
              v-for="lang in languages"
              :key="lang.code"
              v-model="selectedTranslations[lang.code]"
              size="xl">
              <template #label>
                <div class="flex flex-row gap-2 items-center justify-start">
                  <UIcon :name="lang.icon" />
                  <span>{{ lang.display }}</span>
                  <span class="text-dimmed text-sm">({{ lang.code }})</span>
                </div>
              </template>
            </UCheckbox>
          </div>
        </UFormfield>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="onCancel">
          Cancel
        </UButton>
        <UButton @click="onConfirm">Download</UButton>
      </div>
    </template>
  </UModal>
</template>

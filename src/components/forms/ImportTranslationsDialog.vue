<script setup lang="ts">
import { ref, watch } from "vue";
import { useProjectHandler } from "../../composables/projectHandler";
import { useWidget } from "../../composables/widget";
import { useRouter } from "vue-router";
import { useTranslationMapping } from "../../composables/translationMapping";
import { useContentStore } from "../../stores/content";

const { projectTitle } = useContentStore();

const open = defineModel<boolean>("open", { default: false });
const uploadedFile = ref<File | null>(null);
const csvRows = ref<string[]>([]);

const { importTranslationMap } = useTranslationMapping();
const { displayError, displaySuccess } = useWidget();

const placeholder = ref<string>("");
const separator = ref<string>(";");
watch(open, (isOpen) => {
  if (isOpen) {
    placeholder.value = "";
    separator.value = ";";
    csvRows.value = [];
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

function onConfirm() {
  if (!separator.value) return;
  if (!csvRows || csvRows.value.length <= 0) {
    displayError("Empty translation map. Please try again with a valid file");
    return;
  }

  importTranslationMap(csvRows.value, placeholder.value, separator.value);

  displaySuccess(`Successfully imported translation map for ${projectTitle}`);

  open.value = false;
}
function onCancel() {
  open.value = false;
}

async function handleFileUpload(file: File | null): Promise<void> {
  if (!file) return;
  try {
    const txt = await file.text();
    const rows = txt.trim().split(/\r?\n/);
    csvRows.value = rows;
  } catch (err) {
    console.error(`Error importing project: ${err}`);
    displayError("An error occurred importing your project");
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Import translation map">
    <template #body>
      <div class="flex flex-row gap-2 w-full">
        <UFormField
          class="flex-2"
          label="Placeholder"
          help="Entries with this value will not be imported.">
          <UInput class="w-full" v-model="placeholder" />
        </UFormField>
        <UFormField class="flex-1" label="Separator">
          <USelect
            :items="separatorOptions"
            class="w-full"
            v-model="separator" />
        </UFormField>
      </div>
      <UFileUpload
        icon="mdi:import"
        type="file"
        accept=".csv,text/json"
        label="Drop your translation map here"
        description="A translation map is a .csv file containing all translations of your project."
        v-model="uploadedFile"
        @update:model-value="handleFileUpload" />
    </template>

    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="onCancel">
          Cancel
        </UButton>
        <UButton @click="onConfirm">Import</UButton>
      </div>
    </template>
  </UModal>
</template>

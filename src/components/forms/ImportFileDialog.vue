<script setup lang="ts">
import { ref, watch } from "vue";
import { useProjectHandler } from "../../composables/projectHandler";
import { useWidget } from "../../composables/widget";
import { useRouter } from "vue-router";

const router = useRouter();

const open = defineModel<boolean>("open", { default: false });
const uploadedFile = ref<File | null>(null);
const json = ref<any>(undefined);

const { importProject } = useProjectHandler();
const { displayError, displaySuccess } = useWidget();

async function onConfirm() {
  if (!json.value) {
    displayError("Empty project file. Please try again with a valid file");
    return;
  }

  const res = await importProject(json.value);
  if (!res) return;

  displaySuccess(`Successfully imported project ${json.value.projectTitle}`);
  router.push("/dialogues");

  open.value = false;
}
function onCancel() {
  open.value = false;
}

async function handleFileUpload(file: File | null): Promise<void> {
  if (!file) return;
  try {
    const txt = await file.text();
    json.value = JSON.parse(txt);
  } catch (err) {
    console.error(`Error importing project: ${err}`);
    displayError("An error occurred importing your project");
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    json.value = undefined;
  }
});
</script>

<template>
  <UModal v-model:open="open" title="Import project">
    <template #body>
      <UFileUpload
        icon="mdi:import"
        type="file"
        accept=".json,application/json"
        label="Drop your project file here"
        description="Your project file is a JSON file containing an entire project."
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

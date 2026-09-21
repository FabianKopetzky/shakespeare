<script setup lang="ts">
import { ref, watch } from "vue";
import { useWidget } from "../../composables/widget";
import { useTranslationMapping } from "../../composables/translationMapping";
import { useContentStore } from "../../stores/content";

const open = defineModel<boolean>("open", { default: false });

const { exportTranslationMap } = useTranslationMapping();
const { displaySuccess } = useWidget();
const { projectTitle } = useContentStore();

const placeholder = ref<string>("");
const separator = ref<string>(";");

watch(open, (isOpen) => {
  if (isOpen) {
    placeholder.value = "";
    separator.value = ";";
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

  exportTranslationMap(placeholder.value, separator.value);
  displaySuccess(
    `Sucessfully exported translation map for project ${projectTitle}`,
  );
  open.value = false;
}
function onCancel() {
  open.value = false;
}
</script>

<template>
  <UModal v-model:open="open" title="Export translation map">
    <template #body>
      <div class="flex flex-row gap-2 w-full">
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

<script setup lang="ts">
import { ref, watch } from "vue";
import { useProjectHandler } from "../../composables/projectHandler";
import { useWidget } from "../../composables/widget";
import { useRouter } from "vue-router";

const open = defineModel<boolean>("open", { default: false });
const router = useRouter();

const { createProject } = useProjectHandler();

const title = ref<string>("");
const author = ref<string>("");

watch(open, (isOpen) => {
  if (isOpen) {
    author.value = "";
    title.value = ";";
  }
});

const { displayError, displaySuccess } = useWidget();

async function onConfirm() {
  if (!title.value) {
    displayError("Project title cannot be empty");
    return;
  }
  if (!/^[A-Za-z0-9_]+$/.test(title.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed for the project title",
    );
    return;
  }
  if (!author.value) {
    displayError("Project author cannot be empty");
    return;
  }

  const res = await createProject(title.value, author.value);
  if (!res) return;

  displaySuccess(`Successfully created project ${title.value}`);
  router.push("/stories");

  title.value = "";
  author.value = "";

  open.value = false;
}
function onCancel() {
  open.value = false;
}
</script>

<template>
  <UModal v-model:open="open" title="Create new project">
    <template #body>
      <div class="flex flex-col gap-3">
        <UFormField class="w-full" label="Project title">
          <UInput class="w-full" v-model="title" />
        </UFormField>
        <UFormField class="w-full" label="Project author">
          <UInput class="w-full" v-model="author" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="onCancel">
          Cancel
        </UButton>
        <UButton @click="onConfirm">Create project</UButton>
      </div>
    </template>
  </UModal>
</template>

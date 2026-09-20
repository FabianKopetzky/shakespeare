<script setup lang="ts">
import { ref, watch } from "vue";
import { useProjectHandler } from "../../composables/projectHandler";
import { useWidget } from "../../composables/widget";
import { useRouter } from "vue-router";
import type { FormMode } from "../../types/schema";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app";
import { useContentStore } from "../../stores/content";

interface Props {
  mode?: FormMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "Create",
});

const open = defineModel<boolean>("open", { default: false });
const router = useRouter();

const { projectLoaded, isNativeApp } = storeToRefs(useAppStore());
const { projectTitle, projectAuthor } = storeToRefs(useContentStore());

const { createProject, renameCurrentProject } = useProjectHandler();
const { displayError, displaySuccess } = useWidget();

const title = ref<string>("");
const author = ref<string>("");

const showUpdateConfirm = ref<boolean>(false);
const MAX_TITLE_LENGTH = 100;
const RESERVED_FILENAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

watch(open, (isOpen) => {
  if (isOpen) {
    showUpdateConfirm.value = false;
    if (props.mode !== "Create" && projectLoaded.value) {
      author.value = projectAuthor.value;
      title.value = projectTitle.value;
    } else {
      author.value = "";
      title.value = "";
    }
  }
});

//* VALIDATION

function validate(): boolean {
  if (!title.value) {
    displayError("Project title cannot be empty");
    return false;
  }
  if (title.value.length > MAX_TITLE_LENGTH) {
    displayError(
      `Project title is too long (max. ${MAX_TITLE_LENGTH} characters)`,
    );
    return false;
  }
  if (!/^[A-Za-z0-9_]+$/.test(title.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed for the project title",
    );
    return false;
  }
  if (RESERVED_FILENAMES.test(title.value)) {
    displayError(`'${title.value}' is a reserved name and cannot be used`);
    return false;
  }
  if (!author.value.trim()) {
    displayError("Project author cannot be empty");
    return false;
  }
  return true;
}

//* ACTIONS
function onSubmit(): void {
  if (props.mode === "Create") {
    onConfirm();
  } else {
    onUpdate();
  }
}

async function onConfirm(): Promise<void> {
  if (!validate()) return;

  const res = await createProject(title.value, author.value.trim());
  if (!res) return;

  displaySuccess(`Successfully created project ${title.value}`);
  router.push("/");

  title.value = "";
  author.value = "";

  open.value = false;
}

function onUpdate(): void {
  if (!validate()) return;

  if (
    title.value === projectTitle.value &&
    author.value.trim() === projectAuthor.value
  ) {
    open.value = false;
    return;
  }

  showUpdateConfirm.value = true;
}

async function confirmUpdateProject(): Promise<void> {
  const res = await renameCurrentProject(title.value, author.value.trim());
  if (!res) return;

  open.value = false;
}

function onCancel() {
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.mode === 'Create' ? 'Create new project' : 'Update project'">
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
        <UButton @click="onSubmit">{{
          props.mode === "Create" ? "Create project" : "Update project"
        }}</UButton>
      </div>
    </template>
  </UModal>
  <ConfirmDialog
    v-model:open="showUpdateConfirm"
    title="Confirm update"
    :description="`Are you sure you want to update the project ${projectTitle} by ${projectAuthor} to ${title} by ${author}? ${isNativeApp ? 'The local files on your machine will also be renamed to reflect the new name. ' : ''}Verify your unity implementation and recompile the project.`"
    confirm-label="Update"
    color="primary"
    icon="material-symbols:edit-sharp"
    @confirm="confirmUpdateProject" />
</template>

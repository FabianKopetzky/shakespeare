<template>
  <USlideover v-model:open="isOpen" :dismissible="false">
    <template #header>
      <SlideoverHeader :title="editorTitle" @close="close" @save="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection label="Properties" />
        <div class="mb-4 flex flex-row justify-center items-start gap-4">
          <UFormField class="flex-1" label="ID">
            <UInput
              v-model="storyKey"
              :leading="true"
              :maxlength="64"
              :disabled="props.mode !== 'Create'"
              class="w-full"
              :class="{ 'opacity-40': props.mode === 'Update' }" />
          </UFormField>
          <UFormField class="flex-2" label="Description (internal)">
            <UInput
              v-model="storyDescription"
              :disabled="props.mode === 'Read'"
              maxlength="400"
              class="w-full" />
          </UFormField>
        </div>

        <div>
          <div v-for="fieldSchema in getCustomFieldsForModel('story')">
            <FieldInstanceInput
              @submit="
                (value) => {
                  const field = customFields?.data?.find(
                    (f) => f.name === fieldSchema.name,
                  );
                  if (field) {
                    field.value = value;
                  }
                }
              "
              :schema="fieldSchema"
              :default-value="
                customFields?.data?.find((f) => f.name === fieldSchema.name)
                  ?.value ?? undefined
              " />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import {
  type CustomFields,
  type FormMode,
  type Story,
} from "../../types/schema.ts";
import { useContentStore } from "../../stores/content.ts";
import { useWidget } from "../../composables/widget.ts";
import { useRouter } from "vue-router";
import { useCustomFieldsUtils } from "../../utils/customFieldsUtils.ts";
import FieldInstanceInput from "../forms/FieldInstanceInput.vue";

const { displayError } = useWidget();
const router = useRouter();

const { getCustomFieldsForModel, createDefaultFieldsForModel } =
  useCustomFieldsUtils();

interface Props {
  story?: Story;
  mode: FormMode;
}
const props = defineProps<Props>();

const isOpen = defineModel<boolean>("isOpen", { required: true });

watch(isOpen, (open) => {
  if (!open) return;
  storyKey.value = props.story?.id ?? "";
  storyDescription.value = props.story?.description ?? "";
  customFields.value =
    props.story?.fields ?? createDefaultFieldsForModel("story");
});

const { stories } = useContentStore();

const storyKey = ref<string>("");
const storyDescription = ref<string>("");
const customFields = ref<CustomFields>();

const editorTitle = computed(() => {
  switch (props.mode) {
    case "Create":
      return "Create new story";
    case "Read":
      return `Story ${props.story?.id}`;
    case "Update":
      return `Update ${props.story?.id}`;
  }
});

function save(): void {
  if (!storyKey.value || storyKey.value.length <= 0) {
    displayError("The ID of a story cannot be null!");
    return;
  }
  if (!/^[A-Za-z0-9_]+$/.test(storyKey.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed for the story key!",
    );
    return;
  }
  if (
    props.mode === "Create" &&
    stories.find((s) => s?.id === storyKey.value)
  ) {
    displayError(`A story with the ID "${storyKey.value}" already exists!`);
    return;
  }

  upsertStory();
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

async function upsertStory() {
  const newStory: Story = {
    id: storyKey.value,
    description: storyDescription.value,
    entryNodeId: null,
    nodes: props.story?.nodes ?? [],
    fields: customFields.value ?? createDefaultFieldsForModel("story"),
  };

  if (props.mode === "Update" && props.story) {
    const index = stories.findIndex((s) => s?.id === props.story!.id);
    if (index !== -1) {
      stories[index] = newStory;
      return;
    }
  }
  stories.push(newStory);
  await nextTick();
  router.push(`/stories/${newStory.id}`);
}
</script>

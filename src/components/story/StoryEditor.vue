<template>
  <USlideover v-model:open="isOpen" :dismissible="false">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">{{ editorTitle }}</p>
        <div class="flex flex-row gap-2">
          <UButton
            color="neutral"
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="close">
            <UIcon class="size-12" name="material-symbols:close" />
          </UButton>
          <UButton
            v-if="props.mode !== 'Read'"
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="save">
            <UIcon class="size-12" name="material-symbols:check" />
          </UButton>
        </div>
      </div>
    </template>
    <template #body>
      <div class="h-full">
        <div class="mb-4">
          <span class="font-bold">Story ID</span>
          <UInput
            v-model="storyKey"
            icon="material-symbols:key-rounded"
            :leading="true"
            :maxlength="64"
            :disabled="props.mode !== 'Create'"
            class="w-full mt-2"
            :class="{ 'opacity-40': props.mode === 'Update' }" />
        </div>
        <div class="mb-4">
          <span class="font-bold"
            >Description<span class="text-sm opacity-50">
              (internal)</span
            ></span
          >
          <UTextarea
            v-model="storyDescription"
            maxlength="400"
            class="w-full mt-2" />
        </div>

        <USeparator
          class="h-4"
          orientation="horizontal"
          type="solid"
          size="sm" />

        <div class="mb-4 pl-8 mt-4"></div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import type { FormMode, Story } from "../../types/schema.ts";
import { useContentStore } from "../../stores/content.ts";
import { useWidget } from "../../composables/widget.ts";
import { useRouter } from "vue-router";

const { displayError } = useWidget();
const router = useRouter();

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
});

const { stories } = useContentStore();

const storyKey = ref<string>("");
const storyDescription = ref<string>("");

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
    nodes: [],
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

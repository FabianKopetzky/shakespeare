<template>
  <div class="flex flex-row gap-4 h-10 justify-start items-center bg-elevated">
    <div
      class="ml-2 flex flex-row gap-2 h-full w-full items-center justify-start">
      <UIcon class="h-6 w-6" :name="fieldMeta.dialogue.icon" />
      <p class="font-semibold">{{ node?.id }}</p>
      <UTooltip
        :text="props.node?.description"
        :content="{ side: 'bottom', sideOffset: 12, collisionPadding: 8 }"
        :arrow="true"
        :delayDuration="50"
        :ui="{ content: 'max-w-5xl whitespace-normal text-wrap' }"
        ><p class="text-dimmed text-sm hover:cursor-pointer">
          {{ descriptionPreview }}
        </p></UTooltip
      >
    </div>
    <div class="flex flex-row">
      <div
        v-if="!fullyTranslated"
        class="flex flex-row items-center justify-start mr-4 bg-warning/10 px-2 my-1">
        <UIcon
          class="h-5 w-5 text-warning mr-2"
          name="material-symbols:chat-error-sharp" />
        <p class="text-warning text-sm whitespace-nowrap">
          Missing translations!
        </p>
      </div>
      <div class="flex flex-row items-center justify-start mr-4">
        <UIcon
          class="h-5 w-5 text-dimmed mr-2"
          :name="fieldMeta.dialogue_sentence.icon" />
        <p class="text-dimmed text-sm whitespace-nowrap">
          {{ props.node?.sentences.length }}
          {{ props.node?.sentences.length === 1 ? "sentence" : "sentences" }}
        </p>
      </div>
      <UButton
        @click="emit('edit')"
        variant="ghost"
        color="secondary"
        class="aspect-square h-10 w-auto"
        :ui="{ base: 'flex items-center justify-center' }"
        icon="material-symbols:edit-sharp" />
      <UButton
        @click="showDeleteDialog = true"
        variant="ghost"
        icon="material-symbols:delete-outline-sharp"
        class="aspect-square h-10 w-auto"
        :ui="{ base: 'flex items-center justify-center' }"
        color="error" />
    </div>
  </div>
  <ConfirmDialog
    v-model:open="showDeleteDialog"
    title="Delete dialogue"
    :description="`Are you sure you want to delete '${props.node?.id}'? This cannot be undone.`"
    confirm-label="Delete"
    color="error"
    icon="material-symbols:delete-outline"
    @confirm="emit('delete')" />
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { DialogueNode } from "../../types/schema";
import { useConditionUtils } from "../../utils/conditionUtils";
import { storeToRefs } from "pinia";
import { useContentStore } from "../../stores/content";

const { fieldMeta } = useConditionUtils();
const { languages, settings } = storeToRefs(useContentStore());

interface Props {
  node: DialogueNode;
}
const emit = defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
}>();
const showDeleteDialog = ref<boolean>(false);
const props = defineProps<Props>();

const MAX_DESCRIPTION_CHARS = 20;
const descriptionPreview = computed(() => {
  if (!props.node?.description) return "";
  return props.node?.description?.length >= MAX_DESCRIPTION_CHARS
    ? props.node?.description.substring(0, MAX_DESCRIPTION_CHARS - 3) + "..."
    : props.node?.description;
});

const fullyTranslated = computed<boolean>(() => {
  if (!settings.value.showMissingTranslations) return true;
  if (!props.node?.sentences) return false;

  for (const s of props.node?.sentences) {
    for (const l of languages.value) {
      if (!s.translations[l.code]) return false;
    }
  }
  return true;
});
</script>

<template>
  <div class="flex flex-row justify-between items-center w-full">
    <h3>{{ props.title }}</h3>
    <div class="flex flex-row gap-2">
      <UButton
        variant="soft"
        color="secondary"
        class="h-12 w-12"
        :ui="{ base: 'flex items-center justify-center' }"
        icon="material-symbols:close"
        @click="showCancelConfirmation = true">
      </UButton>
      <UButton
        v-if="props.mode !== 'Read'"
        variant="solid"
        color="primary"
        class="h-12 w-12"
        :ui="{ base: 'flex items-center justify-center' }"
        icon="material-symbols:check"
        @click="emit('save')">
      </UButton>
    </div>
  </div>
  <ConfirmDialog
    v-model:open="showCancelConfirmation"
    title="Discard changes?"
    description="Are you sure that you want to discard all changes made to this item?"
    confirm-label="Discard changes"
    cancel-label="Back to editing"
    @cancel="showCancelConfirmation = false"
    @confirm="emit('close')" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import type { FormMode } from "../../types/schema";
import ConfirmDialog from "../forms/ConfirmDialog.vue";

interface Props {
  title: string;
  mode: FormMode;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const showCancelConfirmation = ref<boolean>(false);
</script>

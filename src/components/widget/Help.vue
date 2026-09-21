<template>
  <UButton
    @click="showHelp = true"
    variant="ghost"
    icon="material-symbols:question-mark"
    class="aspect-square h-8 w-auto"
    :ui="{ base: 'flex items-center justify-center' }"
    color="secondary" />

  <UModal v-model:open="showHelp" :title="props.title">
    <template #body>
      <div class="flex flex-row gap-4 items-start">
        <div v-html="props.messageHtml" />
      </div>
    </template>

    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="showHelp = false">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { ref } from "vue";

interface Props {
  title: string;
  messageHtml: string;
}
const props = defineProps<Props>();

const showHelp = ref<boolean>(false);
</script>

<template>
  <div
    class="min-w-80 w-80 h-50 perspective-distant group"
    @click="flipped = !flipped">
    <div
      class="relative w-full h-full transition-transform duration-500 transform-3d cursor-pointer"
      :class="flipped ? 'transform-[rotateY(180deg)]' : ''">
      <div
        class="absolute inset-0 backface-hidden bg-muted border border-default hover:border-accented transition-colors duration-200 p-4 flex flex-col">
        <div class="flex flex-row items-center justify-start gap-4 mb-4">
          <UIcon
            class="size-9 text-dimmed group-hover:text-toned duration-200"
            :name="props.icon" />
          <span
            class="select-none text-dimmed group-hover:text-toned duration-200 text-3xl font-semibold font-serif"
            >{{ props.title }}</span
          >
        </div>
        <span class="select-none text-dimmed">{{ props.content }}</span>
      </div>

      <div
        class="absolute inset-0 backface-hidden transform-[rotateY(180deg)] bg-muted border border-default hover:border-accented transition-colors duration-200 p-4 flex flex-col justify-center">
        <span class="select-none text-dimmed">{{ props.backsideContent }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  icon: string;
  title: string;
  content: string;
  backsideContent: string;
}

const props = defineProps<Props>();
const flipped = ref<boolean>(false);
</script>

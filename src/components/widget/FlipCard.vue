<template>
  <div
    class="bg-muted border border-default hover:border-accented hover:cursor-pointer hover:-translate-y-2 transition-all duration-200 min-w-80 w-80 h-50 p-4 group">
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
</template>
<script setup lang="ts">
interface Props {
  icon: string;
  title: string;
  content: string;
}

const props = defineProps<Props>();
</script>

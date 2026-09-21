<template>
  <div
    class="w-35 h-auto aspect-square border border-accented bg-muted flex flex-col items-center justify-center">
    <span class="select-none text-toned font-bold text-4xl">{{
      props.count
    }}</span>
    <div class="flex flex-row items-center justify-center gap-2">
      <UIcon class="select-none text-dimmed" :name="props.icon" />
      <span class="select-none text-dimmed">{{ props.title }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  icon: string;
  title: string;
  count: number;
}
const props = defineProps<Props>();
</script>

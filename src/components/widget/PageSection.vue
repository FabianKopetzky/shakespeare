<template>
  <div
    class="w-full h-14 bg-elevated flex flex-row items-center justify-start mb-4 mt-12">
    <div class="h-full w-2 bg-primary" />
    <h3 class="ml-4">{{ props.title }}</h3>
  </div>
</template>
<script setup lang="ts">
interface Props {
  title: string;
}
const props = defineProps<Props>();
</script>

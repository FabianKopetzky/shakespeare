<template>
  <div
    class="w-full h-10 bg-elevated flex flex-row items-between justify-between mb-4">
    <div class="h-10 flex flex-row items-center justify-start">
      <div class="h-full w-2" :class="props.stripeColor" />
      <p class="ml-4 font-serif text-2xl font-semibold">{{ props.label }}</p>
    </div>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
interface Props {
  label: string;
  stripeColor?: string;
}
const props = withDefaults(defineProps<Props>(), {
  stripeColor: "bg-accented",
});
</script>

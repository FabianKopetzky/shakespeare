<template>
  <UModal
    v-model:open="open"
    title="Project List"
    :ui="{ content: 'max-w-2xl' }">
    <template #body> </template
  ></UModal>
</template>
<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });
</script>

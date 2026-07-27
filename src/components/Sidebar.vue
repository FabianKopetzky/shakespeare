<script setup lang="ts">
import TabButton from "./widget/TabButton.vue";
</script>

<template>
  <aside class="flex flex-col justify-start items-center px-0 pt-40">
    <TabButton tooltip="Home" icon="ic:round-home" link="/" />
    <TabButton
      tooltip="Schema"
      icon="tdesign:data-base-filled"
      link="/schema" />
    <TabButton tooltip="Dialogue" icon="mdi:dialogue" link="/dialogues" />
    <TabButton tooltip="Stories" icon="boxicons:book-filled" link="/stories" />
    <TabButton
      tooltip="Settings"
      icon="material-symbols:settings"
      link="/settings" />
    <TabButton tooltip="Export" icon="ix:export" link="/export" />
  </aside>
</template>

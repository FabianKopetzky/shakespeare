<script setup lang="ts">
import TabButton from "./widget/TabButton.vue";
</script>

<template>
  <aside class="flex flex-col justify-start items-center px-0 pt-40 bg-muted">
    <TabButton tooltip="Home" icon="material-symbols:home-sharp" link="/" />
    <TabButton
      tooltip="Schema"
      icon="material-symbols:database-sharp"
      link="/schema" />
    <TabButton
      tooltip="Dialogue"
      icon="material-symbols:forum-sharp"
      link="/dialogues" />
    <TabButton
      tooltip="Stories"
      icon="material-symbols:import-contacts-sharp"
      link="/stories" />
    <TabButton
      tooltip="Settings"
      icon="material-symbols:settings-sharp"
      link="/settings" />
    <TabButton
      tooltip="Export"
      icon="material-symbols:code-sharp"
      link="/export" />
  </aside>
</template>

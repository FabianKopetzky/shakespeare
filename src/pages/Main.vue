<script setup lang="ts">
import Title from "../components/widget/Title.vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/app";
import ProjectOverview from "../components/widget/ProjectOverview.vue";

const { projectLoaded } = storeToRefs(useAppStore());
</script>

<template>
  <ProjectOverview v-if="projectLoaded" />
  <Title v-else />
</template>

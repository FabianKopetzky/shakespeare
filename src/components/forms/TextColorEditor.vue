<script setup lang="ts">
import { useContentStore } from "../../stores/content";
import type { TextColor } from "../../types/schema";
import TextColorInput from "./TextColorInput.vue";
import TextColorItem from "./TextColorItem.vue";

const { textColors } = useContentStore();

function addNewColor(color: TextColor) {
  textColors.push(color);
}
function editColor(color: TextColor) {
  const idx = textColors.findIndex((c) => c.name == color.name);
  if (idx >= 0 && idx < textColors.length) {
    textColors[idx] = color;
  }
}
function deleteColor(name: string) {
  const idx = textColors.findIndex((c) => c.name == name);
  if (idx >= 0) {
    textColors.splice(idx, 1);
  }
}
</script>

<template>
  <h2>Text Colors</h2>

  <template v-if="textColors.length > 0">
    <div v-for="color in textColors" :key="color.name">
      <TextColorItem @edit="editColor" @delete="deleteColor" :color="color" />
    </div>
  </template>
  <template v-else>
    <p>There are no text colors defined...</p>
  </template>

  <USeparator class="my-8" />

  <TextColorInput @submit="addNewColor" :color="undefined" mode="Create" />
</template>

<template>
  <UTooltip
    :text="props.tooltip"
    :content="{ side: 'right', sideOffset: 12, collisionPadding: 8 }"
    :arrow="true"
    :delayDuration="50">
    <UButton
      @click="router.push(props.link)"
      :color="isActive ? 'primary' : 'secondary'"
      :variant="isActive ? 'solid' : 'ghost'"
      class="w-full h-auto aspect-square flex items-center justify-center rounded-none">
      <UIcon :name="props.icon" class="size-9" />
    </UButton>
  </UTooltip>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

interface Props {
  icon: string;
  tooltip: string;
  link: string;
}
const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();

const isActive = computed(() =>
  props.link === "/" ? route.path === "/" : route.path.startsWith(props.link),
);
</script>

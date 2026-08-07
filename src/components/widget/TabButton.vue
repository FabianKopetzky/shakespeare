<template>
  <UTooltip
    :text="props.tooltip"
    :content="{ side: 'right', sideOffset: 0, collisionPadding: 8 }"
    :arrow="true"
    :delayDuration="50"
    :ui="{
      content: 'h-9 px-4 py-2 text-base',
      arrow: 'scale-150',
    }">
    <UButton
      @click="router.push(props.link)"
      color="neutral"
      variant="ghost"
      class="w-full h-auto aspect-square flex items-center justify-center rounded-none">
      <UIcon :name="props.icon" class="size-9" />
    </UButton>
  </UTooltip>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";

interface Props {
  icon: string;
  tooltip: string;
  link: string;
}
const props = defineProps<Props>();
const router = useRouter();
</script>

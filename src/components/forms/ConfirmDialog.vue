<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  color?: "error" | "primary" | "warning" | "neutral";
  icon?: string;
}

withDefaults(defineProps<Props>(), {
  title: "Are you sure?",
  description: "This action cannot be undone.",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  color: "error",
  icon: "material-symbols:warning-outline",
});

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

function onConfirm() {
  open.value = false;
  emit("confirm");
}
function onCancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <UModal v-model:open="open" :title="title">
    <template #body>
      <div class="flex flex-row gap-4 items-start">
        <UIcon
          :name="icon"
          class="text-2xl mt-1"
          :class="`text-${color}-500`" />
        <p>{{ description }}</p>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="onCancel">
          {{ cancelLabel }}
        </UButton>
        <UButton :color="color" @click="onConfirm">
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { FormMode, TextColor } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";

interface Props {
  mode: FormMode;
  color: TextColor | undefined;
}
const props = defineProps<Props>();

const { displayError } = useWidget();
const { textColors } = useContentStore();

const colorName = ref<string>("");
const colorDisplay = ref<string>("");
const colorHex = ref<string>("#000000");

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;
const HEX_PATTERN = /^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

onMounted(() => {
  if (props.mode === "Update" && props.color) {
    colorName.value = props.color.name;
    colorDisplay.value = props.color.display;
    colorHex.value = props.color.hex;
  }
});

const emit = defineEmits<{
  (e: "submit", color: TextColor): void;
}>();

// UColorPicker keeps its own internal state format; when typing manually
// into the UInput we validate on submit, so no live sync guard is needed
// beyond keeping both bound to the same ref.

function submit() {
  if (!colorName.value || colorName.value.length <= 0) {
    displayError("Color name cannot be empty!");
    return;
  }
  if (!NAME_PATTERN.test(colorName.value)) {
    displayError(
      "Color name can only contain letters and numbers, and must start with a letter!",
    );
    return;
  }
  if (!colorDisplay.value || colorDisplay.value.length <= 0) {
    displayError("Display name cannot be empty!");
    return;
  }
  if (!colorHex.value || colorHex.value.length <= 0) {
    displayError("Hex value cannot be empty!");
    return;
  }
  if (!HEX_PATTERN.test(colorHex.value)) {
    displayError("Hex value must be a valid hex color, e.g. #A1B2C3 or #FFF!");
    return;
  }

  if (
    props.mode === "Create" &&
    textColors.find((c) => c.name == colorName.value)
  ) {
    displayError("A text color with this name already exists!");
    return;
  }

  emit("submit", {
    name: colorName.value,
    display: colorDisplay.value,
    hex: colorHex.value,
  });
  clear();
}

function clear() {
  if (props.mode === "Create") {
    colorName.value = "";
  }
  colorDisplay.value = "";
  colorHex.value = "#000000";
}
</script>

<template>
  <div class="flex flex-row gap-4 mt-12 items-end">
    <UFormField label="Color Name" help="Unique identifier of the color.">
      <UInput :disabled="props.mode !== 'Create'" v-model="colorName" />
    </UFormField>
    <UFormField label="Display" help="How the color is displayed.">
      <UInput v-model="colorDisplay" />
    </UFormField>
    <UFormField label="Hex" help="e.g. #A1B2C3">
      <div class="flex flex-row gap-2 items-center">
        <UPopover :content="{ updatePositionStrategy: 'optimized' }">
          <UButton
            variant="outline"
            color="neutral"
            class="w-8 h-8 p-0 rounded-full"
            :style="{
              backgroundColor: HEX_PATTERN.test(colorHex)
                ? colorHex
                : 'transparent',
            }" />

          <template #content>
            <div @pointerdown.stop @mousedown.stop @touchstart.stop>
              <UColorPicker v-model="colorHex" format="hex" class="p-3" />
            </div>
          </template>
        </UPopover>
        <UInput v-model="colorHex" placeholder="#RRGGBB" class="w-28" />
      </div>
    </UFormField>
    <UButton @click="submit">{{
      props.mode === "Create" ? "Add" : "Update"
    }}</UButton>
  </div>
</template>

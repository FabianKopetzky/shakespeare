<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { FormMode, TextColor } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";

interface Props {
  mode: FormMode;
  color: TextColor | undefined;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { textColors } = useContentStore();

const colorName = ref<string>("");
const colorHex = ref<string>("#000000");

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;
const HEX_PATTERN = /^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

onMounted(() => {
  if (props.mode === "Update" && props.color) {
    colorName.value = props.color.name;
    colorHex.value = props.color.hex;
  }
});

const emit = defineEmits<{
  (e: "submit", color: TextColor): void;
}>();

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      colorName.value = props.color?.name ?? "";
      colorHex.value = props.color?.hex ?? "#000000";
    }
  }
});

// UColorPicker keeps its own internal state format; when typing manually
// into the UInput we validate on submit, so no live sync guard is needed
// beyond keeping both bound to the same ref.

function submit() {
  if (!colorName.value || colorName.value.length <= 0) {
    displayError("Color name cannot be empty!");
    return;
  }
  if (colorName.value.length >= 20) {
    displayError("Variable name cannot be larger than 19 characters");
    return;
  }
  if (!NAME_PATTERN.test(colorName.value)) {
    displayError(
      "Color name can only contain letters and numbers, and must start with a letter!",
    );
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
    hex: colorHex.value,
  });
  clear();
  open.value = false;
}

function clear() {
  colorName.value = "";
  colorHex.value = "#000000";
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.mode === 'Create' ? 'Add text color' : 'Edit text color'">
    <template #body>
      <div class="flex flex-col gap-4 items-start">
        <UFormField
          class="w-full"
          label="Color Name"
          help="Unique identifier of the color.">
          <UInput
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="colorName" />
        </UFormField>
        <UFormField class="w-full">
          <div class="flex flex-row gap-2 items-center">
            <UPopover :content="{ updatePositionStrategy: 'optimized' }">
              <UButton
                variant="outline"
                color="neutral"
                class="w-8 h-8 p-0"
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
            <UInput v-model="colorHex" placeholder="#RRGGBB" class="w-full" />
          </div>
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="open = false">
          Cancel
        </UButton>
        <UButton @click="submit">{{
          props.mode === "Create" ? "Add" : "Update"
        }}</UButton>
      </div>
    </template>
  </UModal>
</template>

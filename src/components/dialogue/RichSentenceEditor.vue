<script setup lang="ts">
import { computed, nextTick, reactive, ref } from "vue";
import type { TemplatingVariable, TextColor } from "../../types/schema";
import { useWidget } from "../../composables/widget.ts";
import { parseContent, validateContent } from "../../utils/dialogueContent";
import { getCaretCoordinates } from "../../utils/caretCoordinates";
import ContentNodeRenderer from "./ContentNodeRenderer.vue";

const HEX_PATTERN = /^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

interface Props {
  modelValue: string;
  variables: TemplatingVariable[];
  colors?: TextColor[];
  placeholder?: string;
  viewMode: "edit" | "preview"; // now controlled by the parent (global toggle)
}
const props = withDefaults(defineProps<Props>(), {
  colors: () => [],
  placeholder: "Type sentence content...",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const { displayError } = useWidget();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const pendingColor = ref<string>("#000000");

const previewNodes = computed(() => parseContent(props.modelValue ?? ""));
const liveWarnings = computed(() =>
  validateContent(props.modelValue ?? "", props.variables),
);

function updateValue(newValue: string) {
  emit("update:modelValue", newValue);
}

// --- toolbar helpers: these just insert/wrap plain syntax text, the same
// syntax the user could type by hand. They're a convenience, not a
// separate representation. ---

function wrapSelection(before: string, after: string) {
  const el = textareaRef.value;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  if (start === end) {
    displayError("Select some text first.");
    return;
  }
  const value = props.modelValue ?? "";
  const selected = value.slice(start, end);
  const newValue =
    value.slice(0, start) + before + selected + after + value.slice(end);
  updateValue(newValue);
  nextTick(() => {
    el.focus();
    el.setSelectionRange(start + before.length, end + before.length);
  });
}

function insertAtCursor(text: string) {
  const el = textareaRef.value;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const value = props.modelValue ?? "";
  const newValue = value.slice(0, start) + text + value.slice(end);
  updateValue(newValue);
  const pos = start + text.length;
  nextTick(() => {
    el.focus();
    el.setSelectionRange(pos, pos);
  });
}

function applyBold() {
  wrapSelection("<b>", "</b>");
}
function applyItalic() {
  wrapSelection("<i>", "</i>");
}
function applyColor(hex: string) {
  if (!HEX_PATTERN.test(hex)) {
    displayError("Invalid color value.");
    return;
  }
  wrapSelection(`<color=${hex}>`, "</color>");
}

const variableMenuValue = ref<string | null>(null);
const variableMenuItems = computed(() =>
  props.variables.map((v) => ({ label: v.name, value: v.name })),
);
function onVariableMenuSelect(name: string | null) {
  if (!name) return;
  insertAtCursor(`{{ ${name} }}`);
  variableMenuValue.value = null;
}

// --- "{{" autocomplete, driven off the textarea's own selection/caret ---
const autocomplete = reactive({
  visible: false,
  items: [] as TemplatingVariable[],
  activeIndex: 0,
  top: 0,
  left: 0,
  matchStart: 0,
  matchEnd: 0,
});

function closeAutocomplete() {
  autocomplete.visible = false;
}

function updateAutocomplete() {
  const el = textareaRef.value;
  if (!el) return closeAutocomplete();

  const caret = el.selectionStart;
  const textBeforeCaret = el.value.slice(0, caret);
  const match = /\{\{\s*([A-Za-z0-9]*)$/.exec(textBeforeCaret);
  if (!match) return closeAutocomplete();

  const query = match[1].toLowerCase();
  const items = props.variables.filter((v) =>
    v.name.toLowerCase().startsWith(query),
  );
  if (items.length === 0) return closeAutocomplete();

  autocomplete.items = items;
  autocomplete.activeIndex = 0;
  autocomplete.matchStart = caret - match[0].length;
  autocomplete.matchEnd = caret;

  const coords = getCaretCoordinates(el, caret);
  autocomplete.top = coords.top + coords.height + 4;
  autocomplete.left = coords.left;
  autocomplete.visible = true;
}

function acceptAutocomplete(index: number = autocomplete.activeIndex) {
  const item = autocomplete.items[index];
  const el = textareaRef.value;
  if (!item || !el) return;

  const value = props.modelValue ?? "";
  const insertion = `{{ ${item.name} }}`;
  const newValue =
    value.slice(0, autocomplete.matchStart) +
    insertion +
    value.slice(autocomplete.matchEnd);
  updateValue(newValue);
  closeAutocomplete();

  const pos = autocomplete.matchStart + insertion.length;
  nextTick(() => {
    el.focus();
    el.setSelectionRange(pos, pos);
  });
}

function onInput(e: Event) {
  updateValue((e.target as HTMLTextAreaElement).value);
  updateAutocomplete();
}

function onKeydown(e: KeyboardEvent) {
  if (!autocomplete.visible) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    autocomplete.activeIndex =
      (autocomplete.activeIndex + 1) % autocomplete.items.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    autocomplete.activeIndex =
      (autocomplete.activeIndex - 1 + autocomplete.items.length) %
      autocomplete.items.length;
  } else if (e.key === "Tab" || e.key === "Enter") {
    e.preventDefault();
    acceptAutocomplete();
  } else if (e.key === "Escape") {
    closeAutocomplete();
  }
}
</script>

<template>
  <div class="w-full">
    <div
      v-if="viewMode === 'edit'"
      class="flex flex-row gap-2 items-center mb-2">
      <UButton
        icon="material-symbols:format-bold"
        variant="ghost"
        color="neutral"
        size="xs"
        title="Wrap selection in <b></b>"
        @click="applyBold" />
      <UButton
        icon="material-symbols:format-italic"
        variant="ghost"
        color="neutral"
        size="xs"
        title="Wrap selection in <i></i>"
        @click="applyItalic" />

      <UPopover>
        <UButton
          icon="material-symbols:format-color-text"
          variant="ghost"
          color="neutral"
          size="xs"
          title="Wrap selection in <color=#hex></color>" />
        <template #content>
          <div class="p-3 flex flex-col gap-3 w-56">
            <UColorPicker v-model="pendingColor" format="hex" />
            <div v-if="colors.length > 0" class="flex flex-wrap gap-2">
              <button
                v-for="swatch in colors"
                :key="swatch.name"
                type="button"
                class="w-6 h-6 rounded-full border border-gray-300"
                :style="{ backgroundColor: swatch.hex }"
                :title="swatch.name"
                @click="applyColor(swatch.hex)" />
            </div>
            <UButton size="xs" block @click="applyColor(pendingColor)"
              >Apply color</UButton
            >
          </div>
        </template>
      </UPopover>

      <USelectMenu
        v-model="variableMenuValue"
        :items="variableMenuItems"
        value-key="value"
        placeholder="Insert variable"
        icon="material-symbols:data-object"
        class="w-44 ml-auto"
        @update:model-value="onVariableMenuSelect" />
    </div>

    <div v-if="viewMode === 'edit'" class="relative">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md outline-none font-mono text-[0.9rem] leading-relaxed resize-y focus:border-blue-500"
        @input="onInput"
        @keydown="onKeydown"
        @keyup="updateAutocomplete"
        @click="updateAutocomplete"
        @blur="closeAutocomplete" />

      <div
        v-if="autocomplete.visible"
        class="absolute z-50 min-w-[12rem] max-h-[12rem] overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg p-1"
        :style="{
          top: `${autocomplete.top}px`,
          left: `${autocomplete.left}px`,
        }">
        <button
          v-for="(item, index) in autocomplete.items"
          :key="item.name"
          type="button"
          class="flex justify-between gap-2 w-full px-2 py-1 rounded text-left hover:bg-blue-500/10"
          :class="{ 'bg-blue-500/10': index === autocomplete.activeIndex }"
          @mousedown.prevent="acceptAutocomplete(index)">
          <span class="font-mono text-xs">{{ item.name }}</span>
          <span class="text-xs opacity-60">{{ item.placeholder }}</span>
        </button>
      </div>

      <p v-if="liveWarnings.length > 0" class="text-xs text-error-600 mt-1">
        {{ liveWarnings[0]
        }}<span v-if="liveWarnings.length > 1">
          (+{{ liveWarnings.length - 1 }} more)</span
        >
      </p>
    </div>

    <div
      v-else
      class="px-3 py-2 border border-gray-300 rounded-md min-h-[3rem] leading-relaxed">
      <ContentNodeRenderer :nodes="previewNodes" :variables="variables" />
    </div>
  </div>
</template>

<template>
  <div class="w-full flex flex-col">
    <div
      v-if="viewMode === 'edit'"
      class="flex flex-row items-start justify-between mb-2 h-7 shrink-0">
      <div class="flex flex-row gap-2 items-start">
        <UTooltip text="Wrap selection in <b></b>">
          <UButton
            icon="material-symbols:format-bold"
            variant="ghost"
            color="neutral"
            size="xs"
            @mousedown.prevent
            @click="applyBold" />
        </UTooltip>
        <UTooltip text="Wrap selection in <i></i>">
          <UButton
            icon="material-symbols:format-italic"
            variant="ghost"
            color="neutral"
            size="xs"
            @mousedown.prevent
            @click="applyItalic" />
        </UTooltip>

        <UPopover>
          <UTooltip text="Wrap selection in <color=#hex></color>">
            <UButton
              icon="material-symbols:format-color-text"
              variant="ghost"
              color="neutral"
              size="xs" />
          </UTooltip>
          <template #content>
            <div class="p-3 flex flex-col gap-3 w-56">
              <UColorPicker v-model="pendingColor" format="hex" />
              <div v-if="colors.length > 0" class="flex flex-wrap gap-2">
                <UTooltip
                  v-for="swatch in colors"
                  :text="`Apply ${swatch.name}`"
                  :delayDuration="50"
                  :content="{
                    side: 'top',
                    sideOffset: 5,
                    collisionPadding: 8,
                  }">
                  <button
                    :key="swatch.name"
                    type="button"
                    class="w-6 h-6 hover:cursor-pointer"
                    :style="{ backgroundColor: swatch.hex }"
                    @click="applyColor(swatch.name, true)" />
                </UTooltip>
              </div>
              <UButton
                size="xs"
                block
                @mousedown.prevent
                @click="applyColor(pendingColor, false)"
                >Apply color</UButton
              >
            </div>
          </template>
        </UPopover>
      </div>

      <UDropdownMenu :items="actionMenuItems">
        <UButton
          icon="material-symbols:more-vert"
          color="neutral"
          variant="ghost"
          size="xs" />
      </UDropdownMenu>
    </div>

    <div
      v-if="viewMode === 'edit'"
      class="relative flex-1 min-h-0 flex flex-col">
      <UTextarea
        ref="textareaComponentRef"
        :value="modelValue"
        :placeholder="placeholder"
        rows="3"
        autoresize
        class="w-full resize-none flex-1 min-h-full"
        @input="onInput"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @click="updateAutocomplete"
        @blur="closeAutocomplete" />

      <div
        v-if="autocomplete.visible"
        class="absolute z-50 min-w-48 max-h-48 overflow-y-auto bg-muted border border-accented rounded-none shadow-lg p-1"
        :style="{
          top: `${autocomplete.top}px`,
          left: `${autocomplete.left}px`,
        }">
        <button
          v-for="(item, index) in autocomplete.items"
          :key="`${item.kind}:${item.name}`"
          type="button"
          class="flex justify-between gap-2 w-full px-2 py-1 rounded-nome text-left hover:bg-elevated/50"
          :class="{ 'bg-elevated': index === autocomplete.activeIndex }"
          @mousedown.prevent="acceptAutocomplete(index)">
          <span class="text-xs">{{ item.label }}</span>
          <span class="text-xs opacity-60">{{ item.type }}</span>
        </button>
      </div>

      <p
        v-if="liveWarnings.length > 0"
        class="text-xs text-error mt-1 shrink-0">
        {{ liveWarnings[0]
        }}<span v-if="liveWarnings.length > 1" class="text-xs text-error">
          (+{{ liveWarnings.length - 1 }} more)</span
        >
      </p>
    </div>

    <div
      v-else
      class="flex-1 min-h-12 px-3 py-2 rounded-none! border-none! border-0! bg-muted! shadow-sm ring-1 ring-inset ring-[#4a3f30] focus:ring-1 focus:ring-inset focus:ring-[#4a3f30] outline-none transition-colors leading-relaxed">
      <ContentNodeRenderer
        :nodes="previewNodes"
        :variables="variables"
        :computedProperties="computedProperties" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from "vue";
import type {
  ComputedProperty,
  DataType,
  StoryVariable,
  TextColor,
} from "../../types/schema";
import { useWidget } from "../../composables/widget.ts";
import { parseContent, validateContent } from "../../utils/dialogueContent";
import { getCaretCoordinates } from "../../utils/caretCoordinates";
import ContentNodeRenderer from "./ContentNodeRenderer.vue";

const HEX_PATTERN = /^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export interface SentenceActionMenuItem {
  label: string;
  icon?: string;
  color?: "error" | "neutral" | "primary";
  disabled?: boolean;
  onSelect?: () => void;
}

interface Props {
  modelValue: string;
  variables: StoryVariable[];
  computedProperties?: ComputedProperty[];
  colors?: TextColor[];
  placeholder?: string;
  viewMode: "edit" | "preview";
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  extraMenuItems?: SentenceActionMenuItem[][];
}
const props = withDefaults(defineProps<Props>(), {
  computedProperties: () => [],
  colors: () => [],
  placeholder:
    "Type your text here, type {{ to enter variables and type {{ c: to type computed properties",
  canMoveUp: true,
  canMoveDown: true,
  extraMenuItems: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "remove"): void;
  (e: "move-up"): void;
  (e: "move-down"): void;
}>();

const { displayError } = useWidget();

const textareaComponentRef = ref<{
  textareaRef: HTMLTextAreaElement | null;
} | null>(null);
const textareaEl = computed(
  () => textareaComponentRef.value?.textareaRef ?? null,
);
const pendingColor = ref<string>("#000000");

const previewNodes = computed(() => parseContent(props.modelValue ?? ""));
const liveWarnings = computed(() =>
  validateContent(
    props.modelValue ?? "",
    props.variables,
    props.colors,
    props.computedProperties,
  ),
);

const actionMenuItems = computed<SentenceActionMenuItem[][]>(() => {
  const groups: SentenceActionMenuItem[][] = [
    [
      {
        label: "Move up",
        icon: "material-symbols:arrow-upward",
        disabled: !props.canMoveUp,
        onSelect: () => emit("move-up"),
      },
      {
        label: "Move down",
        icon: "material-symbols:arrow-downward",
        disabled: !props.canMoveDown,
        onSelect: () => emit("move-down"),
      },
    ],
  ];

  if (props.extraMenuItems.length > 0) {
    groups.push(...props.extraMenuItems);
  }

  groups.push([
    {
      label: "Remove",
      icon: "material-symbols:delete-outline-sharp",
      color: "error",
      onSelect: () => emit("remove"),
    },
  ]);

  return groups;
});

function updateValue(newValue: string) {
  emit("update:modelValue", newValue);
}

function wrapSelection(before: string, after: string) {
  const el = textareaEl.value;
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

// function insertAtCursor(text: string) {
//   const el = textareaEl.value;
//   if (!el) return;
//   const start = el.selectionStart;
//   const end = el.selectionEnd;
//   const value = props.modelValue ?? "";
//   const newValue = value.slice(0, start) + text + value.slice(end);
//   updateValue(newValue);
//   const pos = start + text.length;
//   nextTick(() => {
//     el.focus();
//     el.setSelectionRange(pos, pos);
//   });
// }

function applyBold() {
  wrapSelection("<b>", "</b>");
}
function applyItalic() {
  wrapSelection("<i>", "</i>");
}
function applyColor(value: string, isVariable: boolean) {
  if (isVariable && !props.colors?.find((c) => c.name === value)) {
    displayError(`Text color ${value} does not exist.`);
    return;
  } else if (!isVariable && !HEX_PATTERN.test(value)) {
    displayError("Invalid color value.");
    return;
  }
  wrapSelection(`<color=${value}>`, "</color>");
}

interface AutocompleteItem {
  kind: "variable" | "computed";
  name: string;
  label: string;
  type: DataType;
  property?: ComputedProperty;
}

const autocomplete = reactive({
  visible: false,
  items: [] as AutocompleteItem[],
  activeIndex: 0,
  top: 0,
  left: 0,
  matchStart: 0,
  matchEnd: 0,
});

function closeAutocomplete() {
  autocomplete.visible = false;
}

function computedSignature(property: ComputedProperty): string {
  const paramNames = property.params.map((p) => p.name).join(",");
  return `c:${property.name}(${paramNames})`;
}

function updateAutocomplete() {
  const el = textareaEl.value;
  if (!el) return closeAutocomplete();

  const caret = el.selectionStart;
  const textBeforeCaret = el.value.slice(0, caret);
  const match = /\{\{\s*(c:)?([A-Za-z0-9_]*)$/.exec(textBeforeCaret);
  if (!match) return closeAutocomplete();

  const isComputed = match[1] === "c:";
  const query = match[2].toLowerCase();

  const items: AutocompleteItem[] = isComputed
    ? props.computedProperties
        .filter((c) => c.name.toLowerCase().startsWith(query))
        .map((c) => ({
          kind: "computed",
          name: c.name,
          label: computedSignature(c),
          type: c.returnType,
          property: c,
        }))
    : props.variables
        .filter((v) => v.name.toLowerCase().startsWith(query))
        .map((v) => ({
          kind: "variable",
          name: v.name,
          label: v.name,
          type: v.type,
        }));

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

function buildInsertion(item: AutocompleteItem): {
  insertion: string;
  caretPos: number;
} {
  if (item.kind === "variable") {
    const insertion = `{{ ${item.name} }}`;
    return { insertion, caretPos: insertion.length };
  }

  const property = item.property!;
  if (property.params.length === 0) {
    const insertion = `{{ c:${property.name}() }}`;
    return { insertion, caretPos: insertion.length };
  }

  const paramsText = property.params.map((p) => `${p.name}:`).join(",");
  const prefix = `{{ c:${property.name}(`;
  const insertion = `${prefix}${paramsText}) }}`;
  // Land the caret right after the first "param:" so the value can be typed immediately.
  const caretPos = `${prefix}${property.params[0].name}:`.length;
  return { insertion, caretPos };
}

function acceptAutocomplete(index: number = autocomplete.activeIndex) {
  const item = autocomplete.items[index];
  const el = textareaEl.value;
  if (!item || !el) return;

  const value = props.modelValue ?? "";
  const { insertion, caretPos } = buildInsertion(item);
  const newValue =
    value.slice(0, autocomplete.matchStart) +
    insertion +
    value.slice(autocomplete.matchEnd);
  updateValue(newValue);
  closeAutocomplete();

  const pos = autocomplete.matchStart + caretPos;
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

function onKeyup(e: KeyboardEvent) {
  if (["ArrowDown", "ArrowUp", "Tab", "Enter", "Escape"].includes(e.key)) {
    return;
  }
  updateAutocomplete();
}
</script>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { FormMode, TemplatingVariable } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";

interface Props {
  mode: FormMode;
  variable: TemplatingVariable | undefined;
}
const props = defineProps<Props>();

const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { templatingVariables } = useContentStore();

const variableName = ref<string>("");
const csharpExpression = ref<string>("");
const placeholder = ref<string>("");

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

onMounted(() => {
  if (props.mode === "Update" && props.variable) {
    variableName.value = props.variable.name;
    csharpExpression.value = props.variable.csharpExpression;
    placeholder.value = props.variable.placeholder;
  }
});

const emit = defineEmits<{
  (e: "submit", variable: TemplatingVariable): void;
}>();

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      variableName.value = props.variable?.name ?? "";
      csharpExpression.value = props.variable?.csharpExpression ?? "";
      placeholder.value = props.variable?.placeholder ?? "";
    }
  }
});

function validateCsharpExpression(expr: string): string | undefined {
  const pairs: Record<string, string> = { "(": ")", "{": "}", "[": "]" };
  const closers = new Set(Object.values(pairs));
  const stack: string[] = [];
  let inString = false;
  let inChar = false;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    const prev = expr[i - 1];

    if (inString) {
      if (ch === '"' && prev !== "\\") inString = false;
      continue;
    }
    if (inChar) {
      if (ch === "'" && prev !== "\\") inChar = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "'") {
      inChar = true;
      continue;
    }
    if (ch in pairs) {
      stack.push(pairs[ch]);
    } else if (closers.has(ch)) {
      if (stack.pop() !== ch) {
        return "Mismatched brackets in expression.";
      }
    }
  }

  if (inString) return "Unterminated string literal.";
  if (inChar) return "Unterminated character literal.";
  if (stack.length > 0) return "Unclosed brackets in expression.";

  return undefined;
}

function submit() {
  if (!variableName.value || variableName.value.length <= 0) {
    displayError("Variable name cannot be empty!");
    return;
  }
  if (!NAME_PATTERN.test(variableName.value)) {
    displayError(
      "Variable name can only contain letters and numbers, and must start with a letter!",
    );
    return;
  }
  if (!csharpExpression.value || csharpExpression.value.length <= 0) {
    displayError("C# expression cannot be empty!");
    return;
  }
  if (!placeholder.value || placeholder.value.length <= 0) {
    displayError("Placeholder cannot be empty!");
    return;
  }

  if (
    props.mode === "Create" &&
    templatingVariables.find((v) => v.name == variableName.value)
  ) {
    displayError("A templating variable with this name already exists!");
    return;
  }

  const syntaxError = validateCsharpExpression(csharpExpression.value);
  if (syntaxError) {
    displayError(syntaxError);
    return;
  }

  emit("submit", {
    name: variableName.value,
    csharpExpression: csharpExpression.value,
    placeholder: placeholder.value,
  });
  clear();
  open.value = false;
}

function clear() {
  if (props.mode === "Create") {
    variableName.value = "";
  }
  csharpExpression.value = "";
  placeholder.value = "";
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.mode === 'Create' ? 'Add variable' : 'Edit variable'">
    <template #body>
      <div class="flex flex-col gap-4 justify-start items-start">
        <UFormField
          class="w-full"
          label="Variable Name"
          help="Unique identifier of the variable.">
          <UInput
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="variableName" />
        </UFormField>
        <UFormField
          class="w-full"
          label="C# Expression"
          help="Inserted verbatim into the generated C# file.">
          <UInput class="w-full" v-model="csharpExpression" />
        </UFormField>
        <UFormField
          class="w-full"
          label="Placeholder"
          help="Shown in the dialogue editor as a reference.">
          <UInput class="w-full" v-model="placeholder" />
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

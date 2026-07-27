<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { FormMode, TemplatingVariable } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";

interface Props {
  mode: FormMode;
  variable: TemplatingVariable | undefined;
}
const props = defineProps<Props>();

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
  <div class="flex flex-row gap-4 mt-12 justify-start items-center">
    <UFormField label="Variable Name" help="Unique identifier of the variable.">
      <UInput :disabled="props.mode !== 'Create'" v-model="variableName" />
    </UFormField>
    <UFormField
      label="C# Expression"
      help="Inserted verbatim into the generated C# file.">
      <UInput v-model="csharpExpression" />
    </UFormField>
    <UFormField
      label="Placeholder"
      help="Shown in the dialogue editor as a reference.">
      <UInput v-model="placeholder" />
    </UFormField>
    <UButton @click="submit">{{
      props.mode === "Create" ? "Add" : "Update"
    }}</UButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { FormMode, StoryVariable, DataType } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";
import { useConditionUtils } from "../../utils/conditionUtils";
import { storeToRefs } from "pinia";

interface Props {
  mode: FormMode;
  variable: StoryVariable | undefined;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { storyVariables } = storeToRefs(useContentStore());

const variableName = ref<string>("");
const variableType = ref<DataType>("Integer");
const variableDefault = ref<number | string | boolean>(0);

const { typeMeta } = useConditionUtils();

const typeOptions = (Object.keys(typeMeta) as DataType[]).map((t) => ({
  label: typeMeta[t].label,
  value: t,
  icon: typeMeta[t].icon,
}));

function defaultForType(type: DataType): number | string | boolean {
  if (type === "Integer") return 0;
  if (type === "Boolean") return false;
  return "";
}

function onTypeChange(type: DataType) {
  variableType.value = type;
  variableDefault.value = defaultForType(type);
}

onMounted(() => {
  if (props.mode === "Update" && props.variable) {
    variableName.value = props.variable.name;
    variableType.value = props.variable.type;
    variableDefault.value = props.variable.defaultValue;
  }
});

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      variableName.value = props.variable?.name ?? "";
      variableType.value = props.variable?.type ?? "Integer";
      variableDefault.value = props.variable?.defaultValue ?? 0;
    }
  }
});

const emit = defineEmits<{
  (e: "submit", variable: StoryVariable): void;
}>();

function submit() {
  if (!variableName.value || variableName.value.length <= 0) {
    displayError("Variable name cannot be empty");
    return;
  }
  if (variableName.value.length >= 30) {
    displayError("Variable name cannot be larger than 29 characters");
    return;
  }
  if (!/^[A-Za-z0-9_]+$/.test(variableName.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed in a variable name",
    );
    return;
  }
  if (!variableType.value || variableType.value.length <= 0) {
    displayError("No data type selected");
    return;
  }
  if (
    variableType.value === "Integer" &&
    (variableDefault.value === "" || isNaN(Number(variableDefault.value)))
  ) {
    displayError("Default value must be a valid number");
    return;
  }

  if (
    props.mode === "Create" &&
    storyVariables.value.find((v) => v.name == variableName.value)
  ) {
    displayError("A variable with this name already exists!");
    return;
  }

  const defaultValue: number | string | boolean =
    variableType.value === "Integer"
      ? Number(variableDefault.value)
      : variableDefault.value;

  emit("submit", {
    name: variableName.value,
    type: variableType.value,
    defaultValue,
  });
  open.value = false;
  clear();
}

function clear() {
  variableName.value = "";
  variableType.value = "Integer";
  variableDefault.value = 0;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="
      props.mode === 'Create' ? 'Add story variable' : 'Edit story variable'
    ">
    <template #body>
      <div class="flex flex-col gap-4 justify-start items-start">
        <UFormField
          class="w-full"
          label="Variable name"
          help="Unique identifier of the variable.">
          <UInput
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="variableName" />
        </UFormField>

        <UFormField
          class="w-full"
          label="Data type"
          help="The kind of value this variable holds.">
          <USelect
            class="w-full"
            :disabled="props.mode !== 'Create'"
            :model-value="variableType"
            :items="typeOptions"
            :leading-icon="typeMeta[variableType].icon"
            value-key="value"
            label-key="label"
            @update:model-value="onTypeChange" />
        </UFormField>

        <UFormField
          class="w-full"
          label="Default value"
          help="Initial value assigned when the story starts.">
          <USelect
            v-if="variableType === 'Boolean'"
            class="w-full"
            v-model="variableDefault"
            :items="[
              { label: 'true', value: true },
              { label: 'false', value: false },
            ]"
            value-key="value"
            label-key="label" />
          <UInput
            v-else
            class="w-full"
            v-model="variableDefault"
            :type="variableType === 'Integer' ? 'number' : 'text'"
            :icon="typeMeta[variableType].icon" />
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

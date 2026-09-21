<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import {
  type FormMode,
  type DataType,
  type CustomFieldSchema,
  type CustomFieldModel,
} from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";
import { useConditionUtils } from "../../utils/conditionUtils";
import { storeToRefs } from "pinia";

interface Props {
  mode: FormMode;
  field: CustomFieldSchema | undefined;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { customFields } = storeToRefs(useContentStore());

const fieldName = ref<string>("");
const fieldLabel = ref<string>("");
const fieldType = ref<DataType>("Integer");
const fieldDefault = ref<number | string | boolean>(0);
const fieldModel = ref<CustomFieldModel>("dialogue");

const { typeMeta, fieldMeta } = useConditionUtils();

const typeOptions = (Object.keys(typeMeta) as DataType[]).map((t) => ({
  label: typeMeta[t].label,
  value: t,
  icon: typeMeta[t].icon,
}));

const modelOptions = (Object.keys(fieldMeta) as CustomFieldModel[]).map(
  (m) => ({
    label: fieldMeta[m].label,
    value: m,
    icon: fieldMeta[m].icon,
  }),
);

function defaultForType(type: DataType): number | string | boolean {
  if (type === "Integer") return 0;
  if (type === "Boolean") return false;
  return "";
}

function onTypeChange(type: DataType) {
  fieldType.value = type;
  fieldDefault.value = defaultForType(type);
}

onMounted(() => {
  if (props.mode === "Update" && props.field) {
    fieldName.value = props.field.name;
    fieldType.value = props.field.type;
    fieldDefault.value = props.field.defaultValue;
    fieldModel.value = props.field.model;
    fieldLabel.value = props.field.label;
  }
});

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      fieldName.value = props.field?.name ?? "";
      fieldType.value = props.field?.type ?? "Integer";
      fieldDefault.value = props.field?.defaultValue ?? 0;
      fieldModel.value = props.field?.model ?? "dialogue";
      fieldLabel.value = props.field?.label ?? "";
    }
  }
});

const emit = defineEmits<{
  (e: "submit", field: CustomFieldSchema): void;
}>();

function submit() {
  if (!fieldName.value || fieldName.value.length <= 0) {
    displayError("Field name cannot be empty");
    return;
  }
  if (fieldName.value.length >= 25) {
    displayError("Field name be longer than 24 characters");
    return;
  }
  if (!/^[A-Za-z0-9_]+$/.test(fieldName.value)) {
    displayError("Only alphanumeric values and '_' are allowed a field name");
    return;
  }
  if (!fieldLabel.value || fieldLabel.value.length <= 0) {
    displayError("Field label cannot be empty");
    return;
  }
  if (fieldLabel.value.length >= 30) {
    displayError("Field label be longer than 29 characters");
    return;
  }
  if (!fieldType.value || fieldType.value.length <= 0) {
    displayError("No data type selected");
    return;
  }
  if (!fieldModel.value || fieldModel.value.length <= 0) {
    displayError("No target model selected");
    return;
  }
  if (
    fieldType.value === "Integer" &&
    (fieldDefault.value === "" || isNaN(Number(fieldDefault.value)))
  ) {
    displayError("Default value must be a valid number");
    return;
  }

  if (
    props.mode === "Create" &&
    customFields.value.find((f) => f.name == fieldName.value)
  ) {
    displayError("A custom field with this name already exists!");
    return;
  }

  const defaultValue: number | string | boolean =
    fieldType.value === "Integer"
      ? Number(fieldDefault.value)
      : fieldDefault.value;

  emit("submit", {
    name: fieldName.value,
    type: fieldType.value,
    defaultValue,
    model: fieldModel.value,
    label: fieldLabel.value,
  });
  open.value = false;
  clear();
}

function clear() {
  fieldName.value = "";
  fieldType.value = "Integer";
  fieldDefault.value = 0;
  fieldModel.value = "dialogue";
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.mode === 'Create' ? 'Add custom field' : 'Edit custom field'">
    <template #body>
      <div class="flex flex-col gap-4 justify-start items-start">
        <UFormField
          class="w-full"
          label="Target model"
          help="The data model this field will extend.">
          <USelect
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="fieldModel"
            :leading-icon="fieldMeta[fieldModel].icon"
            :items="modelOptions"
            value-key="value"
            label-key="label" />
        </UFormField>
        <UFormField
          class="w-full"
          label="Field key"
          help="Unique identifier of the custom field">
          <UInput
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="fieldName" />
        </UFormField>
        <UFormField
          class="w-full"
          label="Field label"
          help="How the field is labelled in the editor">
          <UInput class="w-full" v-model="fieldLabel" />
        </UFormField>

        <UFormField
          class="w-full"
          label="Data type"
          help="The data type of the field">
          <USelect
            class="w-full"
            :disabled="props.mode !== 'Create'"
            :model-value="fieldType"
            :items="typeOptions"
            value-key="value"
            :leading-icon="typeMeta[fieldType].icon"
            label-key="label"
            @update:model-value="onTypeChange" />
        </UFormField>

        <UFormField
          class="w-full"
          label="Default value"
          help="Initial value assigned to the field">
          <USelect
            v-if="fieldType === 'Boolean'"
            class="w-full"
            v-model="fieldDefault"
            :items="[
              { label: 'true', value: true },
              { label: 'false', value: false },
            ]"
            value-key="value"
            label-key="label" />
          <UInput
            v-else
            class="w-full"
            v-model="fieldDefault"
            :type="fieldType === 'Integer' ? 'number' : 'text'"
            :icon="typeMeta[fieldType].icon" />
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

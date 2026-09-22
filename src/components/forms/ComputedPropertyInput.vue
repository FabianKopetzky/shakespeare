<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type {
  FormMode,
  DataType,
  ComputedProperty,
  Parameter,
} from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";
import { useConditionUtils } from "../../utils/conditionUtils";
import { storeToRefs } from "pinia";

interface Props {
  mode: FormMode;
  computedProperty: ComputedProperty | undefined;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { computedProperties } = storeToRefs(useContentStore());

const propertyName = ref<string>("");
const params = ref<Parameter[]>([]);
const returnType = ref<DataType>("Boolean");

const showCreateConfirm = ref<boolean>(false);

const { typeMeta } = useConditionUtils();

const typeOptions = (Object.keys(typeMeta) as DataType[]).map((t) => ({
  label: typeMeta[t].label,
  value: t,
  icon: typeMeta[t].icon,
}));

function addParam() {
  params.value.push({ name: "", type: "Integer" });
}

function removeParam(index: number) {
  params.value.splice(index, 1);
}

onMounted(() => {
  if (props.mode === "Update" && props.computedProperty) {
    propertyName.value = props.computedProperty.name;
    params.value = props.computedProperty.params.map((p) => ({ ...p }));
    returnType.value = props.computedProperty.returnType;
  }
});

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      propertyName.value = props.computedProperty?.name ?? "";
      params.value =
        props.computedProperty?.params.map((p) => ({ ...p })) ?? [];
      returnType.value = props.computedProperty?.returnType ?? "Boolean";
    }
  }
});

const emit = defineEmits<{
  (e: "submit", computedProperty: ComputedProperty): void;
}>();

function isValidIdentifier(value: string) {
  return /^[A-Za-z0-9_]+$/.test(value);
}

function submit() {
  if (!propertyName.value || propertyName.value.length <= 0) {
    displayError("Computed property name cannot be empty");
    return;
  }

  if (propertyName.value.length >= 30) {
    displayError("Computed property name cannot be larger than 29 characters");
    return;
  }
  if (!isValidIdentifier(propertyName.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed in a computed property name",
    );
    return;
  }
  if (
    props.mode === "Create" &&
    computedProperties.value.find((c) => c.name == propertyName.value)
  ) {
    displayError("A computed property with this name already exists!");
    return;
  }

  if (!returnType.value || returnType.value.length <= 0) {
    displayError("No return type selected for computed property");
    return;
  }

  for (const param of params.value) {
    if (!param.name || param.name.length <= 0) {
      displayError("Parameter name cannot be empty");
      return;
    }
    if (!isValidIdentifier(param.name)) {
      displayError(
        "Only alphanumeric values and '_' are allowed in a parameter name",
      );
      return;
    }
    if (param.name.length >= 20) {
      displayError("A parameter name cannot be larger than 19 characters");
      return;
    }
    if (!param.type || param.type.length <= 0) {
      displayError(`No data type selected for parameter '${param.name}'`);
      return;
    }
  }

  const names = params.value.map((p) => p.name);
  if (new Set(names).size !== names.length) {
    displayError("Parameter names must be unique");
    return;
  }

  emit("submit", {
    name: propertyName.value,
    params: params.value.map((p) => ({ ...p })),
    returnType: returnType.value,
  });
  open.value = false;
  clear();
}

function clear() {
  propertyName.value = "";
  params.value = [];
  returnType.value = "Boolean";
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.mode === 'Create' ? 'Add event' : 'Edit event'">
    <template #body>
      <div class="flex flex-col gap-4 justify-start items-start">
        <UFormField
          class="w-full"
          label="Event name"
          help="Unique identifier of the event.">
          <UInput
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="propertyName" />
        </UFormField>

        <UFormField
          class="w-full"
          label="Return type"
          help="The data type this computed property returns.">
          <USelect
            class="w-full"
            :disabled="props.mode !== 'Create'"
            v-model="returnType"
            :items="typeOptions"
            :leading-icon="typeMeta[returnType].icon"
            value-key="value"
            label-key="label" />
        </UFormField>

        <div class="flex flex-col gap-2 w-full">
          <div
            class="flex flex-row items-center w-full"
            :class="params.length > 0 ? 'justify-between' : 'justify-end'">
            <span v-if="params.length > 0" class="text-sm font-medium"
              >Parameters</span
            >
            <UButton
              variant="ghost"
              color="neutral"
              icon="material-symbols:add-box-sharp"
              size="xs"
              @click="addParam">
              Add parameter
            </UButton>
          </div>

          <div
            v-for="(param, index) in params"
            :key="index"
            class="flex flex-row gap-2 items-start w-full">
            <UFormField
              class="flex-1"
              :label="index === 0 ? 'Name' : undefined">
              <UInput
                class="w-full"
                placeholder="Parameter name"
                v-model="param.name" />
            </UFormField>

            <UFormField class="w-40" :label="index === 0 ? 'Type' : undefined">
              <USelect
                class="w-full"
                v-model="param.type"
                :items="typeOptions"
                :leading-icon="typeMeta[param.type].icon"
                value-key="value"
                label-key="label" />
            </UFormField>

            <UButton
              variant="ghost"
              color="secondary"
              icon="material-symbols:delete-outline-sharp"
              class="self-end"
              :class="index === 0 ? 'mt-1' : undefined"
              @click="removeParam(index)" />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row gap-4 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="open = false">
          Cancel
        </UButton>
        <UButton @click="showCreateConfirm = true">{{
          props.mode === "Create" ? "Add" : "Update"
        }}</UButton>
      </div>
    </template>
  </UModal>
  <ConfirmDialog
    v-model:open="showCreateConfirm"
    title="Create event?"
    :description="`Are you sure you want to create '${propertyName}' with the configured signature? You cannot edit a computed property schema afterwards.`"
    confirm-label="Create"
    color="primary"
    icon="material-symbols:delete-outline"
    @confirm="submit" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { FormMode, Event, EventParam, DataType } from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useContentStore } from "../../stores/content";
import { useConditionUtils } from "../../utils/conditionUtils";

interface Props {
  mode: FormMode;
  event: Event | undefined;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { events } = useContentStore();

const eventName = ref<string>("");
const params = ref<EventParam[]>([]);

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
  if (props.mode === "Update" && props.event) {
    eventName.value = props.event.name;
    params.value = props.event.params.map((p) => ({ ...p }));
  }
});

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.mode === "Create") clear();
    else if (props.mode === "Update") {
      eventName.value = props.event?.name ?? "";
      params.value = props.event?.params.map((p) => ({ ...p })) ?? [];
    }
  }
});

const emit = defineEmits<{
  (e: "submit", event: Event): void;
}>();

function isValidIdentifier(value: string) {
  return /^[A-Za-z0-9_]+$/.test(value);
}

function submit() {
  if (!eventName.value || eventName.value.length <= 0) {
    displayError("Event name cannot be empty");
    return;
  }
  if (!isValidIdentifier(eventName.value)) {
    displayError(
      "Only alphanumeric values and '_' are allowed in an event name",
    );
    return;
  }
  if (
    props.mode === "Create" &&
    events.find((e) => e.name == eventName.value)
  ) {
    displayError("An event with this name already exists!");
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
    name: eventName.value,
    params: params.value.map((p) => ({ ...p })),
  });
  open.value = false;
  clear();
}

function clear() {
  eventName.value = "";
  params.value = [];
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
            v-model="eventName" />
        </UFormField>

        <div class="flex flex-col gap-2 w-full">
          <div class="flex flex-row justify-between items-center w-full">
            <span class="text-sm font-medium">Parameters</span>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-plus"
              size="xs"
              @click="addParam">
              Add parameter
            </UButton>
          </div>

          <div
            v-if="params.length === 0"
            class="text-sm text-muted italic py-2">
            No parameters defined for this event.
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
                value-key="value"
                label-key="label" />
            </UFormField>

            <UButton
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
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
    title="Create event"
    :description="`Are you sure you want to create '${eventName}' with the configured signature? You cannot edit an event schema afterwards.`"
    confirm-label="Create"
    color="primary"
    icon="material-symbols:delete-outline"
    @confirm="submit" />
</template>

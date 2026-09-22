<script setup lang="ts">
import { ref, watch } from "vue";
import type {
  Argument,
  ComputedProperty,
  DataType,
  StoryVariable,
} from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useConditionUtils } from "../../utils/conditionUtils";

interface Props {
  computedProperty: ComputedProperty | undefined;
  args: Argument[];
  variables: StoryVariable[];
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { typeMeta } = useConditionUtils();

const emit = defineEmits<{
  (e: "submit", args: Argument[]): void;
}>();

const localArgs = ref<Argument[]>([]);

watch(open, (isOpen) => {
  if (isOpen) {
    localArgs.value = props.args.map((a) => ({ ...a }));
  }
});

function paramType(argName: string): DataType | undefined {
  return props.computedProperty?.params.find((p) => p.name === argName)?.type;
}

function variableOptionsFor(type: DataType) {
  return props.variables
    .filter((v) => v.type === type)
    .map((v) => ({ label: v.name, value: v.name }));
}

function defaultForType(type: DataType): number | string | boolean {
  if (type === "Integer") return 0;
  if (type === "Boolean") return false;
  return "";
}

function setArgKind(arg: Argument, kind: "literal" | "variable") {
  if (arg.kind === kind) return;
  arg.kind = kind;
  const type = paramType(arg.name);
  if (kind === "variable") {
    const opts = type ? variableOptionsFor(type) : [];
    arg.value = opts[0]?.value ?? "";
  } else {
    arg.value = type ? defaultForType(type) : "";
  }
}

function submit() {
  for (const arg of localArgs.value) {
    const type = paramType(arg.name);
    if (arg.kind === "literal") {
      if (
        type === "Integer" &&
        (arg.value === "" || isNaN(Number(arg.value)))
      ) {
        displayError(`Parameter "${arg.name}" must be a valid number`);
        return;
      }
    } else {
      if (!arg.value || arg.value === "") {
        displayError(`No variable selected for parameter "${arg.name}"`);
        return;
      }
    }
  }

  emit(
    "submit",
    localArgs.value.map((a) => ({ ...a })),
  );
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="
      computedProperty
        ? `Configure ${computedProperty.name}`
        : 'Configure property'
    ">
    <template #body>
      <div v-if="computedProperty" class="flex flex-col gap-3">
        <span v-if="localArgs.length === 0" class="text-sm text-muted italic">
          This property takes no parameters.
        </span>

        <div
          v-for="(arg, index) in localArgs"
          :key="arg.name"
          :class="{ 'mt-1': index !== 0 }"
          class="bg-muted border border-accented p-3 flex flex-col gap-2 w-full">
          <div class="flex flex-row justify-between items-center w-full">
            <div class="flex flex-row items-center justify-start gap-1">
              <UIcon :name="typeMeta[paramType(arg.name) as DataType].icon" />
              <span
                >{{ arg.name }}
                <span class="text-dimmed"
                  >({{ paramType(arg.name) }})</span
                ></span
              >
            </div>
            <div>
              <UButton
                :color="arg.kind === 'literal' ? 'primary' : 'neutral'"
                :variant="arg.kind === 'literal' ? 'solid' : 'outline'"
                @click="setArgKind(arg, 'literal')">
                Literal
              </UButton>
              <UButton
                :color="arg.kind === 'variable' ? 'primary' : 'neutral'"
                :variant="arg.kind === 'variable' ? 'solid' : 'outline'"
                @click="setArgKind(arg, 'variable')">
                Variable
              </UButton>
            </div>
          </div>

          <template v-if="arg.kind === 'literal'">
            <USelect
              v-if="paramType(arg.name) === 'Boolean'"
              class="w-full"
              v-model="arg.value"
              :items="[
                { label: 'true', value: true },
                { label: 'false', value: false },
              ]"
              value-key="value"
              label-key="label" />
            <UInput
              v-else
              class="w-full"
              v-model="arg.value"
              :type="paramType(arg.name) === 'Integer' ? 'number' : 'text'"
              :icon="typeMeta[paramType(arg.name)!].icon" />
          </template>

          <template v-else>
            <USelectMenu
              v-if="variableOptionsFor(paramType(arg.name)!).length > 0"
              class="w-full"
              v-model="arg.value"
              :items="variableOptionsFor(paramType(arg.name)!)"
              value-key="value"
              label-key="label"
              placeholder="Select a variable" />
            <span v-else class="text-sm text-dimmed">
              No variables of type "{{ typeMeta[paramType(arg.name)!].label }}"
              available
            </span>
          </template>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row gap-2 justify-end w-full">
        <UButton variant="ghost" color="neutral" @click="open = false">
          Cancel
        </UButton>
        <UButton @click="submit">Save</UButton>
      </div>
    </template>
  </UModal>
</template>

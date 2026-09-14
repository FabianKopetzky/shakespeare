<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <SlideoverHeader
        title="Edit operation node"
        @close="close"
        @save="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection label="Properties" />
        <div class="flex flex-col gap-4 justify-start items-start">
          <UFormField class="w-full" label="Variable to modify">
            <USelectMenu
              class="w-full"
              placeholder="Select variable"
              :model-value="variableName"
              :items="variableItems"
              value-key="value"
              label-key="label"
              @update:model-value="onSelectVariable" />
          </UFormField>

          <div
            v-if="variableName"
            class="flex flex-row items-center justify-center gap-4 w-full">
            <UFormField class="flex-2" label="Action">
              <USelect
                class="w-full"
                v-model="action"
                :items="actionItems"
                value-key="value"
                label-key="label"
                @update:model-value="onSelectAction" />
            </UFormField>

            <UFormField class="flex-3" :label="targetLabel">
              <div class="flex flex-row gap-2">
                <USelectMenu
                  :model-value="targetSelection"
                  :items="targetItems"
                  value-key="value"
                  label-key="label"
                  class="w-40"
                  @update:model-value="onSelectTarget" />

                <template v-if="targetKind === 'literal'">
                  <USelect
                    v-if="selectedType === 'Boolean'"
                    v-model="targetLiteralValue"
                    :items="['true', 'false']"
                    class="flex-1" />
                  <UInput
                    v-else
                    v-model="targetLiteralValue"
                    :type="selectedType === 'Integer' ? 'number' : 'text'"
                    :icon="
                      selectedType ? typeMeta[selectedType].icon : undefined
                    "
                    placeholder="Value"
                    class="flex-1" />
                </template>
              </div>
            </UFormField>
          </div>
        </div>
        <div v-if="variableName" class="mt-8">
          <SlideoverSection label="Operation" />
          <div
            class="bg-muted mt-2 p-4 rounded-none border-accented border flex flex-row justify-start items-center gap-2">
            <UIcon name="material-symbols:settings-sharp" class="size-5" />
            <span class="font-semibold">{{
              operationToString(buildOperation())
            }}</span>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  AnyStoryNode,
  OperationNode,
  Operation,
  OperatonTarget,
  DataType,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import { useConditionUtils } from "../../../utils/conditionUtils.ts";

const { displayError } = useWidget();
const { storyNodes, storyVariables } = useContentStore();

interface Props {
  operationNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();

const isOpen = defineModel<boolean>("isOpen", { required: true });

const node = ref<OperationNode>();
const operation = ref<Operation | null>(null);

const { operationToString, typeMeta } = useConditionUtils();

const LITERAL_SENTINEL = "__literal__";

type ActionValue = "set" | "add" | "subtract";

const variableName = ref<string>("");
const action = ref<ActionValue>("set");
const targetKind = ref<"literal" | "variable">("literal");
const targetVariableName = ref<string>("");
const targetLiteralValue = ref<string>("");

const selectedType = computed<DataType | undefined>(() =>
  variableName.value
    ? storyVariables.find((v) => v.name === variableName.value)?.type
    : undefined,
);

const variableItems = computed(() =>
  storyVariables.map((v) => ({
    label: v.name,
    value: v.name,
    icon: typeMeta[v.type].icon,
  })),
);

const allActionItems: { label: string; value: ActionValue }[] = [
  { label: "Set to", value: "set" },
  { label: "Add", value: "add" },
  { label: "Subtract", value: "subtract" },
];

const actionItems = computed(() => {
  if (selectedType.value === "Integer") return allActionItems;
  return allActionItems.filter((a) => a.value === "set");
});

const targetLabel = computed(() => {
  if (action.value === "add") return "Amount to add";
  if (action.value === "subtract") return "Amount to subtract";
  return "New value";
});

const targetItems = computed(() => {
  const literalItem = {
    label: "Literal value",
    value: LITERAL_SENTINEL,
    icon: "i-lucide-pencil",
  };
  const variableItems = storyVariables
    .filter((v) => v.type === selectedType.value)
    .map((v) => ({
      label: v.name,
      value: v.name,
      icon: typeMeta[v.type].icon,
    }));
  return [literalItem, ...variableItems];
});

const targetSelection = computed(() =>
  targetKind.value === "variable" ? targetVariableName.value : LITERAL_SENTINEL,
);

function defaultLiteralFor(type: DataType | undefined): string {
  if (type === "Boolean") return "true";
  if (type === "Integer") return "0";
  return "";
}

function onSelectVariable(name: string) {
  variableName.value = name;
  action.value = "set";
  targetKind.value = "literal";
  targetVariableName.value = "";
  targetLiteralValue.value = defaultLiteralFor(selectedType.value);
}

function onSelectAction(value: ActionValue) {
  action.value = value;
}

function onSelectTarget(value: string) {
  if (value === LITERAL_SENTINEL) {
    targetKind.value = "literal";
    targetVariableName.value = "";
    targetLiteralValue.value = defaultLiteralFor(selectedType.value);
    return;
  }
  targetKind.value = "variable";
  targetVariableName.value = value;
}

function parseLiteral(
  value: string,
  type: DataType,
): number | string | boolean {
  if (type === "Integer") return Number(value);
  if (type === "Boolean") return value === "true";
  return value;
}

function loadOperation(op: Operation | null) {
  if (!op) {
    variableName.value = "";
    action.value = "set";
    targetKind.value = "literal";
    targetVariableName.value = "";
    targetLiteralValue.value = "";
    return;
  }

  variableName.value = op.variableName;
  action.value = op.action;

  if (op.target.type === "variable") {
    targetKind.value = "variable";
    targetVariableName.value = String(op.target.value);
    targetLiteralValue.value = "";
  } else {
    targetKind.value = "literal";
    targetVariableName.value = "";
    targetLiteralValue.value = String(op.target.value);
  }
}

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes[props.operationNodeId];
  if (n?.type === "operation") {
    node.value = n;

    // pre fill fields
    operation.value = n.operation;
    loadOperation(n.operation);
  }
});

function validate(): boolean {
  if (!variableName.value) {
    displayError("Select a variable to modify!");
    return false;
  }
  if (!selectedType.value) {
    displayError("The selected variable no longer exists!");
    return false;
  }
  if (
    (action.value === "add" || action.value === "subtract") &&
    selectedType.value !== "Integer"
  ) {
    displayError("Add/subtract can only be used on Integer variables!");
    return false;
  }
  if (targetKind.value === "variable" && !targetVariableName.value) {
    displayError("Select a variable to use as the value!");
    return false;
  }
  if (targetKind.value === "literal") {
    if (targetLiteralValue.value === "") {
      displayError("Enter a value for this operation!");
      return false;
    }
    if (
      selectedType.value === "Integer" &&
      isNaN(Number(targetLiteralValue.value))
    ) {
      displayError("The value must be a valid number!");
      return false;
    }
  }
  return true;
}

function buildOperation(): Operation {
  const type = selectedType.value as DataType;
  const target: OperatonTarget =
    targetKind.value === "variable"
      ? { type: "variable", value: targetVariableName.value }
      : {
          type: "literal",
          value: parseLiteral(targetLiteralValue.value, type),
        };

  return {
    variableName: variableName.value,
    action: action.value,
    target,
  };
}

function save(): void {
  const node: AnyStoryNode = storyNodes[props.operationNodeId];
  if (!node) {
    displayError(
      `An error occurred: Node "${props.operationNodeId}" does not exist (anymore)`,
    );
    return;
  }

  if (!validate()) return;

  operation.value = buildOperation();
  updateOperationNode();
  emit("onsave", props.operationNodeId);
  isOpen.value = false;
}
function close(): void {
  isOpen.value = false;
}

function updateOperationNode() {
  (storyNodes[props.operationNodeId] as OperationNode).operation =
    operation.value;
}
</script>

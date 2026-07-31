<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <div class="flex flex-row justify-between items-center w-full">
        <p class="text-lg font-bold">Edit operation node</p>
        <div class="flex flex-row gap-2">
          <UButton
            color="neutral"
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="close">
            <UIcon class="size-12" name="material-symbols:close" />
          </UButton>
          <UButton
            class="rounded-full h-10 w-10 flex justify-center items-center"
            @click="save">
            <UIcon class="size-12" name="material-symbols:check" />
          </UButton>
        </div>
      </div>
    </template>
    <template #body>
      <div class="h-full">
        <div v-if="operation" class="mb-4">
          <span
            >Performs the following operation on the selected variable:</span
          >
          <div
            class="bg-elevated mt-2 p-2 rounded-xl flex flex-col justify-start items-start">
            <span class="font-bold">{{ operationToString(operation) }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-4 justify-start items-start">
          <span class="font-bold">Edit operation</span>

          <UFormField
            class="w-full"
            label="Variable to modify"
            help="The variable that will be changed.">
            <USelectMenu
              class="w-full"
              placeholder="Select variable"
              :model-value="variableName"
              :items="variableItems"
              value-key="value"
              label-key="label"
              @update:model-value="onSelectVariable" />
          </UFormField>

          <UFormField
            v-if="variableName"
            class="w-full"
            label="Action"
            help="What to do to the variable's current value.">
            <USelect
              class="w-full"
              v-model="action"
              :items="actionItems"
              value-key="value"
              label-key="label"
              @update:model-value="onSelectAction" />
          </UFormField>

          <UFormField
            v-if="variableName"
            class="w-full"
            :label="targetLabel"
            help="Value used for this operation.">
            <div class="flex flex-row gap-1">
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
                  :icon="selectedType ? typeMeta[selectedType].icon : undefined"
                  placeholder="Value"
                  class="flex-1" />
              </template>
            </div>
          </UFormField>

          <UBadge
            v-if="selectedType"
            :color="typeMeta[selectedType].color"
            :icon="typeMeta[selectedType].icon"
            variant="subtle">
            {{ typeMeta[selectedType].label }}
          </UBadge>
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
  StoryVariableType,
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

// --- form state ---
const variableName = ref<string>("");
const action = ref<ActionValue>("set");
const targetKind = ref<"literal" | "variable">("literal");
const targetVariableName = ref<string>("");
const targetLiteralValue = ref<string>("");

const selectedType = computed<StoryVariableType | undefined>(() =>
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

// add/subtract only make sense for Integer variables
const actionItems = computed(() => {
  if (selectedType.value === "Integer") return allActionItems;
  return allActionItems.filter((a) => a.value === "set");
});

const targetLabel = computed(() => {
  if (action.value === "add") return "Amount to add";
  if (action.value === "subtract") return "Amount to subtract";
  return "New value";
});

// target dropdown: literal option + variables matching the modified variable's type
// (excluding the variable itself, since assigning to/from itself is redundant for set,
// and meaningless for add/subtract)
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

function defaultLiteralFor(type: StoryVariableType | undefined): string {
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
  type: StoryVariableType,
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
  const type = selectedType.value as StoryVariableType;
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

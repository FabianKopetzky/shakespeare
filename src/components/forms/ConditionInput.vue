<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type {
  Condition,
  ConditionClause,
  Operand,
  ComparisonOperator,
  LogicalOperator,
  StoryVariable,
  DataType,
} from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useConditionUtils } from "../../utils/conditionUtils";
import { useContentStore } from "../../stores/content";
import StoryVariableInput from "./StoryVariableInput.vue";

interface Props {
  variables: StoryVariable[];
  condition?: Condition;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { storyVariables } = useContentStore();

const emit = defineEmits<{
  (e: "submit", condition: Condition | null): void;
}>();

const { typeMeta } = useConditionUtils();

const LITERAL_SENTINEL = "__literal__";
const CREATE_SENTINEL = "__create__";

type OperandKind = "literal" | "variable";

interface OperandForm {
  kind: OperandKind;
  variableName: string | (string | number | boolean);
  literalValue: string; // raw, parsed against clause.valueType on submit
}

interface ClauseForm {
  id: number;
  left: OperandForm;
  operator: ComparisonOperator;
  right: OperandForm;
  valueType: DataType; // shared type for both sides of this clause
  connector: LogicalOperator; // connector to NEXT clause; ignored for last
}

const allOperatorOptions: { label: string; value: ComparisonOperator }[] = [
  { label: "=", value: "==" },
  { label: "≠", value: "!=" },
  { label: "<", value: "<" },
  { label: ">", value: ">" },
  { label: "≤", value: "<=" },
  { label: "≥", value: ">=" },
];

// Only these operators are valid for non-numeric types
const equalityOnlyOperators: ComparisonOperator[] = ["==", "!="];

function operatorOptions(clause: ClauseForm) {
  if (clause.valueType === "Integer") return allOperatorOptions;
  return allOperatorOptions.filter((o) =>
    equalityOnlyOperators.includes(o.value),
  );
}

const connectorOptions: LogicalOperator[] = ["AND", "OR"];
const typeOptions: DataType[] = ["Integer", "String", "Boolean"];

function emptyOperand(): OperandForm {
  return { kind: "literal", variableName: "", literalValue: "" };
}

function emptyClause(): ClauseForm {
  return {
    id: Date.now() + Math.random(),
    left: emptyOperand(),
    operator: "==",
    right: emptyOperand(),
    valueType: "Integer",
    connector: "AND",
  };
}

const clauses = ref<ClauseForm[]>([emptyClause()]);

function variableType(
  name: string | (string | number | boolean),
): DataType | undefined {
  return props.variables.find((v) => v.name === name)?.type;
}

function operandToForm(operand: Operand): OperandForm {
  if (operand.kind === "variable") {
    return { kind: "variable", variableName: operand.value, literalValue: "" };
  }
  return {
    kind: "literal",
    variableName: "",
    literalValue: String(operand.value),
  };
}

function inferValueType(comparison: {
  left: Operand;
  right: Operand;
}): DataType {
  if (comparison.left.kind === "variable") {
    const t = variableType(comparison.left.value);
    if (t) return t;
  }
  if (comparison.right.kind === "variable") {
    const t = variableType(comparison.right.value);
    if (t) return t;
  }
  const literal =
    comparison.left.kind === "literal" ? comparison.left : comparison.right;
  if (literal.kind === "literal") {
    if (typeof literal.value === "boolean") return "Boolean";
    if (typeof literal.value === "number") return "Integer";
    return "String";
  }
  return "String";
}

function loadCondition(condition: Condition) {
  if (!condition || condition.length === 0) {
    clauses.value = [emptyClause()];
    return;
  }
  clauses.value = condition.map((clause) => ({
    id: Date.now() + Math.random(),
    left: operandToForm(clause.comparison.left),
    operator: clause.comparison.operator,
    right: operandToForm(clause.comparison.right),
    valueType: inferValueType(clause.comparison),
    connector: clause.connector ?? "AND",
  }));
}

onMounted(() => {
  if (props.condition) loadCondition(props.condition);
});

watch(open, (isOpen) => {
  if (isOpen) {
    if (props.condition) loadCondition(props.condition);
    else clauses.value = [emptyClause()];
  }
});

function addClause() {
  clauses.value.push(emptyClause());
}

function removeClause(id: number) {
  clauses.value = clauses.value.filter((c) => c.id !== id);
  if (clauses.value.length === 0) clauses.value = [emptyClause()];
}

// The type is "locked" (derived, not user-selectable) whenever either side
// is a variable that's actually been selected.
function lockedType(clause: ClauseForm): DataType | undefined {
  if (clause.left.kind === "variable" && clause.left.variableName) {
    return variableType(clause.left.variableName);
  }
  if (clause.right.kind === "variable" && clause.right.variableName) {
    return variableType(clause.right.variableName);
  }
  return undefined;
}

function isValueTypeEditable(clause: ClauseForm): boolean {
  return lockedType(clause) === undefined;
}

// Single dropdown per side: "Literal value" + "Create new variable" + existing
// variables, filtered by whatever type the OTHER side already locked in (if any).
function operandItems(clause: ClauseForm, side: "left" | "right") {
  const other = side === "left" ? clause.right : clause.left;
  const otherLock =
    other.kind === "variable" && other.variableName
      ? variableType(other.variableName)
      : undefined;

  const literalItem = {
    label: "Literal value",
    value: LITERAL_SENTINEL,
    icon: "i-lucide-pencil",
  };

  const createItem = {
    label: "Create new variable...",
    value: CREATE_SENTINEL,
    icon: "i-lucide-plus",
  };

  const variableItems = props.variables
    .filter((v) => !otherLock || v.type === otherLock)
    .map((v) => ({
      label: v.name,
      value: v.name,
      icon: typeMeta[v.type].icon,
    }));

  return [[literalItem, createItem], [...variableItems]];
}

// what the dropdown itself should show as selected value
function operandSelection(operand: OperandForm): string {
  return operand.kind === "variable"
    ? operand.variableName?.toString()
    : LITERAL_SENTINEL;
}

// Reset the operator if it's no longer valid for the clause's current type
function reconcileOperator(clause: ClauseForm) {
  if (
    clause.valueType !== "Integer" &&
    !equalityOnlyOperators.includes(clause.operator)
  ) {
    clause.operator = "==";
  }
}

function applyVariableToOperand(
  clause: ClauseForm,
  side: "left" | "right",
  variableName: string,
) {
  const operand = clause[side];
  const other = side === "left" ? clause.right : clause.left;

  operand.kind = "variable";
  operand.variableName = variableName;
  const type = variableType(variableName);
  if (!type) return;

  clause.valueType = type;
  reconcileOperator(clause);

  // reset the other side if it no longer matches the newly locked type
  if (other.kind === "variable" && other.variableName) {
    if (variableType(other.variableName) !== type) other.variableName = "";
  } else {
    other.literalValue = type === "Boolean" ? "true" : "";
  }
}

// --- Inline "create new variable" flow ---
const createVariableOpen = ref(false);
const pendingTarget = ref<{
  clause: ClauseForm;
  side: "left" | "right";
} | null>(null);

function openCreateVariable(clause: ClauseForm, side: "left" | "right") {
  pendingTarget.value = { clause, side };
  createVariableOpen.value = true;
}

function onVariableCreated(variable: StoryVariable) {
  storyVariables.push(variable);

  if (pendingTarget.value) {
    applyVariableToOperand(
      pendingTarget.value.clause,
      pendingTarget.value.side,
      variable.name,
    );
  }
  pendingTarget.value = null;
}

function onSelectOperand(
  clause: ClauseForm,
  side: "left" | "right",
  value: string,
) {
  const operand = clause[side];

  if (value === LITERAL_SENTINEL) {
    operand.kind = "literal";
    operand.variableName = "";
    operand.literalValue = clause.valueType === "Boolean" ? "true" : "";
    return;
  }

  if (value === CREATE_SENTINEL) {
    openCreateVariable(clause, side);
    return;
  }

  applyVariableToOperand(clause, side, value);
}

function onSelectValueType(clause: ClauseForm, type: DataType) {
  clause.valueType = type;
  clause.left.literalValue = type === "Boolean" ? "true" : "";
  clause.right.literalValue = type === "Boolean" ? "true" : "";
  reconcileOperator(clause);
}

function parseLiteral(
  value: string,
  type: DataType,
): number | string | boolean {
  if (type === "Integer") return Number(value);
  if (type === "Boolean") return value === "true";
  return value;
}

function toOperand(operand: OperandForm, valueType: DataType): Operand {
  if (operand.kind === "variable") {
    return { kind: "variable", value: operand.variableName };
  }
  return {
    kind: "literal",
    value: parseLiteral(operand.literalValue, valueType),
  };
}

function validate(): boolean {
  for (const clause of clauses.value) {
    for (const side of [clause.left, clause.right]) {
      if (side.kind === "variable" && !side.variableName) {
        displayError("Every variable operand must have a variable selected!");
        return false;
      }
      if (side.kind === "literal" && side.literalValue === "") {
        displayError("Every literal operand must have a value!");
        return false;
      }
      if (
        side.kind === "literal" &&
        clause.valueType === "Integer" &&
        isNaN(Number(side.literalValue))
      ) {
        displayError("Numeric literal values must be valid numbers!");
        return false;
      }
    }
  }
  return true;
}

function submit() {
  if (!validate()) return;

  const condition: Condition = clauses.value.map((clause, index) => {
    const isLast = index === clauses.value.length - 1;
    const result: ConditionClause = {
      comparison: {
        left: toOperand(clause.left, clause.valueType),
        operator: clause.operator,
        right: toOperand(clause.right, clause.valueType),
      },
    };
    if (!isLast) result.connector = clause.connector;
    return result;
  });

  emit("submit", condition);
  open.value = false;
}

function clearCondition() {
  emit("submit", null);
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Edit condition"
    :ui="{ content: 'max-w-2xl' }">
    <template #body>
      <div class="flex flex-col gap-3">
        <div
          v-for="(clause, index) in clauses"
          :key="clause.id"
          class="flex flex-col gap-2">
          <div class="flex flex-col gap-2 p-3 border border-default rounded-lg">
            <!-- Value type: editable dropdown when both sides are literal, badge when locked by a variable -->
            <div class="flex flex-col gap-1">
              <span class="text-xs text-muted">Type</span>
              <USelect
                v-if="isValueTypeEditable(clause)"
                :model-value="clause.valueType"
                :items="
                  typeOptions.map((t) => ({
                    label: typeMeta[t].label,
                    value: t,
                    icon: typeMeta[t].icon,
                  }))
                "
                value-key="value"
                label-key="label"
                class="w-28"
                @update:model-value="onSelectValueType(clause, $event)" />
              <UBadge
                v-else
                :color="typeMeta[clause.valueType].color"
                :icon="typeMeta[clause.valueType].icon"
                variant="subtle"
                class="h-8 items-center">
                {{ typeMeta[clause.valueType].label }}
              </UBadge>
            </div>
            <div class="flex flex-row flex-wrap gap-3 items-end">
              <!-- Left operand -->
              <div class="flex flex-col gap-1 min-w-36">
                <span class="text-xs text-muted">Left</span>
                <div class="flex flex-row gap-1">
                  <USelectMenu
                    :model-value="operandSelection(clause.left)"
                    :items="operandItems(clause, 'left')"
                    value-key="value"
                    label-key="label"
                    class="w-36"
                    @update:model-value="
                      onSelectOperand(clause, 'left', $event)
                    " />

                  <template v-if="clause.left.kind === 'literal'">
                    <USelect
                      v-if="clause.valueType === 'Boolean'"
                      v-model="clause.left.literalValue"
                      :items="['true', 'false']"
                      class="w-24" />
                    <UInput
                      v-else
                      v-model="clause.left.literalValue"
                      :type="clause.valueType === 'Integer' ? 'number' : 'text'"
                      placeholder="Value"
                      class="w-24" />
                  </template>
                </div>
              </div>

              <!-- Operator -->
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted">Operator</span>
                <USelect
                  v-model="clause.operator"
                  :items="operatorOptions(clause)"
                  value-key="value"
                  label-key="label"
                  class="w-20" />
              </div>

              <!-- Right operand -->
              <div class="flex flex-col gap-1 min-w-36">
                <span class="text-xs text-muted">Right</span>
                <div class="flex flex-row gap-1">
                  <USelectMenu
                    :model-value="operandSelection(clause.right)"
                    :items="operandItems(clause, 'right')"
                    value-key="value"
                    label-key="label"
                    class="w-36"
                    @update:model-value="
                      onSelectOperand(clause, 'right', $event)
                    " />

                  <template v-if="clause.right.kind === 'literal'">
                    <USelect
                      v-if="clause.valueType === 'Boolean'"
                      v-model="clause.right.literalValue"
                      :items="['true', 'false']"
                      class="w-24" />
                    <UInput
                      v-else
                      v-model="clause.right.literalValue"
                      :type="clause.valueType === 'Integer' ? 'number' : 'text'"
                      placeholder="Value"
                      class="w-24" />
                  </template>
                </div>
              </div>

              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                class="ml-auto"
                @click="removeClause(clause.id)" />
            </div>
          </div>
          <!-- Connector to next clause -->
          <div v-if="index < clauses.length - 1" class="flex justify-center">
            <USelect
              v-model="clause.connector"
              :items="connectorOptions"
              class="w-24" />
          </div>
        </div>

        <UButton
          variant="soft"
          icon="i-lucide-plus"
          class="self-start"
          @click="addClause">
          Add condition
        </UButton>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row gap-2 justify-between w-full">
        <UButton variant="ghost" color="error" @click="clearCondition">
          Clear condition
        </UButton>
        <div class="flex flex-row gap-2">
          <UButton variant="ghost" color="neutral" @click="open = false">
            Cancel
          </UButton>
          <UButton @click="submit">Save</UButton>
        </div>
      </div>
    </template>
  </UModal>

  <StoryVariableInput
    v-model:open="createVariableOpen"
    mode="Create"
    :variable="undefined"
    @submit="onVariableCreated" />
</template>

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
  ComputedProperty,
  Argument,
} from "../../types/schema";
import { useWidget } from "../../composables/widget";
import { useConditionUtils } from "../../utils/conditionUtils";
import { useContentStore } from "../../stores/content";
import StoryVariableInput from "./StoryVariableInput.vue";
import ComputedPropertyInput from "./ComputedPropertyInput.vue";
import ComputedPropertyArgsInput from "./ComputedPropertyArgsInput.vue";

interface Props {
  variables: StoryVariable[];
  computedProperties: ComputedProperty[];
  condition?: Condition;
}
const props = defineProps<Props>();
const open = defineModel<boolean>("open", { default: false });

const { displayError } = useWidget();
const { storyVariables, computedProperties } = useContentStore();

const emit = defineEmits<{
  (e: "submit", condition: Condition | null): void;
}>();

const { typeMeta } = useConditionUtils();

const LITERAL_SENTINEL = "__literal__";
const CREATE_VARIABLE_SENTINEL = "__create_variable__";
const CREATE_COMPUTED_SENTINEL = "__create_computed__";

type OperandKind = "literal" | "variable" | "computed";

interface OperandForm {
  kind: OperandKind;
  variableName: string | (string | number | boolean);
  literalValue: string;
  propertyName: string;
  args: Argument[];
}

interface ClauseForm {
  id: number;
  left: OperandForm;
  operator: ComparisonOperator;
  right: OperandForm;
  valueType: DataType;
  connector: LogicalOperator;
}

const allOperatorOptions: { label: string; value: ComparisonOperator }[] = [
  { label: "=", value: "==" },
  { label: "≠", value: "!=" },
  { label: "<", value: "<" },
  { label: ">", value: ">" },
  { label: "≤", value: "<=" },
  { label: "≥", value: ">=" },
];

const equalityOnlyOperators: ComparisonOperator[] = ["==", "!="];

function operatorOptions(clause: ClauseForm) {
  if (clause.valueType === "Integer") return allOperatorOptions;
  return allOperatorOptions.filter((o) =>
    equalityOnlyOperators.includes(o.value),
  );
}

const connectorOptions: LogicalOperator[] = ["AND", "OR"];
const typeOptions: DataType[] = ["Integer", "String", "Boolean"];

function defaultForType(type: DataType): number | string | boolean {
  if (type === "Integer") return 0;
  if (type === "Boolean") return false;
  return "";
}

function emptyOperand(): OperandForm {
  return {
    kind: "literal",
    variableName: "",
    literalValue: "",
    propertyName: "",
    args: [],
  };
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

function computedPropertyType(name: string): DataType | undefined {
  return props.computedProperties.find((c) => c.name === name)?.returnType;
}

function operandToForm(operand: Operand): OperandForm {
  if (operand.kind === "variable") {
    return {
      kind: "variable",
      variableName: operand.value,
      literalValue: "",
      propertyName: "",
      args: [],
    };
  }
  if (operand.kind === "computed") {
    return {
      kind: "computed",
      variableName: "",
      literalValue: "",
      propertyName: operand.value,
      args: operand.args.map((a) => ({ ...a })),
    };
  }
  return {
    kind: "literal",
    variableName: "",
    literalValue: String(operand.value),
    propertyName: "",
    args: [],
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
  if (comparison.left.kind === "computed") {
    const t = computedPropertyType(comparison.left.value);
    if (t) return t;
  }
  if (comparison.right.kind === "variable") {
    const t = variableType(comparison.right.value);
    if (t) return t;
  }
  if (comparison.right.kind === "computed") {
    const t = computedPropertyType(comparison.right.value);
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

function lockedType(clause: ClauseForm): DataType | undefined {
  if (clause.left.kind === "variable" && clause.left.variableName) {
    return variableType(clause.left.variableName);
  }
  if (clause.left.kind === "computed" && clause.left.propertyName) {
    return computedPropertyType(clause.left.propertyName);
  }
  if (clause.right.kind === "variable" && clause.right.variableName) {
    return variableType(clause.right.variableName);
  }
  if (clause.right.kind === "computed" && clause.right.propertyName) {
    return computedPropertyType(clause.right.propertyName);
  }
  return undefined;
}

function isValueTypeEditable(clause: ClauseForm): boolean {
  return lockedType(clause) === undefined;
}

function hasParams(propertyName: string): boolean {
  return (
    (props.computedProperties.find((c) => c.name === propertyName)?.params
      .length ?? 0) > 0
  );
}

function operandItems(clause: ClauseForm) {
  const literalItem = {
    label: "Literal",
    value: LITERAL_SENTINEL,
    icon: "material-symbols:edit-sharp",
  };

  const createVariableItem = {
    label: "New variable",
    value: CREATE_VARIABLE_SENTINEL,
    icon: "material-symbols:add-box-sharp",
  };

  const createComputedItem = {
    label: "New computed property",
    value: CREATE_COMPUTED_SENTINEL,
    icon: "material-symbols:add-box-sharp",
  };

  const variableItems = props.variables
    .filter((v) => v.type === clause.valueType)
    .map((v) => ({
      label: v.name,
      value: `var:${v.name}`,
      icon: typeMeta[v.type].icon,
    }));

  const computedItems = props.computedProperties
    .filter((c) => c.returnType === clause.valueType)
    .map((c) => ({
      label: c.name,
      value: `computed:${c.name}`,
      icon: "material-symbols:functions",
    }));

  return [
    [literalItem, createVariableItem, createComputedItem],
    variableItems,
    computedItems,
  ];
}

function operandSelection(operand: OperandForm): string {
  if (operand.kind === "variable") {
    return `var:${operand.variableName?.toString() ?? ""}`;
  }
  if (operand.kind === "computed") {
    return `computed:${operand.propertyName}`;
  }
  return LITERAL_SENTINEL;
}

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
  operand.propertyName = "";
  operand.args = [];
  const type = variableType(variableName);
  if (!type) return;

  clause.valueType = type;
  reconcileOperator(clause);

  if (other.kind === "variable" && other.variableName) {
    if (variableType(other.variableName) !== type) other.variableName = "";
  } else if (other.kind === "computed" && other.propertyName) {
    if (computedPropertyType(other.propertyName) !== type) {
      other.kind = "literal";
      other.propertyName = "";
      other.args = [];
      other.literalValue = type === "Boolean" ? "true" : "";
    }
  } else if (other.kind === "literal") {
    other.literalValue = type === "Boolean" ? "true" : "";
  }
}

function defaultComputedArgs(def: ComputedProperty): Argument[] {
  return def.params.map((param) => ({
    name: param.name,
    kind: "literal",
    value: defaultForType(param.type),
  }));
}

function applyComputedPropertyToOperand(
  clause: ClauseForm,
  side: "left" | "right",
  propertyName: string,
) {
  const operand = clause[side];
  const other = side === "left" ? clause.right : clause.left;

  const def = props.computedProperties.find((c) => c.name === propertyName);
  if (!def) return;

  operand.kind = "computed";
  operand.propertyName = propertyName;
  operand.variableName = "";
  operand.args = defaultComputedArgs(def);

  clause.valueType = def.returnType;
  reconcileOperator(clause);

  if (other.kind === "variable" && other.variableName) {
    if (variableType(other.variableName) !== def.returnType) {
      other.variableName = "";
    }
  } else if (other.kind === "computed" && other.propertyName) {
    if (computedPropertyType(other.propertyName) !== def.returnType) {
      other.kind = "literal";
      other.propertyName = "";
      other.args = [];
      other.literalValue = def.returnType === "Boolean" ? "true" : "";
    }
  } else if (other.kind === "literal") {
    other.literalValue = def.returnType === "Boolean" ? "true" : "";
  }
}

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

const createComputedPropertyOpen = ref(false);
const pendingComputedTarget = ref<{
  clause: ClauseForm;
  side: "left" | "right";
} | null>(null);

function openCreateComputedProperty(
  clause: ClauseForm,
  side: "left" | "right",
) {
  pendingComputedTarget.value = { clause, side };
  createComputedPropertyOpen.value = true;
}

function onComputedPropertyCreated(property: ComputedProperty) {
  computedProperties.push(property);

  if (pendingComputedTarget.value) {
    applyComputedPropertyToOperand(
      pendingComputedTarget.value.clause,
      pendingComputedTarget.value.side,
      property.name,
    );
  }
  pendingComputedTarget.value = null;
}

const editArgsOpen = ref(false);
const editArgsProperty = ref<ComputedProperty | undefined>(undefined);
const editArgsValues = ref<Argument[]>([]);
const pendingArgsTarget = ref<{
  clause: ClauseForm;
  side: "left" | "right";
} | null>(null);

function openEditArgs(clause: ClauseForm, side: "left" | "right") {
  const operand = clause[side];
  const def = props.computedProperties.find(
    (c) => c.name === operand.propertyName,
  );
  if (!def) return;

  pendingArgsTarget.value = { clause, side };
  editArgsProperty.value = def;
  editArgsValues.value = operand.args.map((a) => ({ ...a }));
  editArgsOpen.value = true;
}

function onArgsSubmit(newArgs: Argument[]) {
  if (pendingArgsTarget.value) {
    pendingArgsTarget.value.clause[pendingArgsTarget.value.side].args = newArgs;
  }
  pendingArgsTarget.value = null;
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
    operand.propertyName = "";
    operand.args = [];
    operand.literalValue = clause.valueType === "Boolean" ? "true" : "";
    return;
  }

  if (value === CREATE_VARIABLE_SENTINEL) {
    openCreateVariable(clause, side);
    return;
  }

  if (value === CREATE_COMPUTED_SENTINEL) {
    openCreateComputedProperty(clause, side);
    return;
  }

  if (value.startsWith("var:")) {
    applyVariableToOperand(clause, side, value.slice(4));
    return;
  }

  if (value.startsWith("computed:")) {
    applyComputedPropertyToOperand(clause, side, value.slice(9));
    return;
  }
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
  if (operand.kind === "computed") {
    return {
      kind: "computed",
      value: operand.propertyName,
      args: operand.args.map((a) => ({ ...a })),
    };
  }
  return {
    kind: "literal",
    value: parseLiteral(operand.literalValue, valueType),
  };
}

function validateComputedArgs(
  def: ComputedProperty | undefined,
  args: Argument[],
): string | null {
  if (!def) return "Selected computed property no longer exists";

  for (const param of def.params) {
    const arg = args.find((a) => a.name === param.name);
    if (!arg) {
      return `Parameter "${param.name}" of "${def.name}" is not configured`;
    }

    if (arg.kind === "literal") {
      if (arg.value === "" || arg.value === undefined || arg.value === null) {
        return `Parameter "${param.name}" of "${def.name}" must have a value`;
      }
      if (param.type === "Integer" && isNaN(Number(arg.value))) {
        return `Parameter "${param.name}" of "${def.name}" must be a valid number`;
      }
    } else if (!arg.value || arg.value === "") {
      return `No variable selected for parameter "${param.name}" of "${def.name}"`;
    }
  }
  return null;
}

function validate(): boolean {
  for (const clause of clauses.value) {
    for (const side of [clause.left, clause.right]) {
      if (side.kind === "variable" && !side.variableName) {
        displayError("Every variable operand must have a variable selected!");
        return false;
      }
      if (side.kind === "computed") {
        if (!side.propertyName) {
          displayError(
            "Every computed property operand must have a property selected!",
          );
          return false;
        }
        const def = props.computedProperties.find(
          (c) => c.name === side.propertyName,
        );
        const error = validateComputedArgs(def, side.args);
        if (error) {
          displayError(error);
          return false;
        }
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

function formatArgValue(arg: Argument): string {
  return arg.value !== "" && arg.value !== undefined && arg.value !== null
    ? arg.value.toString()
    : "<?>";
}

function operandDisplay(operand: OperandForm): string {
  if (operand.kind === "literal") {
    return operand.literalValue ? operand.literalValue : "<?>";
  }
  if (operand.kind === "variable") {
    return operand.variableName ? operand.variableName.toString() : "<?>";
  }
  if (!operand.propertyName) return "<?>";
  const argsStr = operand.args.map((a) => formatArgValue(a)).join(", ");
  return `${operand.propertyName}(${argsStr})`;
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
          <div class="flex flex-col gap-2 p-3 bg-muted border border-accented">
            <div class="flex flex-row gap-1 items-start justify-between">
              <div
                v-if="isValueTypeEditable(clause)"
                class="flex flex-col items-start justify-start gap-1">
                <span class="text-xs text-muted">Constrain type</span>
                <USelect
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
              </div>
              <UBadge
                v-else
                color="neutral"
                :icon="typeMeta[clause.valueType].icon"
                variant="subtle"
                class="h-8 items-center">
                {{ typeMeta[clause.valueType].label }}
              </UBadge>
              <div class="flex flex-row gap-2 items-center justify-end">
                <span>{{
                  `${operandDisplay(clause.left)} ${clause.operator} ${operandDisplay(clause.right)}`
                }}</span>
                <UButton
                  icon="material-symbols:delete-outline-sharp"
                  variant="ghost"
                  color="neutral"
                  @click="removeClause(clause.id)" />
              </div>
            </div>
            <div
              class="flex flex-row w-full justify-between gap-2 items-center overflow-x-scroll">
              <div class="flex flex-col gap-1 flex-1">
                <span class="text-xs text-muted">Left</span>
                <div class="flex flex-row gap-1">
                  <USelectMenu
                    :model-value="operandSelection(clause.left)"
                    :items="operandItems(clause)"
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

                  <UButton
                    v-else-if="
                      clause.left.kind === 'computed' &&
                      hasParams(clause.left.propertyName)
                    "
                    variant="outline"
                    color="neutral"
                    icon="material-symbols:tune"
                    @click="openEditArgs(clause, 'left')" />
                </div>
              </div>

              <div class="flex flex-col gap-1 w-20">
                <span class="text-xs text-muted">Operator</span>
                <USelect
                  v-model="clause.operator"
                  :items="operatorOptions(clause)"
                  value-key="value"
                  label-key="label"
                  class="w-20" />
              </div>

              <div class="flex flex-col gap-1 flex-1 items-end">
                <span class="text-xs text-muted">Right</span>
                <div class="flex flex-row gap-1">
                  <USelectMenu
                    :model-value="operandSelection(clause.right)"
                    :items="operandItems(clause)"
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

                  <UButton
                    v-else-if="
                      clause.right.kind === 'computed' &&
                      hasParams(clause.right.propertyName)
                    "
                    variant="outline"
                    color="neutral"
                    icon="material-symbols:tune"
                    @click="openEditArgs(clause, 'right')" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="index < clauses.length - 1" class="flex justify-center">
            <USelect
              v-model="clause.connector"
              :items="connectorOptions"
              class="w-24 mt-1" />
          </div>
        </div>

        <UButton
          variant="ghost"
          icon="material-symbols:add-box-sharp"
          class="self-end"
          color="neutral"
          @click="addClause">
          Add clause
        </UButton>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row gap-2 justify-between w-full">
        <UButton
          variant="ghost"
          color="error"
          icon="material-symbols:delete-outline-sharp"
          @click="clearCondition">
          Reset condition
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

  <ComputedPropertyInput
    v-model:open="createComputedPropertyOpen"
    mode="Create"
    :computed-property="undefined"
    @submit="onComputedPropertyCreated" />

  <ComputedPropertyArgsInput
    v-model:open="editArgsOpen"
    :computed-property="editArgsProperty"
    :args="editArgsValues"
    :variables="props.variables"
    @submit="onArgsSubmit" />
</template>

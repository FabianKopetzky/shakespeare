<template>
  <USlideover
    v-model:open="isOpen"
    :dismissible="false"
    class="w-[40vw] min-w-100 max-w-none">
    <template #header>
      <SlideoverHeader
        title="Edit switch node"
        @close="close"
        :save-content="save" />
    </template>
    <template #body>
      <div class="h-full">
        <SlideoverSection label="Properties" />

        <UFormField label="Switch on" class="mb-6">
          <div class="flex flex-row gap-2 items-center">
            <USelectMenu
              :model-value="switchValue"
              :items="switchTargets"
              value-key="value"
              label-key="label"
              placeholder="Select a variable or property"
              class="flex-1"
              @update:model-value="onSwitchValueChange" />
            <UBadge
              v-if="referencedDatatype"
              color="neutral"
              :icon="typeMeta[referencedDatatype].icon"
              variant="subtle"
              class="h-8 items-center">
              {{ typeMeta[referencedDatatype].label }}
            </UBadge>
          </div>
        </UFormField>

        <template v-if="referencedDatatype">
          <SlideoverSection label="Cases" />
          <div class="flex flex-col gap-4">
            <div
              v-for="c in [...cases.filter((c) => !c.isDefault)]"
              :key="c.id"
              class="mb-2">
              <div class="flex flex-row justify-between items-center">
                <span class="font-semibold">{{ `Case ${caseNumber(c)}` }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="material-symbols:delete-outline-sharp"
                  @click="removeCase(c.id)" />
              </div>

              <UFormField
                class="w-full"
                :error="
                  duplicateIds.has(c.id)
                    ? 'Another case already uses this value.'
                    : undefined
                ">
                <USelect
                  v-if="referencedDatatype === 'Boolean'"
                  v-model="c.literalValue"
                  :items="['true', 'false']"
                  class="w-full" />
                <UInput
                  v-else
                  v-model="c.literalValue"
                  :type="referencedDatatype === 'Integer' ? 'number' : 'text'"
                  step="1"
                  placeholder="Value"
                  class="w-full" />
              </UFormField>
            </div>

            <UButton
              v-if="referencedDatatype"
              color="neutral"
              variant="ghost"
              class="self-end"
              :disabled="!canAddCase"
              @click="addCase">
              <UIcon name="material-symbols:add-box-sharp" />
              Add case
            </UButton>
          </div>
        </template>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  type AnyStoryNode,
  type SwitchNode,
  type SwitchCase,
  type DataType,
} from "../../../types/schema.ts";
import { useContentStore } from "../../../stores/content.ts";
import { useWidget } from "../../../composables/widget.ts";
import { storeToRefs } from "pinia";
import { useConditionUtils } from "../../../utils/conditionUtils.ts";

const { displayError } = useWidget();
const { storyNodes, storyVariables, computedProperties } =
  storeToRefs(useContentStore());

const { typeMeta } = useConditionUtils();

interface Props {
  switchNodeId: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "onsave", id: string): void;
}>();
const isOpen = defineModel<boolean>("isOpen", { required: true });
const node = ref<SwitchNode>();
const switchValue = ref<string | undefined>(undefined);

// Same approach as the condition editor: the form holds every value as a
// string (so the inputs can v-model it directly) and it is parsed into the
// real type when saving.
interface CaseForm {
  id: string | number;
  isDefault: boolean;
  literalValue: string;
  targetId: string | null;
}
const cases = ref<CaseForm[]>([]);

const editorOpen = ref<boolean>(false);

watch(isOpen, (open) => {
  if (!open) return;
  const n: AnyStoryNode = storyNodes.value[props.switchNodeId];
  if (n?.type === "switch") {
    node.value = n;

    editorOpen.value = false;

    // pre fill fields (copies, so closing without saving leaves the store alone)
    cases.value = n.cases ? n.cases.map(caseToForm) : [];
    switchValue.value = n.switchValue ?? undefined;
  }
});

// --- form <-> node conversion ------------------------------------------

function caseToForm(c: SwitchCase): CaseForm {
  return {
    id: c.id,
    isDefault: c.isDefault,
    literalValue: String(c.value),
    targetId: c.targetId,
  };
}

function parseLiteral(
  value: string,
  type: DataType | undefined,
): number | string | boolean {
  if (type === "Integer") return Number(value);
  if (type === "Boolean") return value === "true";
  return value;
}

function formToCase(c: CaseForm, type: DataType | undefined): SwitchCase {
  return {
    id: c.id,
    isDefault: c.isDefault,
    value: parseLiteral(String(c.literalValue), type),
    targetId: c.targetId,
  };
}

const switchTargets = computed(() => {
  const variableItems = storyVariables.value.map((v) => ({
    label: v.name,
    value: v.name,
    icon: typeMeta[v.type].icon,
  }));

  const computedItems = computedProperties.value
    .filter((c) => c.params.length === 0)
    .map((c) => ({
      label: c.name,
      value: c.name,
      icon: "material-symbols:functions",
    }));

  return [variableItems, computedItems].filter((group) => group.length > 0);
});

const referencedDatatype = computed<DataType | undefined>(() => {
  if (!switchValue.value) return undefined;

  const variable = storyVariables.value.find(
    (v) => v.name === switchValue.value,
  );
  if (variable) return variable.type;

  return computedProperties.value.find((c) => c.name === switchValue.value)
    ?.returnType;
});

function onSwitchValueChange(value: string | undefined): void {
  const previousType = referencedDatatype.value;
  switchValue.value = value;

  const type = referencedDatatype.value;
  if (type === previousType) return;

  for (const c of cases.value) {
    c.literalValue = c.isDefault ? defaultLiteral(type) : "";
  }
  for (const c of cases.value) {
    if (!c.isDefault) c.literalValue = nextUnusedLiteral(type);
  }
}

function defaultLiteral(type: DataType | undefined): string {
  if (type === "Boolean") return "false";
  if (type === "Integer") return "0";
  return "";
}

function comparableKey(c: CaseForm, type = referencedDatatype.value): string {
  return type === "Integer"
    ? String(Number(c.literalValue))
    : String(c.literalValue);
}

function nextUnusedLiteral(type: DataType | undefined): string {
  const used = new Set(
    cases.value.filter((c) => !c.isDefault).map((c) => comparableKey(c, type)),
  );

  if (type === "Boolean") return used.has("false") ? "true" : "false";
  if (type === "Integer") {
    let n = 0;
    while (used.has(String(n))) n++;
    return String(n);
  }
  return defaultLiteral(type);
}

// A boolean can only ever match true or false
const canAddCase = computed(() => {
  if (!referencedDatatype.value) return false;
  if (referencedDatatype.value === "Boolean") {
    return cases.value.filter((c) => !c.isDefault).length < 2;
  }
  return true;
});

const duplicateIds = computed<Set<string | number>>(() => {
  const byValue = new Map<string, (string | number)[]>();
  for (const c of cases.value) {
    // empty values are reported separately when saving
    if (c.isDefault || String(c.literalValue) === "") continue;
    const key = comparableKey(c);
    byValue.set(key, [...(byValue.get(key) ?? []), c.id]);
  }
  const duplicates = new Set<string | number>();
  for (const ids of byValue.values()) {
    if (ids.length > 1) ids.forEach((id) => duplicates.add(id));
  }
  return duplicates;
});

// numbering skips the default branch
function caseNumber(c: CaseForm): number {
  return (
    cases.value.filter((x) => !x.isDefault).findIndex((x) => x.id === c.id) + 1
  );
}

function addCase(): void {
  if (!cases.value) cases.value = [];
  if (!canAddCase.value) return;

  cases.value.push({
    id: crypto.randomUUID(),
    isDefault: false,
    literalValue: nextUnusedLiteral(referencedDatatype.value),
    targetId: null,
  });
}

function removeCase(id: string | number): void {
  const toDelete = cases.value.find((c) => c.id === id);
  if (toDelete?.isDefault) {
    displayError("You cannot delete the default branch of a switch node!");
    return;
  }
  cases.value = (cases.value ?? []).filter((c) => c.id !== id);
}

// --- saving ------------------------------------------------------------

function validate(): boolean {
  if (!referencedDatatype.value) {
    displayError("Select a variable or computed property to switch on.");
    return false;
  }

  if (!cases.value || cases.value.length <= 0) {
    displayError(
      "Cannot save node without any cases. Please add a case to continue.",
    );
    return false;
  }

  for (const c of cases.value) {
    if (c.isDefault) continue;

    if (String(c.literalValue) === "") {
      displayError("Every case must have a value!");
      return false;
    }
    if (
      referencedDatatype.value === "Integer" &&
      !Number.isInteger(Number(c.literalValue))
    ) {
      displayError("Numeric case values must be whole numbers!");
      return false;
    }
  }

  if (duplicateIds.value.size > 0) {
    displayError("Each case needs a unique value. Fix the duplicates to save.");
    return false;
  }

  return true;
}

function save(): boolean {
  const target: AnyStoryNode = storyNodes.value[props.switchNodeId];
  if (!target) {
    displayError(
      `An error occurred: Node "${props.switchNodeId}" does not exist (anymore)`,
    );
    return false;
  }

  if (!validate()) return false;

  updateSwitchNode();
  emit("onsave", props.switchNodeId);
  isOpen.value = false;

  return true;
}
function close(): void {
  isOpen.value = false;
}

function updateSwitchNode() {
  const type = referencedDatatype.value;
  const target = storyNodes.value[props.switchNodeId] as SwitchNode;
  target.switchValue = switchValue.value;
  target.cases = cases.value.map((c) => formToCase(c, type));
}
</script>

<template>
  <UFormField class="w-full" :label="props.schema.label">
    <USelect
      v-if="props.schema.type === 'Boolean'"
      class="w-full"
      v-model="fieldValue"
      :items="[
        { label: 'true', value: true },
        { label: 'false', value: false },
      ]"
      value-key="value"
      label-key="label" />
    <UInput
      v-else
      class="w-full"
      v-model="fieldValue"
      :type="props.schema.type === 'Integer' ? 'number' : 'text'"
      :icon="typeMeta[props.schema.type].icon" />
  </UFormField>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { CustomFieldSchema } from "../../types/schema";
import { useConditionUtils } from "../../utils/conditionUtils";

interface Props {
  schema: CustomFieldSchema;
  defaultValue: string | boolean | number | undefined;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "submit", value: string | boolean | number): void;
}>();

const { typeMeta } = useConditionUtils();

const fieldValue = ref<string | number | boolean>();

onMounted(() => {
  fieldValue.value =
    props.defaultValue === undefined
      ? props.schema.defaultValue
      : props.defaultValue;
});

watch(fieldValue, (newValue) => {
  if (newValue !== undefined) {
    emit("submit", newValue);
  }
});
</script>

import { storeToRefs } from "pinia";
import type { CustomFieldModel, CustomFields, CustomFieldSchema } from "../types/schema";
import { useContentStore } from "../stores/content";

export function useCustomFieldsUtils() {
    const { customFields } = storeToRefs(useContentStore());

    function getCustomFieldsForModel(model: CustomFieldModel): CustomFieldSchema[] {
        const schema = customFields.value.filter(f => f.model === model);
        return schema ?? [];
    }
    function createDefaultFieldsForModel(model: CustomFieldModel): CustomFields {
        const schema = getCustomFieldsForModel(model);
        if(!schema || schema.length <= 0) return { data: [] };

        return { data: schema.map(s => ({ name: s.name, value: s.defaultValue })) };
    }

    return { getCustomFieldsForModel, createDefaultFieldsForModel }
}
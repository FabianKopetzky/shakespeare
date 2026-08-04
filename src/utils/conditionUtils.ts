import type { Condition, Operation, DataType } from "../types/schema";

export function useConditionUtils() {
  function conditionToString(condition: Condition): string {
    let str = "";

    for(const clause of condition) {
      str += `${clause.comparison.left.value?.toString()} ${clause.comparison.operator} ${clause.comparison.right.value?.toString()}`;
      if(clause.connector) str += ` ${clause.connector} `;
    }

    return str;
  }

  function operationToString(operation: Operation): string {
    return `${operation.variableName} ${operationActionToString(operation.action)} ${operation.target.value}`;
  }
  function operationActionToString(action: 'set' | 'add' | 'subtract'): string {
    switch(action) {
      case 'add':
        return '+=';
      case 'subtract':
        return '-=';
      case 'set':
        return '=';
    }
  }

  const typeMeta: Record<
    DataType,
    { icon: string; color: "info" | "secondary" | "success"; label: string }
    > = {
    Integer: { icon: "i-lucide-hash", color: "info", label: "Integer" },
    String: { icon: "i-lucide-type", color: "secondary", label: "String" },
    Boolean: { icon: "i-lucide-toggle-left", color: "success", label: "Boolean" },
  };

  return { conditionToString, typeMeta, operationToString };
}
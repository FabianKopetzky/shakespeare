import type { Condition, Operation, DataType, CustomFieldModel, Event, Argument, Operand } from "../types/schema";

export function useConditionUtils() {
  function operandToString(operand: Operand): string {
  if (operand.kind === "computed") {
    const args = operand.args.map((a) => a.value?.toString()).join(", ");
    return `${operand.value}(${args})`;
  }
  return operand.value?.toString() ?? "";
}

function conditionToString(condition: Condition): string {
  let str = "";

  for (const clause of condition) {
    str += `${operandToString(clause.comparison.left)} ${clause.comparison.operator} ${operandToString(clause.comparison.right)}`;
    if (clause.connector) str += ` ${clause.connector} `;
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
  function eventToString(event: Event): string {
    return `${event.name} ${event.params && event.params.length > 0 ? `(${event.params.map(p => p.type).join(', ')})` : ''}`
  }
  function eventInvokationToString(event: string, args: Argument[]): string {
    return `Invoke ${event}${args && args.length > 0 ? `(${args.map(a => a.value).join(', ')})` : ''}`
  }

  const typeMeta: Record<
    DataType,
    { icon: string; color: "info" | "secondary" | "success"; label: string }
    > = {
    Integer: { icon: "material-symbols:numbers", color: "info", label: "Integer" },
    String: { icon: "material-symbols:title", color: "secondary", label: "String" },
    Boolean: { icon: "material-symbols:toggle-on", color: "success", label: "Boolean" },
  };

  const fieldMeta: Record<
    CustomFieldModel,
    { icon: string; color: "info" | "secondary" | "success"; label: string }
    > = {
    dialogue: { icon: "material-symbols:forum-sharp", color: "info", label: "Dialogue" },
    dialogue_sentence: { icon: "material-symbols:format-paragraph", color: "secondary", label: "Dialogue Sentence" },
    branch: { icon: "material-symbols:arrow-split", color: "success", label: "Branch" },
    story: { icon: "material-symbols:import-contacts-sharp", color: "success", label: "Story" },
  };

  return { conditionToString, typeMeta, fieldMeta, operationToString, eventToString, eventInvokationToString };
}
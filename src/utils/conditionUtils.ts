import type { Condition, ConditionClause, Operand } from "../types/schema";

export function useConditionUtils() {
    function operandToString(operand: Operand): string {
        if(operand.kind === 'literal') {
            return operand.value.toString();
        } else {
            return operand.name;
        }
    }
    function conditionToString(condition: Condition): string {
        let str = "";

        for(const clause of condition) {
            str += `${operandToString(clause.comparison.left)} ${clause.comparison.operator} ${operandToString(clause.comparison.right)}`;
            if(clause.connector) str += ` ${clause.connector} `;
        }

        return str;
    }

    return { conditionToString };
}
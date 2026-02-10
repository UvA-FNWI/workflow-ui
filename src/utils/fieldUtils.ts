import type {WorkflowInstanceField} from "~/store/api/types/instances";

export function getFieldValue(fields: WorkflowInstanceField[] | undefined, key: string) {
    return fields?.find((f) => f.key === key)?.value;
}

export function getStringField(
    fields: WorkflowInstanceField[] | undefined,
    key: string,
): string | undefined {
    const value = fields?.find((f) => f.key === key)?.value;
    if (typeof value === "string") {
        return value;
    }
    if (value !== undefined) {
        console.warn(`Expected string for field "${key}", got ${typeof value}`);
    }
    return undefined;
}

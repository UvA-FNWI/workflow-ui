import type {LocalString} from "~/hooks/useTranslate";
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

export function getLocalStringField(
    fields: WorkflowInstanceField[] | undefined,
    key: string,
): string | LocalString | undefined {
    const value = fields?.find((f) => f.key === key)?.value;
    if (typeof value === "string") {
        return value;
    }
    if (value !== null && typeof value === "object" && ("en" in value || "nl" in value)) {
        return value as LocalString;
    }
    if (value !== undefined) {
        console.warn(`Expected string or LocalString for field "${key}", got ${typeof value}`);
    }
    return undefined;
}

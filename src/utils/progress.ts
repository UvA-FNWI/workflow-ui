import type {ProgressInformation} from "~/store/api/types/progress";

export function isProgressInformation(value: unknown): value is ProgressInformation {
    return typeof value === "object" && value !== null && "text" in value && "color" in value;
}

export function isStopped(
    workflowStopped: boolean | undefined,
    stopEvent?: string | null,
): boolean {
    return workflowStopped === true && stopEvent !== "Pause";
}

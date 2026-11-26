import type {ProgressInformation} from "~/store/api/types/progress";

export function isProgressInformation(value: unknown): value is ProgressInformation {
    return typeof value === "object" && value !== null && "text" in value && "color" in value;
}

export function isStopped(workflowStopped: boolean | undefined, eventId?: string | null): boolean {
    return workflowStopped === true && eventId !== "Pause";
}

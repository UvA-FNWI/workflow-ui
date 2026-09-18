import type {WorkflowInstance} from "./instances";
import type {EffectResult} from "./submissions";
import type {LocalString} from "~/hooks/useTranslate";

export type ExtendableDeadline = {
    property: string;
    title: LocalString;
    date: string;
    maxDate?: string | null;
};
export type DeadlineChange = {property: string; previousDate: string; newDate: string};
export type PostponeDeadlinesRequest = {
    changes: DeadlineChange[];
    reason: string;
};
export type PostponeDeadlinesResponse = {instance: WorkflowInstance; effects?: EffectResult};
export type PostponementError = "InvalidChanges" | "MaximumExtensionExceeded";

import type {LocalString} from "~/hooks/useTranslate";
import type {FormLayout, Submission} from "~/store/api/types/submissions.ts";

export type WorkflowInstance = {
    id: string;
    title: LocalString | null;
    currentStep: string;
    steps: WorkflowStep[];
    submissions: Submission[];
    actions: Action[];
};

export type WorkflowStep = {
    id: string;
    title: LocalString;
    event: string;
    dateCompleted: string | null;
    children: WorkflowStep[] | null;
    versions: WorkflowStepVersion[] | null;
};

export type WorkflowStepVersion = {
    versionNumber: number;
    eventId: string;
    submittedAt: string;
    formData: Record<string, unknown | null>;
};

export type Action = {
    name: string;
    id: string;
    type: ActionType;
    form?: string;
    title: LocalString;
    mail?: string;
    step?: string;
    intent: ActionIntent;
    formLayout: FormLayout;
};

export type ActionType = "SubmitForm" | "Execute";
export type ActionIntent = "Primary" | "Secondary" | "Destructive";

import type {LocalString} from "~/hooks/useTranslate";
import type {
    FormLayout,
    ImpersonationRole,
    RoleAction,
    Submission,
} from "~/store/api/types/submissions.ts";

export type WorkflowInstanceField = {
    key: string | null;
    title: LocalString;
    value: string | string[] | LocalString | null;
};

export type WorkflowInstance = {
    id: string;
    title: LocalString | null;
    currentStep: string;
    fields: WorkflowInstanceField[];
    steps: WorkflowStep[];
    submissions: Submission[];
    actions: Action[];
    permissions: RoleAction[];
    canUseAdminTools: boolean;
    viewerRoles: string[];
};

export type WorkflowStep = {
    id: string;
    title: LocalString;
    icon: string | null;
    event: string;
    dateCompleted: string | null;
    deadline: string | null;
    children: WorkflowStep[] | null;
    versions: WorkflowStepVersion[] | null;
};

//TODO: find a way to fix the eventId/eventIds inconsistency
export type WorkflowStepVersion = {
    versionNumber: number;
    eventId: string;
    eventIds: string[];
    submittedAt: string;
    submissions: Submission[];
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

export type ImpersonationResult = {
    instanceId: string;
    role: ImpersonationRole;
    token: string;
    expiresAtUtc: string;
};

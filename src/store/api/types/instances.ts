import type {LocalString} from "~/hooks/useTranslate";
import type {
    FormLayout,
    ImpersonationRole,
    RoleAction,
    Submission,
} from "~/store/api/types/submissions.ts";

export type WorkflowInstance = {
    id: string;
    title: LocalString | null;
    steps: WorkflowStep[];
    submissions: Submission[];
    actions: Action[];
    permissions: RoleAction[];
    canUseAdminTools: boolean;
};

export type WorkflowStep = {
    id: string;
    title: LocalString;
    event: string;
    dateCompleted: string | null;
    children: WorkflowStep[] | null;
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

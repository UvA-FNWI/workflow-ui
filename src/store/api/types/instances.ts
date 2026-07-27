import type {LocalString} from "~/hooks/useTranslate";
import type {
    FormLayout,
    ImpersonationRole,
    RoleAction,
    StepResultsType,
    Submission,
} from "~/store/api/types/submissions.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

export type WorkflowInstanceField = {
    key: string | null;
    title: LocalString;
    value: string | string[] | LocalString | null;
};

export type WorkflowInstance = {
    id: string;
    title: LocalString | null;
    currentStep: string | null;
    fields: WorkflowInstanceField[];
    steps: WorkflowStep[];
    submissions: Submission[];
    actions: Action[];
    permissions: RoleAction[];
    canUseAdminTools: boolean;
    canImpersonate: boolean;
    viewerRoles: string[];
    relatedUserGroups: RelatedUserGroups;
    resources: Resource[];
};

/**
 * A row from the instances-list endpoint. Keys are the requested property names (plus "id" and
 * "createdOn", which are always returned). The endpoint projects properties on demand, so the shape
 * beyond those is dynamic. "title" is only present when the request opts in with includeTitle.
 */
export type InstanceSummary = {
    id: string;
    createdOn: string;
    title?: string | null;
} & Record<string, unknown>;

export type RecalculateCurrentStepsResult = {
    total: number;
    updated: number;
    unchanged: number;
};

export type StepHeaderStatus = {
    type: "Info" | "Attention" | "Success";
    label: LocalString;
};

export type IconVariant = {
    type: string;
    color: string;
};

export type StepHierarchyMode = "Sequential" | "Parallel";

export type WorkflowStep = {
    id: string;
    title: LocalString;
    icon: IconVariant | null;
    event: string;
    dateCompleted: string | null;
    deadline: string | null;
    children: WorkflowStep[] | null;
    versions: WorkflowStepVersion[] | null;
    headerStatus: StepHeaderStatus | null;
    resultsType: StepResultsType;
    hierarchyMode: StepHierarchyMode;
};

export type WorkflowStepVersion = {
    versionNumber: number;
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
    steps: string[];
    intent: ActionIntent;
    formLayout: FormLayout;
    autoOpenForm?: boolean;
};

export type ActionType = "SubmitForm" | "Execute";
export type ActionIntent = "Primary" | "Secondary" | "Destructive";

export type RoleImpersonationResult = {
    instanceId: string;
    role: ImpersonationRole;
    token: string;
    expiresAtUtc: string;
};

export type RelatedUser = {
    title: LocalString;
    user: UserSearchResult & {id: string};
};

export type RelatedUserGroup = {
    name: string;
    title: LocalString;
    users: RelatedUser[];
};

export type RelatedUserGroups = {
    groups: RelatedUserGroup[];
};

export type ResourceLayout = "Links" | "Text";
export type ResourceType = "Link" | "Download" | "Text";

export type Resource = {
    name: string;
    title: LocalString;
    type: ResourceLayout;
    items?: ResourceItem[];
    content?: LocalString;
};

export type ResourceItem = {
    name: string;
    text: LocalString;
    type: ResourceType;
    url?: LocalString;
};

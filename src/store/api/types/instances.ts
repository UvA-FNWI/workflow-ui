import type {IconType} from "@uva-fnwi/datanose-ui";

import type {LocalString} from "~/hooks/useTranslate";
import type {
    FormLayout,
    Question,
    RoleAction,
    StepResultsType,
    Submission,
} from "~/store/api/types/submissions.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions.ts";

export type WorkflowInstanceField = {
    key: string | null;
    title: LocalString;
    value: string | string[] | LocalString | null;
};

export type WorkflowInstance = {
    id: string;
    /** Rendered title, not a localized template. */
    title: string | null;
    workflowDefinition: WorkflowDefinition;
    currentStep: string | null;
    fields: WorkflowInstanceField[];
    steps: WorkflowStep[];
    submissions: Submission[];
    actions: Action[];
    permissions: RoleAction[];
    canUseAdminTools: boolean;
    canImpersonate: boolean;
    viewerRoles: string[];
    infoCards: InfoCard[];
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

/** Property definitions plus values keyed by dotted path. */
export type InstanceProperties = {
    properties: Question[];
    values: Record<string, unknown>;
};

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

export type Role = {
    name: string;
    title: LocalString;
};

export type AllowedAction = {
    type: RoleAction;
    label: LocalString | null;
    /** Action, form, or property identifier used when no label is configured. */
    target: string | null;
};

export type ActiveStepRole = Role & {
    actions: AllowedAction[];
};

export type ActiveStep = {
    name: string;
    title: LocalString;
    isCurrent: boolean;
    roles: ActiveStepRole[];
};

export type RoleImpersonationResult = {
    instanceId: string;
    role: Role;
    token: string;
    expiresAtUtc: string;
};

export type RelatedUserRoles = {
    role: string;
    title: LocalString;
    users: (UserSearchResult & {id: string})[];
    allowsExternalUsers: boolean;
    allowsAssignment: boolean;
    allowsMultipleUsers: boolean;
    canEdit: boolean;
};

export type RelatedUserGroup = {
    name: string;
    title: LocalString;
    userRoles: RelatedUserRoles[];
};

type InfoCardBase = {
    name: string;
    title: LocalString;
};

export type InfoCardField = {
    title: LocalString;
    value: unknown;
    href: string | null;
    icon: IconType | null;
};

export type InfoCardItem = {
    name: string;
    text: LocalString;
    type: "Link" | "Download";
    url: LocalString;
};

export type InfoCard =
    | (InfoCardBase & {
          type: "User";
          user: {displayName: string; picture: string | null} | null;
          fields?: InfoCardField[] | null;
          emptyText: LocalString | null;
      })
    | (InfoCardBase & {type: "RelatedUsers"; groups?: RelatedUserGroup[] | null})
    | (InfoCardBase & {type: "Links"; items?: InfoCardItem[] | null})
    | (InfoCardBase & {type: "Text"; content?: LocalString | null});

import {baseApi} from "./baseApi";
import type {LocalString} from "~/hooks/useTranslate";
import type {Form, FormLayout} from "~/store/api/types/submissions";

export interface AuthoringProject {
    id: string;
    title: string;
    canEdit: boolean;
    canMerge: boolean;
}

type DraftReviewState = "open" | "closed" | "merged";

export interface AuthoringDraftSummary {
    id: string;
    hasSavedChanges: boolean;
    updatedAt: string | null;
    pullRequest: {state: DraftReviewState} | null;
}

export interface WorkflowDraft {
    id: string;
    baseSha: string;
    baseCommitUrl?: string;
    headSha: string;
    hasBranch: boolean;
    pullRequest: {
        number: number;
        url: string;
        state: DraftReviewState;
        headSha: string;
        mergedSha: string | null;
    } | null;
}

export interface DraftFormChange {
    path: string;
    before: Form | null;
    after: Form | null;
}

export interface WorkflowDraftWorkspace {
    draft: WorkflowDraft;
    steps: DraftStepReference[];
    forms: DraftFormReference[];
    files: Record<string, string>;
    editablePaths: string[];
}

export interface DraftStepReference {
    name: string;
    title: LocalString;
    children: DraftStepReference[];
    actions: DraftStepAction[];
    completion: DraftCompletionRule | null;
}

export interface DraftStepAction {
    type: string;
    label: LocalString | null;
    roles: LocalString[];
    forms: {name: string; title: LocalString}[];
    allForms: boolean;
    conditional: boolean;
}

export interface DraftCompletionRule {
    kind: string;
    negated: boolean;
    label: LocalString | null;
    children: DraftCompletionRule[];
    operator: string | null;
    operand: string | null;
}

export interface DraftFormReference {
    path: string;
    name: string;
    title: LocalString;
    layout: FormLayout;
    steps: {name: string; actionLabels: LocalString[]}[];
}

export interface WorkspaceEdits {
    files: Record<string, string>;
    yamlFiles: string[];
}

interface DraftKey {
    project: string;
    draft: string;
}

export interface DraftHead extends DraftKey {
    expectedHeadSha: string;
}

interface DraftWorkspaceEdits extends DraftHead, WorkspaceEdits {}

const projectUrl = (project: string) => `/WorkflowDrafts/${encodeURIComponent(project)}`;
const draftUrl = ({project, draft}: DraftKey) =>
    `${projectUrl(project)}/${encodeURIComponent(draft)}`;

export const workflowDraftsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAuthoringProjects: builder.query<AuthoringProject[], void>({
            query: () => "/WorkflowDrafts",
        }),
        getAuthoringProjectDrafts: builder.query<
            {baseSha: string; drafts: AuthoringDraftSummary[]},
            string
        >({
            query: projectUrl,
        }),
        openWorkflowDraft: builder.mutation<WorkflowDraft, DraftKey>({
            query: (input) => ({url: draftUrl(input), method: "PUT"}),
        }),
        getWorkflowDraftWorkspace: builder.query<WorkflowDraftWorkspace, DraftKey>({
            query: (key) => `${draftUrl(key)}/Workspace`,
        }),
        getDraftFormChanges: builder.query<DraftFormChange[], DraftHead>({
            query: ({project, draft, expectedHeadSha}) => ({
                url: `${draftUrl({project, draft})}/Changes`,
                params: {expectedHeadSha},
            }),
        }),
        saveWorkflowDraft: builder.mutation<WorkflowDraftWorkspace, DraftWorkspaceEdits>({
            query: ({project, draft, ...body}) => ({
                url: `${draftUrl({project, draft})}/Workspace`,
                method: "PUT",
                body,
            }),
        }),
        previewWorkflowDraft: builder.mutation<Form, DraftWorkspaceEdits & {formPath: string}>({
            query: ({project, draft, formPath, ...body}) => ({
                url: `${draftUrl({project, draft})}/Preview`,
                params: {form: formPath},
                method: "POST",
                body,
            }),
        }),
        previewWorkflow: builder.mutation<
            {version: string; definition: string; screen: string | null},
            DraftWorkspaceEdits
        >({
            query: ({project, draft, ...body}) => ({
                url: `${draftUrl({project, draft})}/PreviewWorkflow`,
                method: "POST",
                body,
            }),
        }),
        proposeWorkflowDraft: builder.mutation<WorkflowDraft, DraftHead>({
            query: ({project, draft, expectedHeadSha}) => ({
                url: `${draftUrl({project, draft})}/PullRequest`,
                method: "POST",
                body: {expectedHeadSha},
            }),
        }),
        mergeWorkflowDraft: builder.mutation<WorkflowDraft, DraftHead>({
            query: ({project, draft, expectedHeadSha}) => ({
                url: `${draftUrl({project, draft})}/Merge`,
                method: "POST",
                body: {expectedHeadSha},
            }),
        }),
        discardWorkflowDraft: builder.mutation<
            boolean,
            DraftHead & {pullRequestNumber: number | null}
        >({
            query: ({project, draft, expectedHeadSha, pullRequestNumber}) => ({
                url: `${draftUrl({project, draft})}/Discard`,
                method: "POST",
                body: {expectedHeadSha, pullRequestNumber},
            }),
        }),
    }),
});

export function authoringErrorMessage(error: unknown, t: (key: string) => string) {
    const {error: code, message} =
        (error as {data?: {error?: string; message?: unknown}})?.data ?? {};
    switch (code) {
        case "GitHubUnavailable":
            return t("authoring_error_connection");
        case "DraftHeadChanged":
        case "DraftProposalChanged":
            return t("authoring_error_draft_changed");
        case "DraftBaseChanged":
            return t("authoring_error_workflow_changed");
        case "CannotPropose":
            return t("authoring_error_cannot_submit");
        case "MergeBlocked":
            return t("authoring_error_review_blocked");
        default:
            return typeof message === "string" ? message : t("authoring_error");
    }
}

export const {
    useGetAuthoringProjectsQuery,
    useGetAuthoringProjectDraftsQuery,
    useOpenWorkflowDraftMutation,
    useGetWorkflowDraftWorkspaceQuery,
    useGetDraftFormChangesQuery,
    useSaveWorkflowDraftMutation,
    usePreviewWorkflowDraftMutation,
    usePreviewWorkflowMutation,
    useProposeWorkflowDraftMutation,
    useMergeWorkflowDraftMutation,
    useDiscardWorkflowDraftMutation,
} = workflowDraftsApi;

import type {Action, WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

/**
 * Background content state — what fills the card body regardless of any open form.
 */
export type ContentState =
    | {type: "versionHistory"}
    | {type: "submissions"; regular: Submission[]; assessments: Submission[]}
    | {type: "empty"};

/**
 * Form overlay state — shown alongside the background content (not exclusive).
 */
export type FormState = {type: "inPage"; action: Action} | null;

/**
 * Modal overlay state — dialog shown on top of everything.
 */
export type ModalState =
    | {type: "formModal"; action: Action}
    | {type: "confirmationModal"; action: Action}
    | null;

const hasResults = (submission: Submission) => submission.form.pages.some((p) => p.hasResults);

export const getStepHierarchy = (step: WorkflowStep): WorkflowStep[] => [
    step,
    ...(step.children ?? []).flatMap((child) => getStepHierarchy(child)),
];

type ResolveParams = {
    step: WorkflowStep;
    actions: Action[];
    submissions: Submission[];
    resolvedAction: Action | null;
    isDisabled: boolean;
};

/**
 * Determines which submissions to display for a step.
 * Falls back to first version's submissions when no direct submissions exist.
 */
export function getSubmissionsToShow(submissions: Submission[], step: WorkflowStep): Submission[] {
    if (submissions.length > 0) return submissions;
    if (step.versions?.length === 1) return step.versions[0].submissions;
    return [];
}

/**
 * Resolves the background content state (always visible, independent of form).
 */
export function resolveContentState({
    step,
    actions,
    submissions,
    resolvedAction,
    isDisabled,
}: ResolveParams): ContentState {
    const submissionsToShow = getSubmissionsToShow(submissions, step);
    const showVersionCards = (step.versions?.flatMap((v) => v.submissions ?? []).length ?? 0) > 1;

    // 1. Version history (multiple versions with submissions)
    if (showVersionCards) {
        return {type: "versionHistory"};
    }

    // 2. Submissions exist (split into regular + assessment)
    if (submissionsToShow.length > 0) {
        const regular = submissionsToShow.filter((s) => !hasResults(s) && s.answers.length > 0);
        const assessments = submissionsToShow.filter((s) => hasResults(s));
        return {type: "submissions", regular, assessments};
    }

    // 3. Show assessment component even without submissions when resultsType is not Normal
    if (step.resultsType !== "Normal") {
        return {type: "submissions", regular: [], assessments: []};
    }

    // 4. Empty step — no submissions, no form open, no actions, not disabled
    const isFormOpen =
        resolvedAction?.type === "SubmitForm" && resolvedAction.formLayout !== "Modal";
    if (!isFormOpen && actions.length === 0 && !isDisabled) {
        return {type: "empty"};
    }

    // Default: empty (for disabled steps or steps with only actions/form)
    return {type: "empty"};
}

/**
 * Resolves the form overlay state (shown alongside background content).
 */
export function resolveFormState(resolvedAction: Action | null): FormState {
    if (resolvedAction?.type === "SubmitForm" && resolvedAction.formLayout !== "Modal") {
        return {type: "inPage", action: resolvedAction};
    }
    return null;
}

/**
 * Resolves the modal state (overlay, independent from body content).
 */
export function resolveModalState(activeAction: Action | null): ModalState {
    if (!activeAction) return null;

    if (activeAction.type === "SubmitForm" && activeAction.formLayout === "Modal") {
        return {type: "formModal", action: activeAction};
    }

    if (activeAction.type === "Execute") {
        return {type: "confirmationModal", action: activeAction};
    }

    return null;
}

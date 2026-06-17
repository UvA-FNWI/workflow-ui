import type {Action, WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

export type ContentState =
    | {type: "activeFormInPage"; action: Action}
    | {type: "versionHistory"}
    | {type: "submissions"; regular: Submission[]; assessments: Submission[]}
    | {type: "availableActions"}
    | {type: "empty"};

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
    activeAction: Action | null;
    isDisabled: boolean;
};

/**
 * Auto-resolves the active action when there's a single SubmitForm action
 * and no submissions have been submitted yet.
 */
export function getResolvedAction(
    activeAction: Action | null,
    actions: Action[],
    submissions: Submission[],
): Action | null {
    return (
        activeAction ??
        (actions.length === 1 &&
        actions[0].type === "SubmitForm" &&
        !submissions.some((s) => s.dateSubmitted)
            ? actions[0]
            : null)
    );
}

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
 * Resolves the content state (what fills the card body) based on step data.
 * Returns exactly one content state — first match wins.
 */
export function resolveContentState({
    step,
    actions,
    submissions,
    activeAction,
    isDisabled,
}: ResolveParams): ContentState {
    const resolvedAction = getResolvedAction(activeAction, actions, submissions);
    const submissionsToShow = getSubmissionsToShow(submissions, step);
    const showVersionCards =
        (step.versions?.length ?? 0) > 1 && step.versions!.some((v) => v.submissions?.length > 0);

    // 1. Active form in-page (SubmitForm action resolved + layout !== Modal)
    if (resolvedAction?.type === "SubmitForm" && resolvedAction.formLayout !== "Modal") {
        return {type: "activeFormInPage", action: resolvedAction};
    }

    // 2. Version history (multiple versions with submissions)
    if (showVersionCards) {
        return {type: "versionHistory"};
    }

    // 3. Submissions (single or multiple — component handles both)
    if (submissionsToShow.length > 0) {
        const regular = submissionsToShow.filter((s) => !hasResults(s));
        const assessments = submissionsToShow.filter((s) => hasResults(s));
        return {type: "submissions", regular, assessments};
    }

    // 4. Available actions (actions exist, no form is open)
    if (actions.length > 0) {
        return {type: "availableActions"};
    }

    // 5. Empty step (fallback — only if not disabled)
    if (!isDisabled) {
        return {type: "empty"};
    }

    return {type: "empty"};
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

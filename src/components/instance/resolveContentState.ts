import type {Action, WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

/**
 * Background content state — what fills the card body regardless of any open form.
 */
export type ContentState =
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

/** Indicates whether the step has any historical submissions to render as version cards. */
export function hasVersionHistory(step: WorkflowStep): boolean {
    return step.versions?.some((version) => version.submissions.length > 0) ?? false;
}

export function getPreviousFormVersion(step: WorkflowStep, form?: string): number | undefined {
    return getStepHierarchy(step)
        .flatMap((candidate) => candidate.versions ?? [])
        .find((version) => version.submissions.some((submission) => submission.id === form))
        ?.versionNumber;
}

/**
 * Resolves the background content state (always visible, independent of form).
 */
export function resolveContentState(step: WorkflowStep, submissions: Submission[]): ContentState {
    if (submissions.length > 0) {
        const regular = submissions.filter((s) => !hasResults(s) && s.answers.length > 0);
        const assessments = submissions.filter(hasResults);
        return {type: "submissions", regular, assessments};
    }

    if (step.resultsType !== "Normal") {
        return {type: "submissions", regular: [], assessments: []};
    }

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

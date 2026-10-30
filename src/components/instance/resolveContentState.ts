import type {WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

/**
 * Background content state — what fills the card body regardless of any open form.
 */
export type ContentState =
    {type: "submissions"; regular: Submission[]; assessments: Submission[]} | {type: "empty"};

const hasResults = (submission: Submission) => submission.form.pages.some((p) => p.hasResults);

export const getStepHierarchy = (step: WorkflowStep): WorkflowStep[] => [
    step,
    ...(step.children ?? []).flatMap((child) => getStepHierarchy(child)),
];

/** Empty and permission-filtered attempts still have a place in history. */
export function hasVersionHistory(step: WorkflowStep): boolean {
    return (step.versions?.history.length ?? 0) > 0;
}

export function getPreviousFormVersion(step: WorkflowStep, form?: string): number | undefined {
    return getStepHierarchy(step)
        .flatMap((candidate) => candidate.versions?.history ?? [])
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

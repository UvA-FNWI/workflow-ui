import type {Action, WorkflowStep, WorkflowStepVersion} from "~/store/api/types/instances.ts";
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

/**
 * Returns the highest version-bearing steps in each branch of a step hierarchy.
 *
 * The instance page renders cards for root steps only, while the API can attach
 * history to a nested step (for example EthicsSubmit after Ethics is reset).
 * Once a parent has its own history, its descendants are omitted because that
 * parent version already represents the completed branch.
 */
export function getVersionHistorySteps(step: WorkflowStep): WorkflowStep[] {
    if (hasVersionHistory(step)) return [step];

    return (step.children ?? []).flatMap((child) => getVersionHistorySteps(child));
}

/** Combines histories from separate hierarchy branches into one entry per version number. */
export function combineVersionHistory(steps: WorkflowStep[]): WorkflowStepVersion[] {
    const versionsByNumber = new Map<number, WorkflowStepVersion>();

    for (const version of steps.flatMap((step) => step.versions ?? [])) {
        const existing = versionsByNumber.get(version.versionNumber);
        if (!existing) {
            versionsByNumber.set(version.versionNumber, {
                ...version,
                eventIds: [...version.eventIds],
                submissions: [...version.submissions],
            });
            continue;
        }

        const submissionsById = new Map(
            [...existing.submissions, ...version.submissions].map((submission) => [
                submission.id,
                submission,
            ]),
        );
        versionsByNumber.set(version.versionNumber, {
            versionNumber: version.versionNumber,
            eventIds: [...new Set([...existing.eventIds, ...version.eventIds])],
            submittedAt:
                Date.parse(version.submittedAt) > Date.parse(existing.submittedAt)
                    ? version.submittedAt
                    : existing.submittedAt,
            submissions: [...submissionsById.values()],
        });
    }

    return [...versionsByNumber.values()].sort((a, b) => b.versionNumber - a.versionNumber);
}

export function getCurrentVersionNumber(versions: WorkflowStepVersion[]): number | undefined {
    const versionsWithSubmissions = versions.filter((version) => version.submissions.length > 0);

    if (!versionsWithSubmissions.length) return undefined;

    return Math.max(...versionsWithSubmissions.map((version) => version.versionNumber)) + 1;
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

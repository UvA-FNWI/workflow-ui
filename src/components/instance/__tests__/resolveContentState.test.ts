import {describe, expect, it} from "vitest";

import {
    getPreviousFormVersion,
    getStepHierarchy,
    resolveContentState,
    resolveFormState,
    resolveModalState,
} from "../resolveContentState.ts";
import type {Action, WorkflowStep, WorkflowStepVersion} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

const makeStep = (overrides: Partial<WorkflowStep> = {}): WorkflowStep => ({
    id: "step-1",
    title: {en: "Step 1", nl: "Stap 1"},
    icon: null,
    event: "event-1",
    dateCompleted: null,
    deadline: null,
    children: null,
    versions: null,
    headerStatus: null,
    hierarchyMode: "Parallel",
    resultsType: "Normal",
    expectsSubmission: false,
    hasSubmission: false,
    ...overrides,
});

const makeAction = (overrides: Partial<Action> = {}): Action => ({
    name: "action-1",
    id: "action-1",
    type: "SubmitForm",
    form: "submission-template-1",
    title: {en: "Submit", nl: "Indienen"},
    steps: ["step-1"],
    intent: "Primary",
    formLayout: "Normal",
    ...overrides,
});

const makeSubmission = (overrides: Partial<Submission> = {}): Submission => ({
    id: "sub-1",
    dateSubmitted: "2026-01-01T00:00:00Z",
    permissions: [],
    answers: [{id: "a1", questionName: "q1", value: "test", isVisible: true, files: []}],
    form: {
        name: "form-1",
        title: {en: "Form 1", nl: "Formulier 1"},
        layout: "Normal",
        pages: [
            {
                index: 0,
                name: "page-1",
                title: {en: "Page 1", nl: "Pagina 1"},
                layout: "Normal",
                elements: [],
                hasResults: false,
                isInCurrentForm: true,
            },
        ],
        step: "step-1",
    },
    ...overrides,
});

const makeVersion = (
    versionNumber: number,
    submissions: Submission[] = [],
): WorkflowStepVersion => ({
    versionNumber,
    completionTimestamp: `2026-01-0${versionNumber}T00:00:00Z`,
    submissions,
});
describe("getStepHierarchy", () => {
    it("returns the step itself when it has no children", () => {
        const step = makeStep();
        expect(getStepHierarchy(step)).toEqual([step]);
    });

    it("flattens nested children depth-first", () => {
        const grandchild = makeStep({id: "grandchild"});
        const child = makeStep({id: "child", children: [grandchild]});
        const sibling = makeStep({id: "sibling"});
        const parent = makeStep({id: "parent", children: [child, sibling]});

        expect(getStepHierarchy(parent).map((s) => s.id)).toEqual([
            "parent",
            "child",
            "grandchild",
            "sibling",
        ]);
    });
});

describe("getPreviousFormVersion", () => {
    it("returns the history version that contains the submission", () => {
        const step = makeStep({
            versions: {
                current: makeVersion(3, [makeSubmission({id: "proposal"})]),
                history: [
                    makeVersion(2, [makeSubmission({id: "proposal"})]),
                    makeVersion(1, [makeSubmission({id: "other"})]),
                ],
            },
        });

        expect(getPreviousFormVersion(step, "proposal")).toBe(2);
    });

    it("finds the submission in a child step's history", () => {
        const child = makeStep({
            id: "child",
            versions: {
                current: null,
                history: [makeVersion(1, [makeSubmission({id: "proposal"})])],
            },
        });
        const parent = makeStep({id: "parent", children: [child]});

        expect(getPreviousFormVersion(parent, "proposal")).toBe(1);
    });

    it("ignores the current version", () => {
        const step = makeStep({
            versions: {current: makeVersion(1, [makeSubmission({id: "proposal"})]), history: []},
        });

        expect(getPreviousFormVersion(step, "proposal")).toBeUndefined();
    });

    it("returns undefined when no history version contains the submission", () => {
        const step = makeStep({
            versions: {current: null, history: [makeVersion(1, [makeSubmission({id: "other"})])]},
        });

        expect(getPreviousFormVersion(step, "proposal")).toBeUndefined();
    });

    it("returns undefined when the step has no versions", () => {
        expect(getPreviousFormVersion(makeStep(), "proposal")).toBeUndefined();
    });

    it("returns undefined when no submission id is given", () => {
        const step = makeStep({
            versions: {current: null, history: [makeVersion(1, [makeSubmission()])]},
        });

        expect(getPreviousFormVersion(step)).toBeUndefined();
    });
});

describe("resolveContentState", () => {
    it("returns 'submissions' with regular and assessment submissions", () => {
        const regular = makeSubmission({id: "reg"});
        const assessment = makeSubmission({
            id: "assess",
            form: {
                name: "form-assess",
                title: {en: "Assessment", nl: "Beoordeling"},
                layout: "Normal",
                pages: [
                    {
                        index: 0,
                        name: "p1",
                        title: {en: "P1", nl: "P1"},
                        layout: "Normal",
                        elements: [],
                        hasResults: true,
                        isInCurrentForm: true,
                    },
                ],
                step: "step-1",
            },
        });
        const result = resolveContentState(makeStep(), [regular, assessment]);
        expect(result).toEqual({
            type: "submissions",
            regular: [regular],
            assessments: [assessment],
        });
    });

    it("returns 'submissions' (empty lists) when resultsType is not Normal", () => {
        const result = resolveContentState(makeStep({resultsType: "AssessmentPartOverview"}), []);
        expect(result).toEqual({type: "submissions", regular: [], assessments: []});
    });

    it("returns 'empty' when nothing exists", () => {
        const result = resolveContentState(makeStep(), []);
        expect(result).toEqual({type: "empty"});
    });

    it("shows submissions as background content", () => {
        const submission = makeSubmission();
        const result = resolveContentState(makeStep(), [submission]);
        expect(result.type).toBe("submissions");
    });

    it("filters out submissions with no answers from regular list", () => {
        const withAnswers = makeSubmission({id: "with-answers"});
        const withoutAnswers = makeSubmission({id: "no-answers", answers: []});
        const result = resolveContentState(makeStep(), [withAnswers, withoutAnswers]);
        expect(result).toEqual({
            type: "submissions",
            regular: [withAnswers],
            assessments: [],
        });
    });
});

describe("resolveFormState", () => {
    it("returns null when no resolved action", () => {
        expect(resolveFormState(null)).toBeNull();
    });

    it("returns 'inPage' for SubmitForm with non-Modal layout", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Normal"});
        expect(resolveFormState(action)).toEqual({type: "inPage", action});
    });

    it("returns 'inPage' for SubmitForm with Compact layout", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Compact"});
        expect(resolveFormState(action)).toEqual({type: "inPage", action});
    });

    it("returns null for SubmitForm with Modal layout (handled by modal state)", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Modal"});
        expect(resolveFormState(action)).toBeNull();
    });

    it("returns null for Execute action", () => {
        const action = makeAction({type: "Execute"});
        expect(resolveFormState(action)).toBeNull();
    });
});

describe("resolveModalState", () => {
    it("returns null when no active action", () => {
        expect(resolveModalState(null)).toBeNull();
    });

    it("returns 'formModal' for SubmitForm with Modal layout", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Modal"});
        expect(resolveModalState(action)).toEqual({type: "formModal", action});
    });

    it("returns 'confirmationModal' for Execute action", () => {
        const action = makeAction({type: "Execute", name: "approve"});
        expect(resolveModalState(action)).toEqual({type: "confirmationModal", action});
    });

    it("returns null for SubmitForm with non-Modal layout (handled as in-page)", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Normal"});
        expect(resolveModalState(action)).toBeNull();
    });
});

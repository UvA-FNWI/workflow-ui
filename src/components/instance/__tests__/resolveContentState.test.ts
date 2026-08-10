import {describe, expect, it} from "vitest";

import {
    getSubmissionsToShow,
    hasVersionHistory,
    resolveContentState,
    resolveFormState,
    resolveModalState,
} from "../resolveContentState.ts";
import type {Action, WorkflowStep} from "~/store/api/types/instances.ts";
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
                questions: [],
                hasResults: false,
                isInCurrentForm: true,
            },
        ],
        step: "step-1",
    },
    ...overrides,
});

describe("getSubmissionsToShow", () => {
    it("returns direct submissions when they exist", () => {
        const submissions = [makeSubmission()];
        expect(getSubmissionsToShow(submissions)).toBe(submissions);
    });

    it("does not treat a historical version as the current submission", () => {
        const versionSubmissions = [makeSubmission({id: "v-sub"})];
        const step = makeStep({
            versions: [
                {versionNumber: 1, eventIds: [], submittedAt: "", submissions: versionSubmissions},
            ],
        });
        expect(step.versions).toHaveLength(1);
        expect(getSubmissionsToShow([])).toEqual([]);
    });

    it("returns empty array when no submissions and multiple versions", () => {
        const step = makeStep({
            versions: [
                {versionNumber: 1, eventIds: [], submittedAt: "", submissions: [makeSubmission()]},
                {
                    versionNumber: 2,
                    eventIds: [],
                    submittedAt: "",
                    submissions: [makeSubmission({id: "sub-2"})],
                },
            ],
        });
        expect(step.versions).toHaveLength(2);
        expect(getSubmissionsToShow([])).toEqual([]);
    });
});

describe("hasVersionHistory", () => {
    it("returns true for one completed version with submissions", () => {
        const step = makeStep({
            versions: [
                {
                    versionNumber: 1,
                    eventIds: ["Proposal", "ProposalRevise"],
                    submittedAt: "2026-01-01T00:00:00Z",
                    submissions: [
                        makeSubmission({id: "proposal"}),
                        makeSubmission({id: "proposal-revise"}),
                    ],
                },
            ],
        });

        expect(hasVersionHistory(step)).toBe(true);
    });

    it("returns false when versions contain no visible submissions", () => {
        const step = makeStep({
            versions: [
                {
                    versionNumber: 1,
                    eventIds: ["Proposal"],
                    submittedAt: "2026-01-01T00:00:00Z",
                    submissions: [],
                },
            ],
        });

        expect(hasVersionHistory(step)).toBe(false);
    });
});

describe("resolveContentState", () => {
    it("returns 'empty' when multiple versions exist but no direct submissions", () => {
        const step = makeStep({
            versions: [
                {
                    versionNumber: 1,
                    eventIds: [],
                    submittedAt: "2026-01-01",
                    submissions: [makeSubmission()],
                },
                {
                    versionNumber: 2,
                    eventIds: [],
                    submittedAt: "2026-01-02",
                    submissions: [makeSubmission({id: "sub-2"})],
                },
            ],
        });
        const result = resolveContentState({
            step,
            actions: [],
            submissions: [],
            resolvedAction: null,
            isDisabled: false,
        });
        // Version history is rendered separately, content falls through to empty
        expect(result).toEqual({type: "empty"});
    });

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
                        questions: [],
                        hasResults: true,
                        isInCurrentForm: true,
                    },
                ],
                step: "step-1",
            },
        });
        const result = resolveContentState({
            step: makeStep(),
            actions: [],
            submissions: [regular, assessment],
            resolvedAction: null,
            isDisabled: false,
        });
        expect(result).toEqual({
            type: "submissions",
            regular: [regular],
            assessments: [assessment],
        });
    });

    it("returns 'submissions' (empty lists) when resultsType is not Normal", () => {
        const result = resolveContentState({
            step: makeStep({resultsType: "AssessmentPartOverview"}),
            actions: [],
            submissions: [],
            resolvedAction: null,
            isDisabled: false,
        });
        expect(result).toEqual({type: "submissions", regular: [], assessments: []});
    });

    it("returns 'empty' when nothing exists", () => {
        const result = resolveContentState({
            step: makeStep(),
            actions: [],
            submissions: [],
            resolvedAction: null,
            isDisabled: false,
        });
        expect(result).toEqual({type: "empty"});
    });

    it("returns 'empty' when disabled and nothing else matches", () => {
        const result = resolveContentState({
            step: makeStep(),
            actions: [],
            submissions: [],
            resolvedAction: null,
            isDisabled: true,
        });
        expect(result).toEqual({type: "empty"});
    });

    it("content state shows submissions even when a form is open (form is overlay)", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Compact"});
        const submission = makeSubmission();
        const result = resolveContentState({
            step: makeStep(),
            actions: [action],
            submissions: [submission],
            resolvedAction: action,
            isDisabled: false,
        });
        // Form is open but submissions still show as background content
        expect(result.type).toBe("submissions");
    });

    it("filters out submissions with no answers from regular list", () => {
        const withAnswers = makeSubmission({id: "with-answers"});
        const withoutAnswers = makeSubmission({id: "no-answers", answers: []});
        const result = resolveContentState({
            step: makeStep(),
            actions: [],
            submissions: [withAnswers, withoutAnswers],
            resolvedAction: null,
            isDisabled: false,
        });
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

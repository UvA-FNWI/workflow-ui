import {describe, expect, it} from "vitest";

import {
    getResolvedAction,
    getSubmissionsToShow,
    resolveContentState,
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
    answers: [],
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
        formType: "Normal",
        step: "step-1",
    },
    ...overrides,
});

describe("getResolvedAction", () => {
    it("returns activeAction when set", () => {
        const action = makeAction();
        expect(getResolvedAction(action, [], [])).toBe(action);
    });

    it("auto-resolves single SubmitForm when no submissions submitted", () => {
        const action = makeAction({type: "SubmitForm"});
        const submission = makeSubmission({dateSubmitted: undefined});
        expect(getResolvedAction(null, [action], [submission])).toBe(action);
    });

    it("does NOT auto-resolve when a submission is already submitted", () => {
        const action = makeAction({type: "SubmitForm"});
        const submission = makeSubmission({dateSubmitted: "2026-01-01"});
        expect(getResolvedAction(null, [action], [submission])).toBeNull();
    });

    it("does NOT auto-resolve when multiple actions exist", () => {
        const action1 = makeAction({id: "a1", name: "a1"});
        const action2 = makeAction({id: "a2", name: "a2"});
        expect(getResolvedAction(null, [action1, action2], [])).toBeNull();
    });

    it("does NOT auto-resolve Execute actions", () => {
        const action = makeAction({type: "Execute"});
        expect(getResolvedAction(null, [action], [])).toBeNull();
    });
});

describe("getSubmissionsToShow", () => {
    it("returns direct submissions when they exist", () => {
        const submissions = [makeSubmission()];
        const step = makeStep({
            versions: [
                {
                    versionNumber: 1,
                    eventIds: [],
                    submittedAt: "",
                    submissions: [makeSubmission({id: "v-sub"})],
                },
            ],
        });
        expect(getSubmissionsToShow(submissions, step)).toBe(submissions);
    });

    it("falls back to first version submissions when no direct submissions and one version", () => {
        const versionSubmissions = [makeSubmission({id: "v-sub"})];
        const step = makeStep({
            versions: [
                {versionNumber: 1, eventIds: [], submittedAt: "", submissions: versionSubmissions},
            ],
        });
        expect(getSubmissionsToShow([], step)).toBe(versionSubmissions);
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
        expect(getSubmissionsToShow([], step)).toEqual([]);
    });
});

describe("resolveContentState", () => {
    it("returns 'activeFormInPage' when SubmitForm action with non-Modal layout is resolved", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Normal"});
        const result = resolveContentState({
            step: makeStep(),
            actions: [action],
            submissions: [],
            activeAction: action,
            isDisabled: false,
        });
        expect(result).toEqual({type: "activeFormInPage", action});
    });

    it("returns 'versionHistory' when multiple versions with submissions exist", () => {
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
            activeAction: null,
            isDisabled: false,
        });
        expect(result).toEqual({type: "versionHistory"});
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
                formType: "Normal",
                step: "step-1",
            },
        });
        const result = resolveContentState({
            step: makeStep(),
            actions: [],
            submissions: [regular, assessment],
            activeAction: null,
            isDisabled: false,
        });
        expect(result).toEqual({
            type: "submissions",
            regular: [regular],
            assessments: [assessment],
        });
    });

    it("returns 'availableActions' when actions exist but no form/submissions", () => {
        const action = makeAction({type: "Execute"});
        const result = resolveContentState({
            step: makeStep(),
            actions: [action],
            submissions: [],
            activeAction: null,
            isDisabled: false,
        });
        expect(result).toEqual({type: "availableActions"});
    });

    it("returns 'empty' when nothing exists", () => {
        const result = resolveContentState({
            step: makeStep(),
            actions: [],
            submissions: [],
            activeAction: null,
            isDisabled: false,
        });
        expect(result).toEqual({type: "empty"});
    });

    it("returns 'empty' when disabled and nothing else matches", () => {
        const result = resolveContentState({
            step: makeStep(),
            actions: [],
            submissions: [],
            activeAction: null,
            isDisabled: true,
        });
        expect(result).toEqual({type: "empty"});
    });

    it("prioritizes activeFormInPage over submissions", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Compact"});
        const submission = makeSubmission();
        const result = resolveContentState({
            step: makeStep(),
            actions: [action],
            submissions: [submission],
            activeAction: action,
            isDisabled: false,
        });
        expect(result).toEqual({type: "activeFormInPage", action});
    });

    it("does NOT return activeFormInPage for Modal layout (falls through to other states)", () => {
        const action = makeAction({type: "SubmitForm", formLayout: "Modal"});
        const result = resolveContentState({
            step: makeStep(),
            actions: [action],
            submissions: [],
            activeAction: action,
            isDisabled: false,
        });
        // Modal form doesn't show in-page — falls through to availableActions
        expect(result).toEqual({type: "availableActions"});
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

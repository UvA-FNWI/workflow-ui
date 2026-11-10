import {describe, expect, it} from "vitest";

import {
    getPreviousFormVersion,
    hasVersionHistory,
    resolveContentState,
} from "../resolveContentState.ts";
import type {WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

const makeStep = (overrides: Partial<WorkflowStep> = {}): WorkflowStep => ({
    id: "step-1",
    isAvailable: true,
    title: {en: "Step 1", nl: "Stap 1"},
    icon: null,
    event: "event-1",
    dateCompleted: null,
    deadline: null,
    children: null,
    versions: null,
    submissions: [],
    headerStatus: null,
    hierarchyMode: "Parallel",
    childrenLayout: "Combined",
    resultsType: "Normal",
    expectsSubmission: false,
    hasSubmission: false,
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
                isActive: true,
            },
        ],
        step: "step-1",
    },
    ...overrides,
});

describe("hasVersionHistory", () => {
    it("returns true for one completed version with submissions", () => {
        const step = makeStep({
            versions: {
                current: null,
                history: [
                    {
                        versionNumber: 1,
                        completionTimestamp: "2026-01-01T00:00:00Z",
                        submissions: [
                            makeSubmission({id: "proposal"}),
                            makeSubmission({id: "proposal-revise"}),
                        ],
                    },
                ],
            },
        });

        expect(hasVersionHistory(step)).toBe(true);
    });

    it("keeps history when permissions hide all submissions", () => {
        const step = makeStep({
            versions: {
                current: null,
                history: [
                    {
                        versionNumber: 1,
                        completionTimestamp: "2026-01-01T00:00:00Z",
                        submissions: [],
                    },
                ],
            },
        });

        expect(hasVersionHistory(step)).toBe(true);
    });
});

it.each([true, false])(
    "finds a previous form in child history only when its submission is visible: %s",
    (visible) => {
        const submission = makeSubmission({id: "Draft"});
        const child = makeStep({
            versions: {
                current: {versionNumber: 4, completionTimestamp: null, submissions: [submission]},
                history: [
                    {
                        versionNumber: 3,
                        completionTimestamp: null,
                        submissions: visible ? [submission] : [],
                    },
                ],
            },
        });
        const step = makeStep({children: [child]});

        expect(getPreviousFormVersion(step, "Draft")).toBe(visible ? 3 : undefined);
    },
);

describe("resolveContentState", () => {
    it("returns 'empty' when multiple versions exist but no direct submissions", () => {
        const step = makeStep({
            versions: {
                current: null,
                history: [
                    {
                        versionNumber: 1,
                        completionTimestamp: "2026-01-01",
                        submissions: [makeSubmission()],
                    },
                    {
                        versionNumber: 2,
                        completionTimestamp: "2026-01-02",
                        submissions: [makeSubmission({id: "sub-2"})],
                    },
                ],
            },
        });
        const result = resolveContentState(step, []);
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
                        elements: [],
                        hasResults: true,
                        isInCurrentForm: true,
                        isActive: true,
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

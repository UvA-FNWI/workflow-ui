import {describe, expect, it} from "vitest";

import type {Answer, Page, Question, Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs, isPageComplete} from "~/utils/submissionUtils.ts";

const question = (overrides: Partial<Question> = {}): Question => ({
    name: "question",
    type: "Double",
    text: {en: "Question", nl: "Vraag"},
    isRequired: false,
    isArray: false,
    choices: [],
    hideInResults: false,
    weight: null,
    percentage: null,
    allowsExternalUsers: false,
    ...overrides,
});

const answer = (overrides: Partial<Answer> = {}): Answer => ({
    id: "answer",
    questionName: "question",
    value: 7,
    isVisible: true,
    files: [],
    ...overrides,
});

const page = (questions: Question[]): Page => ({
    index: 0,
    name: "page",
    title: {en: "Page", nl: "Pagina"},
    layout: "Normal",
    questions,
    hasResults: true,
    isInCurrentForm: true,
});

const submission = (questions: Question[], answers: Answer[]): Submission => ({
    id: "submission",
    permissions: [],
    answers,
    form: {
        name: "form",
        title: {en: "Form", nl: "Formulier"},
        layout: "Normal",
        pages: [page(questions)],
    },
});

describe("getVisibleQuestionAnswerPairs", () => {
    it("uses the percentage supplied with the question", () => {
        const questions = [question({percentage: 40})];

        const pairs = getVisibleQuestionAnswerPairs(questions, [answer()]);

        expect(pairs[0].percentage).toBe(40);
    });
});

describe("isPageComplete", () => {
    it.each([false, null, undefined, "true", 1])(
        "requires an explicit true for a required Check (value: %s)",
        (value) => {
            const required = question({type: "Check", isRequired: true});
            expect(
                isPageComplete(page([required]), submission([required], [answer({value})])),
            ).toBe(false);
        },
    );

    it("requires every visible required Check to be checked", () => {
        const questions = [
            question({name: "integrity", type: "Check", isRequired: true}),
            question({name: "own-work", type: "Check", isRequired: true}),
        ];
        const currentSubmission = submission(questions, [
            answer({questionName: "integrity", value: true}),
        ]);
        expect(isPageComplete(page(questions), currentSubmission)).toBe(false);
        currentSubmission.answers.push(answer({questionName: "own-work", value: true}));
        expect(isPageComplete(page(questions), currentSubmission)).toBe(true);
    });

    it("allows an unchecked optional Check", () => {
        const optional = question({type: "Check"});
        expect(
            isPageComplete(page([optional]), submission([optional], [answer({value: false})])),
        ).toBe(true);
    });

    it("ignores a hidden required Check", () => {
        const required = question({type: "Check", isRequired: true});
        expect(
            isPageComplete(
                page([required]),
                submission([required], [answer({value: false, isVisible: false})]),
            ),
        ).toBe(true);
    });

    it("keeps a checked required Check incomplete when it has a validation error", () => {
        const required = question({type: "Check", isRequired: true});
        expect(
            isPageComplete(
                page([required]),
                submission(
                    [required],
                    [answer({value: true, validationError: {en: "Invalid", nl: "Ongeldig"}})],
                ),
            ),
        ).toBe(false);
    });

    it("is complete when all required questions are answered", () => {
        const required = question({name: "required", isRequired: true});
        const optional = question({name: "optional"});
        const currentPage = page([required, optional]);
        const currentSubmission = submission([required, optional], []);

        expect(isPageComplete(currentPage, currentSubmission)).toBe(false);

        currentSubmission.answers.push(answer({questionName: required.name}));

        expect(isPageComplete(currentPage, currentSubmission)).toBe(true);
    });

    it("only requires weighted questions that are required in weighted-only mode", () => {
        const requiredWeighted = question({name: "required-weighted", isRequired: true, weight: 1});
        const optionalWeighted = question({name: "optional-weighted", weight: 1});
        const currentPage = page([requiredWeighted, optionalWeighted]);
        const currentSubmission = submission([requiredWeighted, optionalWeighted], []);

        expect(isPageComplete(currentPage, currentSubmission, true)).toBe(false);

        currentSubmission.answers.push(answer({questionName: requiredWeighted.name}));

        expect(isPageComplete(currentPage, currentSubmission, true)).toBe(true);
    });

    it("ignores hidden required questions", () => {
        const required = question({isRequired: true});
        const currentPage = page([required]);
        const currentSubmission = submission([required], [answer({value: null, isVisible: false})]);

        expect(isPageComplete(currentPage, currentSubmission)).toBe(true);
    });
});

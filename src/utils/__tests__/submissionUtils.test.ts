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
    it("requires every weighted question, including optional questions", () => {
        const weighted = question({weight: 1});
        const unweightedRequired = question({name: "required", isRequired: true});
        const currentPage = page([weighted, unweightedRequired]);
        const currentSubmission = submission([weighted, unweightedRequired], []);

        expect(isPageComplete(currentPage, currentSubmission, true)).toBe(false);

        currentSubmission.answers.push(answer());

        expect(isPageComplete(currentPage, currentSubmission, true)).toBe(true);
    });

    it("ignores hidden weighted questions", () => {
        const weighted = question({weight: 1});
        const currentPage = page([weighted]);
        const currentSubmission = submission([weighted], [answer({value: null, isVisible: false})]);

        expect(isPageComplete(currentPage, currentSubmission, true)).toBe(true);
    });
});

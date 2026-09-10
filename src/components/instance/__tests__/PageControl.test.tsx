import "@testing-library/jest-dom/vitest";
import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@uva-fnwi/datanose-ui";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {PageControl} from "../PageControl";
import type {SaveAnswerResult} from "~/store/api/types/returnTypes";
import type {Question, Submission} from "~/store/api/types/submissions";

const {getSubmission, saveAnswer} = vi.hoisted(() => ({
    getSubmission: vi.fn(),
    saveAnswer: vi.fn(),
}));

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (text?: {en?: string}) => text?.en ?? "",
        i18n: {language: "en"},
    }),
}));
vi.mock("~/store/api/submissionsApi", () => ({
    submissionsEndpoints: {getSubmission: {useQuery: getSubmission}},
}));
vi.mock("~/store/api/answersApi", () => ({
    answersApi: {
        endpoints: {
            saveAnswer: {useMutation: () => [saveAnswer]},
            saveFile: {useMutation: () => [vi.fn()]},
        },
    },
}));
vi.mock("~/store/api/assessmentsApi.ts", () => ({
    assessmentsApi: {endpoints: {getPageResults: {useQuery: () => ({})}}},
}));

const question = (name: string, type: Question["type"] = "String"): Question => ({
    name,
    type,
    text: {en: name, nl: name},
    isRequired: true,
    isArray: false,
    hideInResults: false,
    allowsExternalUsers: false,
    weight: null,
    percentage: null,
    choices: [],
});

function submission(): Submission {
    const questions = [question("Title"), question("Subject"), question("Declaration", "Boolean")];
    return {
        id: "form",
        permissions: [],
        form: {
            name: "form",
            title: {en: "Form", nl: "Formulier"},
            layout: "Normal",
            pages: [
                {
                    index: 0,
                    name: "page",
                    title: {en: "Page", nl: "Pagina"},
                    layout: "Normal",
                    questions,
                    hasResults: false,
                    isInCurrentForm: true,
                },
            ],
        },
        answers: questions.map((q) => ({
            id: q.name,
            questionName: q.name,
            isVisible: true,
            files: [],
            value: q.type === "Boolean" ? false : "original",
        })),
    };
}

function renderPage() {
    let current = submission();
    getSubmission.mockImplementation(() => ({data: current}));
    const page = () => (
        <PageControl instanceId="instance" submissionId="form" page={current.form.pages[0]} />
    );
    const view = render(page());
    return {
        publish(questionName: string, value: unknown, isVisible = true): SaveAnswerResult {
            current = {
                ...current,
                answers: current.answers.map((answer) =>
                    answer.questionName === questionName ? {...answer, value, isVisible} : answer,
                ),
            };
            view.rerender(page());
            return {submission: current, answers: current.answers};
        },
    };
}

beforeEach(() => {
    vi.useFakeTimers();
    saveAnswer.mockReset().mockImplementation(({answer}) => {
        const current = submission();
        current.answers = current.answers.map((a) =>
            a.questionName === answer.questionName ? {...a, value: answer.value} : a,
        );
        return {unwrap: async () => ({submission: current, answers: current.answers})};
    });
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("PageControl answer synchronization", () => {
    it("saves the latest edit immediately when switching tabs before the debounce fires", async () => {
        let current = submission();
        const pending = Promise.withResolvers<SaveAnswerResult>();
        saveAnswer.mockReturnValue({unwrap: () => pending.promise});
        getSubmission.mockImplementation(() => ({data: current}));
        render(
            <Tabs>
                <TabList>
                    <Tab>Answers</Tab>
                    <Tab>Next page</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <PageControl
                            instanceId="instance"
                            submissionId="form"
                            page={current.form.pages[0]}
                        />
                    </TabPanel>
                    <TabPanel>Next page content</TabPanel>
                </TabPanels>
            </Tabs>,
        );
        const title = screen.getAllByRole("textbox")[0];
        fireEvent.change(title, {target: {value: "first edit"}});
        fireEvent.change(title, {target: {value: "last edit"}});
        expect(saveAnswer).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("tab", {name: "Next page"}));
        expect(screen.queryAllByRole("textbox")).toHaveLength(0);
        expect(saveAnswer).toHaveBeenCalledExactlyOnceWith({
            instanceId: "instance",
            submissionId: "form",
            answer: {questionName: "Title", value: "last edit"},
        });

        current = {
            ...current,
            answers: current.answers.map((a) =>
                a.questionName === "Title" ? {...a, value: "last edit"} : a,
            ),
        };
        await act(async () => pending.resolve({submission: current, answers: current.answers}));
        fireEvent.click(screen.getByRole("tab", {name: "Answers"}));
        expect(screen.getAllByRole("textbox")[0]).toHaveValue("last edit");
        await act(() => vi.advanceTimersByTimeAsync(500));
        expect(saveAnswer).toHaveBeenCalledOnce();
    });

    it("keeps newer typing while an earlier save response updates other fields", async () => {
        const first = Promise.withResolvers<SaveAnswerResult>();
        const second = Promise.withResolvers<SaveAnswerResult>();
        saveAnswer
            .mockReturnValueOnce({unwrap: () => first.promise})
            .mockReturnValueOnce({unwrap: () => second.promise});
        const view = renderPage();
        const [title, subject] = screen.getAllByRole("textbox");
        fireEvent.change(title, {target: {value: "first edit"}});
        await act(() => vi.advanceTimersByTimeAsync(500));
        fireEvent.change(title, {target: {value: "newer edit"}});

        const firstResponse = view.publish("Title", "first edit");
        await act(async () => first.resolve(firstResponse));
        view.publish("Subject", "server update");
        expect(title).toHaveValue("newer edit");
        expect(subject).toHaveValue("server update");

        await act(() => vi.advanceTimersByTimeAsync(500));
        expect(saveAnswer).toHaveBeenLastCalledWith({
            instanceId: "instance",
            submissionId: "form",
            answer: {questionName: "Title", value: "newer edit"},
        });
        const secondResponse = view.publish("Title", "normalized edit");
        await act(async () => second.resolve(secondResponse));
        expect(title).toHaveValue("normalized edit");
        view.publish("Title", "external update");
        expect(title).toHaveValue("external update");
    });

    it("preserves a draft before its debounce has fired", () => {
        const view = renderPage();
        const [title, subject] = screen.getAllByRole("textbox");
        fireEvent.change(title, {target: {value: "unsaved draft"}});
        view.publish("Subject", "changed elsewhere");
        expect(title).toHaveValue("unsaved draft");
        expect(subject).toHaveValue("changed elsewhere");
        expect(saveAnswer).not.toHaveBeenCalled();
    });

    it("preserves an unchecked draft even when it matches the original value", async () => {
        const pending = Promise.withResolvers<SaveAnswerResult>();
        saveAnswer.mockReturnValue({unwrap: () => pending.promise});
        const view = renderPage();
        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);
        await act(() => vi.advanceTimersByTimeAsync(500));
        fireEvent.click(checkbox);
        const response = view.publish("Declaration", true);
        await act(async () => pending.resolve(response));
        expect(checkbox).not.toBeChecked();
    });

    it("restores a conditionally visible question from the server", () => {
        const view = renderPage();
        view.publish("Title", null, false);
        expect(screen.getAllByRole("textbox")).toHaveLength(1);
        view.publish("Title", "restored");
        expect(screen.getAllByRole("textbox")[0]).toHaveValue("restored");
    });

    it("keeps a failed save's draft when another answer refreshes", async () => {
        const pending = Promise.withResolvers<SaveAnswerResult>();
        saveAnswer.mockReturnValue({unwrap: () => pending.promise});
        vi.spyOn(console, "error").mockImplementation(() => {});
        const view = renderPage();
        const title = screen.getAllByRole("textbox")[0];
        fireEvent.change(title, {target: {value: "keep this draft"}});
        await act(() => vi.advanceTimersByTimeAsync(500));
        await act(async () => pending.reject(new Error("offline")));
        view.publish("Subject", "updated");
        expect(title).toHaveValue("keep this draft");
    });
});

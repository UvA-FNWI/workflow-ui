import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {PageControl} from "../PageControl";
import type {Answer, Page, Question, Submission} from "~/store/api/types/submissions";

const state = vi.hoisted(() => ({submission: undefined as Submission | undefined}));

vi.mock("~/store/api/submissionsApi", () => ({
    submissionsEndpoints: {getSubmission: {useQuery: () => ({data: state.submission})}},
}));
vi.mock("~/store/api/answersApi", () => ({
    answersApi: {
        endpoints: Object.fromEntries(
            ["saveAnswer", "saveFile", "deleteFile"].map((name) => [
                name,
                {useMutation: () => [vi.fn()]},
            ]),
        ),
    },
}));
vi.mock("~/store/api/assessmentsApi.ts", () => ({
    assessmentsApi: {endpoints: {getPageResults: {useQuery: () => ({})}}},
}));
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({t: (key: string) => key, l: () => "", i18n: {language: "en"}}),
}));
vi.mock("~/components/instance/InputControl", () => ({
    InputControl: ({
        value,
        onChange,
        question,
    }: {
        value: string;
        onChange: (value: string) => void;
        question: Question;
    }) => {
        const Field = question.layout && "multiline" in question.layout ? "textarea" : "input";
        return (
            <Field
                aria-label={question.name}
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
            />
        );
    },
}));
vi.mock("../FileUploadTable", () => ({FileUploadTable: () => null}));

const page: Page = {
    name: "Details",
    index: 0,
    title: {en: "Details", nl: "Details"},
    layout: "Normal",
    hasResults: false,
    isInCurrentForm: true,
    isActive: true,
    elements: ["First", "Second"].map((name) => ({
        kind: "Question",
        question: {name, type: "String", isRequired: false} as Question,
    })),
};

function updateAnswers(first: string, second: string, secondVisible = true) {
    state.submission = {
        id: "submission",
        permissions: [],
        form: {name: "form", title: page.title, layout: "Normal", pages: [page]},
        answers: [
            {questionName: "First", value: first, isVisible: true},
            {questionName: "Second", value: second, isVisible: secondVisible},
        ] as Answer[],
    };
}

const control = () => <PageControl instanceId="instance" submissionId="submission" page={page} />;

afterEach(cleanup);

it.each([false, true])(
    "preserves the caret when backspacing to the previous server value (multiline: %s)",
    (multiline) => {
        const textPage: Page = {
            ...page,
            elements: page.elements.map((element) => ({
                ...element,
                question: {
                    ...element.question!,
                    layout: multiline ? {multiline: true, allowAttachments: false} : undefined,
                },
            })),
        };
        const renderControl = () => (
            <PageControl instanceId="instance" submissionId="submission" page={textPage} />
        );
        updateAnswers("hello world", "original");
        const {rerender} = render(renderControl());
        const input = screen.getByLabelText("First") as HTMLInputElement | HTMLTextAreaElement;
        input.focus();

        fireEvent.change(input, {
            target: {value: "helloX world", selectionStart: 6, selectionEnd: 6},
        });
        // Delete the insertion while its save is still in flight.
        fireEvent.change(input, {
            target: {value: "hello world", selectionStart: 5, selectionEnd: 5},
        });
        updateAnswers("helloX world", "original");
        rerender(renderControl());

        expect(input).toHaveValue("hello world");
        expect(input).toHaveFocus();
        expect(input.selectionStart).toBe(5);
        expect(input.selectionEnd).toBe(5);
    },
);

it("keeps newer edits to both fields when a delayed save updates the submission", () => {
    updateAnswers("saved", "original");
    const {rerender} = render(control());

    fireEvent.change(screen.getByLabelText("First"), {target: {value: "newer draft"}});
    fireEvent.change(screen.getByLabelText("Second"), {target: {value: "pending draft"}});
    updateAnswers("older draft", "original");
    rerender(control());

    expect(screen.getByLabelText("First")).toHaveValue("newer draft");
    expect(screen.getByLabelText("Second")).toHaveValue("pending draft");
});

it("preserves edits and the caret after moving focus to another question", () => {
    updateAnswers("first", "second");
    const {rerender} = render(control());
    const first = screen.getByLabelText("First");
    const second = screen.getByLabelText("Second") as HTMLInputElement;

    first.focus();
    fireEvent.change(first, {target: {value: "first draft"}});
    second.focus();
    fireEvent.change(second, {target: {value: "secXond"}});
    fireEvent.change(second, {target: {value: "second", selectionStart: 3, selectionEnd: 3}});

    updateAnswers("first draft", "secXond");
    rerender(control());

    expect(first).toHaveValue("first draft");
    expect(second).toHaveValue("second");
    expect(second).toHaveFocus();
    expect(second.selectionStart).toBe(3);
});

it("applies server changes to untouched fields and clears acknowledged answers", () => {
    updateAnswers("saved", "original");
    const {rerender} = render(control());
    fireEvent.change(screen.getByLabelText("First"), {target: {value: "new draft"}});

    updateAnswers("new draft", "server update");
    rerender(control());
    expect(screen.getByLabelText("First")).toHaveValue("new draft");
    expect(screen.getByLabelText("Second")).toHaveValue("server update");

    updateAnswers("", "");
    rerender(control());
    expect(screen.getByLabelText("First")).toHaveValue("");
    expect(screen.getByLabelText("Second")).toHaveValue("");
});

it("loads answers that arrive after mounting and restores newly visible questions", () => {
    state.submission = undefined;
    const {rerender} = render(control());
    updateAnswers("loaded", "original");
    rerender(control());
    expect(screen.getByLabelText("First")).toHaveValue("loaded");

    fireEvent.change(screen.getByLabelText("Second"), {target: {value: "unsaved draft"}});
    updateAnswers("loaded", "original", false);
    rerender(control());
    expect(screen.queryByLabelText("Second")).not.toBeInTheDocument();

    updateAnswers("loaded", "restored");
    rerender(control());
    expect(screen.getByLabelText("Second")).toHaveValue("restored");
});

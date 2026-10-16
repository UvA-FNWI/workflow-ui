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
    }) => (
        <input
            aria-label={question.name}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
        />
    ),
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

    updateAnswers("loaded", "original", false);
    rerender(control());
    expect(screen.queryByLabelText("Second")).not.toBeInTheDocument();

    updateAnswers("loaded", "restored");
    rerender(control());
    expect(screen.getByLabelText("Second")).toHaveValue("restored");
});

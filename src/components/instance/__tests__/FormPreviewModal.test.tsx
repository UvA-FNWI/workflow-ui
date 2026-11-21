import {Provider} from "react-redux";

import {configureStore, type Middleware} from "@reduxjs/toolkit";
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";

import {FormPreviewModal} from "../FormPreviewModal";
import {baseApi} from "~/store/api/baseApi";
import type {FormPreview} from "~/store/api/types/formPreviews";

const request = vi.hoisted(() => vi.fn());
vi.mock("~/store/api/baseApi", async () => {
    const {createApi} = await import("@reduxjs/toolkit/query/react");
    return {baseApi: createApi({reducerPath: "api", baseQuery: request, endpoints: () => ({})})};
});
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string, options?: {answered?: number; total?: number; form?: string}) =>
            key === "form_preview.calculation_progress"
                ? `${options?.answered} of ${options?.total} values entered`
                : key === "form_preview.single_title"
                  ? `Preview: ${options?.form}`
                  : key,
        l: (value?: {en: string} | null) => value?.en ?? "",
        i18n: {language: "en"},
    }),
}));
vi.mock("~/components/UserPicker/UserPicker", () => ({
    UserPicker: ({allowsExternalUsers}: {allowsExternalUsers: boolean}) => (
        <div role="group" aria-label="Users">
            {allowsExternalUsers && <button>Add external user</button>}
        </div>
    ),
}));

const forms = [
    {name: "Review", title: {en: "Review form", nl: "Beoordeling"}},
    {name: "Other", title: {en: "Other form", nl: "Ander formulier"}},
];

function response(value: unknown = null): FormPreview {
    return {
        formName: "Review",
        form: {
            name: "Review",
            title: forms[0].title,
            layout: "Normal",
            pages: ["First", "Second"].map((name, index) => ({
                name,
                index,
                title: {en: name, nl: name},
                layout: "Normal",
                isInCurrentForm: true,
                isActive: true,
                hasResults: false,
                elements:
                    index === 0
                        ? [
                              {
                                  kind: "Question",
                                  question: {
                                      name: "Answer",
                                      type: "String",
                                      text: {en: "Answer", nl: "Antwoord"},
                                      isRequired: true,
                                      isArray: false,
                                      hideInResults: false,
                                  },
                              },
                              {
                                  kind: "Question",
                                  question: {
                                      name: "File",
                                      type: "File",
                                      text: {en: "Document", nl: "Document"},
                                      isRequired: false,
                                      isArray: false,
                                      hideInResults: false,
                                      allowedFileTypes: ["pdf"],
                                      allowedFileSize: 1000,
                                  },
                              },
                          ]
                        : [],
            })),
        },
        answers: [
            {id: "answer", questionName: "Answer", isVisible: true, value, files: []},
            {id: "file", questionName: "File", isVisible: true, value: null, files: []},
        ],
        referenceChoices: {},
        pageResults: [],
    };
}

function mount(availableForms = forms.slice(0, 1)) {
    const store = configureStore({
        reducer: {[baseApi.reducerPath]: baseApi.reducer},
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(baseApi.middleware as Middleware),
    });
    const onClose = vi.fn();
    const rendered = render(
        <Provider store={store}>
            <FormPreviewModal instanceId="instance" forms={availableForms} onClose={onClose} />
        </Provider>,
    );
    return {...rendered, store, onClose};
}

beforeEach(() => {
    request.mockImplementation(async (arg: {body: {answers: Record<string, unknown>}}) => ({
        data: response(arg.body.answers.Answer ?? null),
    }));
});
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

it("opens one form directly and allows incomplete navigation without submit or uploads", async () => {
    mount();
    await screen.findByRole("textbox", {name: "Answer"});
    expect(screen.getByText("form_preview.temporary_notice")).toBeInTheDocument();
    expect(screen.queryByText("form_preview.section_count")).not.toBeInTheDocument();
    expect(screen.getByText("form_preview.uploads_unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: /submit/i})).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: "next"}));
    expect(screen.getByRole("tab", {name: "Second"})).toHaveAttribute("aria-selected", "true");
    expect(request).toHaveBeenCalledTimes(1);
});

it("offers a chooser for several forms and discards answers when switching", async () => {
    const {unmount} = mount(forms);
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Review form"}));
    fireEvent.change(await screen.findByRole("textbox", {name: "Answer"}), {
        target: {value: "temporary"},
    });
    fireEvent.change(screen.getByRole("combobox", {hidden: true}), {target: {value: "Other"}});
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(request.mock.calls[1][0].body.answers).toEqual({});
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(request).toHaveBeenCalledTimes(2);
});

it("uses one title and lets the tabs identify each section", async () => {
    mount(forms);
    fireEvent.click(screen.getByRole("button", {name: "Review form"}));
    await screen.findByRole("textbox", {name: "Answer"});

    expect(screen.getByRole("heading", {name: "form_preview.title"})).toBeVisible();
    expect(screen.queryByRole("heading", {name: "Review form"})).not.toBeInTheDocument();
    expect(screen.getByRole("tab", {name: "First"})).toBeVisible();
    expect(screen.queryByRole("heading", {name: "First"})).not.toBeInTheDocument();
});

it("keeps an optional checkbox marker beside its control", async () => {
    const data = response();
    data.form.pages[0].elements = [
        {
            kind: "Question",
            question: {
                name: "ShowExtra",
                text: {en: "Show extra page", nl: "Extra pagina tonen"},
                type: "Check",
                isRequired: false,
                isArray: false,
                hideInResults: false,
            },
        },
    ];
    data.answers = [
        {id: "check", questionName: "ShowExtra", value: false, isVisible: true, files: []},
    ];
    request.mockResolvedValue({data});
    mount();
    const checkbox = await screen.findByRole("checkbox", {name: "Show extra page"});

    expect(checkbox.closest("label")?.parentElement).toContainElement(
        screen.getByText("form_preview.optional"),
    );
});

it("keeps generic preview status visible without adding a separate rubric viewer", async () => {
    const data = response();
    data.form.pages[0].elements = [
        {
            kind: "Question",
            question: {
                name: "Score",
                type: "Choice",
                text: {en: "Problem statement", nl: "Probleemstelling"},
                isRequired: true,
                isArray: false,
                hideInResults: false,
                control: "Rubric",
                weight: 1,
                percentage: 100,
                choices: [{name: "8", text: {en: "8", nl: "8"}}],
                rubric: [
                    {
                        name: "Strong",
                        description: {
                            en: "Clearly explains the research question.",
                            nl: "Duidelijke onderzoeksvraag.",
                        },
                        grades: [{name: "8", text: {en: "8", nl: "8"}}],
                    },
                ],
            },
        },
    ];
    data.answers = [{id: "score", questionName: "Score", value: null, isVisible: true, files: []}];
    request.mockResolvedValue({data});
    mount();

    await screen.findByRole("button", {name: /Problem statement/});
    expect(screen.getByRole("heading", {name: "Preview: Review form"})).toBeVisible();
    expect(screen.getByRole("dialog", {name: "Preview: Review form"})).toBeVisible();
    expect(screen.queryByText("form_preview.preview_label")).not.toBeInTheDocument();
    expect(screen.getByText("form_preview.temporary_notice").closest("header")).not.toBeNull();
    expect(screen.queryByText("form_preview.view_rubric")).not.toBeInTheDocument();
    expect(screen.queryByText("Clearly explains the research question.")).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
});

it("shows calculation progress without presenting missing answers as zero", async () => {
    const data = response();
    data.pageResults = [
        {
            name: "First",
            weight: 2,
            sum: 0,
            questionResults: [],
            weightedAverage: null,
            answeredCount: 1,
            questionCount: 2,
        },
    ];
    request.mockResolvedValue({data});
    mount();

    expect(await screen.findByText("1 of 2 values entered")).toBeVisible();
    expect(screen.getByText("form_preview.complete_calculation")).toBeVisible();
    expect(screen.getByText("1 of 2 values entered").tagName).toBe("P");
    expect(screen.getByText("form_preview.complete_calculation").tagName).toBe("P");
    expect(screen.queryByText("0", {exact: true})).not.toBeInTheDocument();
});

it("reset discards pending answers and ignores an evaluation from before the reset", async () => {
    let finishOlder: (value: {data: FormPreview}) => void = () => {};
    request.mockResolvedValueOnce({data: response("Default title")});
    request.mockImplementationOnce(
        () =>
            new Promise((resolve) => {
                finishOlder = resolve;
            }),
    );
    request.mockResolvedValueOnce({data: response("Default title")});
    mount();
    fireEvent.change(await screen.findByRole("textbox", {name: "Answer"}), {
        target: {value: "Discard me"},
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByRole("button", {name: "form_preview.reset"}));

    await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
    expect(request.mock.calls[2][0].body.answers).toEqual({});
    await act(async () => {
        finishOlder({data: response("Discard me")});
    });
    expect(screen.getByRole("textbox", {name: "Answer"})).toHaveValue("Default title");
});

it("evaluates temporary edits using only the preview endpoint", async () => {
    mount();
    fireEvent.change(await screen.findByRole("textbox", {name: "Answer"}), {
        target: {value: "temporary"},
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(request.mock.calls[1][0]).toEqual({
        url: "/FormPreviews/instance/Review",
        method: "POST",
        body: {answers: {Answer: "temporary"}},
    });
    expect(screen.getByRole("textbox", {name: "Answer"})).toHaveValue("temporary");
});

it("does not include file answers from inactive pages in evaluation requests", async () => {
    request.mockImplementation(async () => {
        const data = response();
        data.form.pages[0].elements = data.form.pages[0].elements.filter(
            (element) => element.question?.type !== "File",
        );
        return {data};
    });
    mount();
    fireEvent.change(await screen.findByRole("textbox", {name: "Answer"}), {
        target: {value: "temporary"},
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(request.mock.calls[1][0].body.answers).toEqual({Answer: "temporary"});
});

it("ignores an older evaluation after a newer edit and reacts to evaluated conditions", async () => {
    let finishOlder: (value: {data: FormPreview}) => void = () => {};
    request.mockResolvedValueOnce({data: response()});
    request.mockImplementationOnce(
        () =>
            new Promise((resolve) => {
                finishOlder = resolve;
            }),
    );
    request.mockImplementationOnce(async () => {
        const data = response("newer");
        data.form.pages[1].isActive = false;
        return {data};
    });
    mount();
    const input = await screen.findByRole("textbox", {name: "Answer"});
    fireEvent.change(input, {target: {value: "older"}});
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    fireEvent.change(input, {target: {value: "newer"}});
    await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
    await waitFor(() =>
        expect(screen.queryByRole("tab", {name: "Second"})).not.toBeInTheDocument(),
    );
    await act(async () => {
        finishOlder({data: response("older")});
    });
    expect(input).toHaveValue("newer");
    expect(screen.queryByRole("tab", {name: "Second"})).not.toBeInTheDocument();
});

it("starts fresh on reopening and cancels debounced work on close", async () => {
    const first = mount();
    fireEvent.change(await screen.findByRole("textbox", {name: "Answer"}), {
        target: {value: "discard"},
    });
    first.unmount();
    mount();
    await screen.findByRole("textbox", {name: "Answer"});
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1][0].body.answers).toEqual({});
    expect(screen.getByRole("textbox", {name: "Answer"})).toHaveValue("");
});

it("disables external-user creation and never falls back to persisted reference choices", async () => {
    const data = response();
    data.form.pages[0].elements = [
        {
            kind: "Question",
            question: {
                name: "User",
                type: "User",
                text: {en: "User", nl: "Gebruiker"},
                isRequired: false,
                isArray: false,
                hideInResults: false,
                allowsExternalUsers: true,
            },
        },
        {
            kind: "Question",
            question: {
                name: "Reference",
                type: "Reference",
                text: {en: "Reference", nl: "Referentie"},
                isRequired: false,
                isArray: false,
                hideInResults: false,
            },
        },
    ];
    data.answers = ["User", "Reference"].map((name) => ({
        id: name,
        questionName: name,
        value: null,
        isVisible: true,
        files: [],
    }));
    data.referenceChoices = {Reference: []};
    request.mockResolvedValue({data});

    mount();

    await screen.findByRole("group", {name: "Users"});
    expect(screen.queryByRole("button", {name: "Add external user"})).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", {name: "Reference"})).toHaveAttribute(
        "placeholder",
        "reference.empty",
    );
    expect(request).toHaveBeenCalledTimes(1);
});

it("applies a later default without turning untouched blanks into explicit clears", async () => {
    request.mockImplementation(async (arg: {body: {answers: Record<string, unknown>}}) => {
        const answers = arg.body.answers;
        const value =
            "Answer" in answers ? answers.Answer : answers.Trigger ? "Derived title" : null;
        const data = response(value);
        data.form.pages[0].elements.push({
            kind: "Question",
            question: {
                name: "Trigger",
                type: "Check",
                text: {en: "Use default", nl: "Standaardwaarde gebruiken"},
                isRequired: false,
                isArray: false,
                hideInResults: false,
            },
        });
        data.answers.push({
            id: "trigger",
            questionName: "Trigger",
            value: answers.Trigger ?? false,
            isVisible: true,
            files: [],
        });
        return {data};
    });
    mount();
    const input = await screen.findByRole("textbox", {name: "Answer"});
    expect(input).toHaveValue("");

    fireEvent.click(screen.getByRole("checkbox", {name: "Use default"}));

    await waitFor(() => expect(input).toHaveValue("Derived title"));
    expect(request.mock.calls[1][0].body.answers).toEqual({Trigger: true});
    fireEvent.change(input, {target: {value: ""}});
    await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
    expect(request.mock.calls[2][0].body.answers.Answer).toBe("");
    expect(input).toHaveValue("");
});

it("keeps rejected answers editable and hides stale calculations until recovery", async () => {
    request.mockImplementation(async (arg: {body: {answers: Record<string, unknown>}}) => {
        const value = arg.body.answers.Answer;
        if (value === "rejected") return {error: {status: 400, data: "Invalid reference"}};
        const data = response(value ?? "initial");
        data.pageResults = [
            {
                name: "First",
                weight: 1,
                sum: 0,
                questionResults: [],
                weightedAverage: value === "fixed" ? 8 : 5,
                answeredCount: 1,
                questionCount: 1,
            },
        ];
        return {data};
    });
    mount();
    const input = await screen.findByRole("textbox", {name: "Answer"});
    expect(screen.getByText("form_preview.average")).toBeVisible();
    fireEvent.change(input, {target: {value: "rejected"}});

    await screen.findByRole("alert");

    expect(screen.getByRole("textbox", {name: "Answer"})).toHaveValue("rejected");
    expect(screen.queryByText("form_preview.average")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "next"}));
    expect(screen.getByRole("tab", {name: "Second"})).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("button", {name: "previous"}));
    fireEvent.change(screen.getByRole("textbox", {name: "Answer"}), {target: {value: "fixed"}});
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", {name: "Answer"})).toHaveValue("fixed");
    expect(screen.getByText("form_preview.average")).toBeVisible();
    expect(request.mock.calls.at(-1)?.[0].body.answers.Answer).toBe("fixed");
});

it("recovers from an initial load failure using retry", async () => {
    request.mockResolvedValueOnce({error: {status: 503, data: "Unavailable"}});
    request.mockResolvedValueOnce({data: response()});
    mount();
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", {name: "retry"}));
    await screen.findByRole("textbox", {name: "Answer"});
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(request.mock.calls[1][0].body.answers).toEqual({});
});

import {useState} from "react";

import {Provider} from "react-redux";

import {configureStore} from "@reduxjs/toolkit";
import "@testing-library/jest-dom/vitest";
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {FormSubmitButton} from "../FormSubmitButton";
import {InputControl} from "../InputControl";
import {answersApi} from "~/store/api/answersApi";
import {baseApi} from "~/store/api/baseApi";
import type {Submission} from "~/store/api/types/submissions";
import authReducer from "~/store/authSlice";

vi.mock("~/helpers/Environment", () => ({VITE_WEBAPI_URL: "https://workflow.test/"}));
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (text?: {en?: string}) => text?.en ?? "",
        i18n: {language: "en"},
    }),
}));

const submission: Submission = {
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
                hasResults: false,
                isInCurrentForm: true,
                questions: [
                    {
                        name: "Title",
                        type: "String",
                        text: {en: "Title", nl: "Titel"},
                        isRequired: true,
                        isArray: false,
                        hideInResults: false,
                        allowsExternalUsers: false,
                        weight: null,
                        percentage: null,
                        choices: [],
                    },
                ],
            },
        ],
    },
    answers: [{id: "answer", questionName: "Title", value: "original", isVisible: true, files: []}],
};

function makeStore() {
    return configureStore({
        reducer: {auth: authReducer, [baseApi.reducerPath]: baseApi.reducer},
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });
}

let instanceNumber = 0;
let instanceId: string;
let store: ReturnType<typeof makeStore>;
let serverValue: unknown;
let saves: {value: unknown; response: ReturnType<typeof Promise.withResolvers<Response>>}[];
let submissions: unknown[];
let submitError: boolean;
let validationError: boolean;

beforeEach(() => {
    instanceId = `submit-test-${++instanceNumber}`;
    store = makeStore();
    serverValue = "original";
    saves = [];
    submissions = [];
    submitError = false;
    validationError = false;
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
        "fetch",
        vi.fn(async (request: Request) => {
            if (request.url.includes("/Answers/")) {
                const body = request.url.endsWith("/Artifacts")
                    ? {value: "uploaded file"}
                    : await request.json();
                const response = Promise.withResolvers<Response>();
                saves.push({value: body.value, response});
                return response.promise;
            }
            if (request.url.includes("/Submissions/") && request.method === "POST") {
                submissions.push(serverValue);
                return Response.json(
                    validationError
                        ? {
                              validationErrors: [
                                  {
                                      questionName: "Title",
                                      validationMessage: {
                                          en: "Required field",
                                          nl: "Verplicht veld",
                                      },
                                  },
                              ],
                          }
                        : submitError
                          ? {message: "Unavailable"}
                          : {submission, success: true},
                    {status: validationError ? 422 : submitError ? 503 : 200},
                );
            }
            throw new Error(`Unexpected request: ${request.method} ${request.url}`);
        }),
    );
});
afterEach(() => {
    cleanup();
    store.dispatch(baseApi.util.resetApiState());
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function TestForm({onSubmit, showInput = true}: {onSubmit: () => void; showInput?: boolean}) {
    const [value, setValue] = useState<unknown>("original");
    const [saveAnswer] = answersApi.endpoints.saveAnswer.useMutation();
    return (
        <>
            {showInput && (
                <InputControl
                    instanceId={instanceId}
                    submissionId="form"
                    question={submission.form.pages[0].questions[0]}
                    value={value}
                    onChange={setValue}
                    onSave={(answer) =>
                        saveAnswer({instanceId, submissionId: "form", answer}).unwrap()
                    }
                />
            )}
            <FormSubmitButton instanceId={instanceId} submission={submission} onSubmit={onSubmit} />
        </>
    );
}

function renderForm(showInput = true) {
    const onSubmit = vi.fn();
    const view = render(
        <Provider store={store}>
            <TestForm onSubmit={onSubmit} showInput={showInput} />
        </Provider>,
    );
    return {...view, onSubmit};
}

async function finishSave(index: number, success = true) {
    await waitFor(() => expect(saves.length).toBeGreaterThan(index));
    if (success) serverValue = saves[index].value;
    const updated = {
        ...submission,
        answers: submission.answers.map((answer) => ({...answer, value: serverValue})),
    };
    await act(async () =>
        saves[index].response.resolve(
            Response.json(
                success
                    ? {answers: updated.answers, submission: updated}
                    : {message: "Save failed"},
                {status: success ? 200 : 400},
            ),
        ),
    );
}

describe("FormSubmitButton pending saves", () => {
    it("flushes a just-typed edit and submits only after its save succeeds", async () => {
        const {onSubmit} = renderForm();
        fireEvent.change(screen.getByRole("textbox"), {target: {value: "latest edit"}});
        expect(saves).toHaveLength(0);
        const button = screen.getByRole("button", {name: "submit"});
        fireEvent.click(button);
        await waitFor(() => expect(saves).toHaveLength(1));
        expect(saves[0].value).toBe("latest edit");
        expect(submissions).toHaveLength(0);
        expect(button).toBeDisabled();
        fireEvent.click(button);
        await finishSave(0);
        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
        expect(submissions).toEqual(["latest edit"]);
        expect(saves).toHaveLength(1);
    });

    it("waits for queued saves from a previous tab even when its input is unmounted", async () => {
        const {onSubmit} = renderForm(false);
        const first = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                instanceId,
                submissionId: "form",
                answer: {questionName: "Title", value: "first"},
            }),
        );
        const second = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                instanceId,
                submissionId: "form",
                answer: {questionName: "Title", value: "second"},
            }),
        );
        fireEvent.click(screen.getByRole("button", {name: "submit"}));
        await finishSave(0);
        await waitFor(() => expect(saves).toHaveLength(2));
        expect(submissions).toHaveLength(0);
        await finishSave(1);
        await Promise.all([first, second]);
        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
        expect(submissions).toEqual(["second"]);
    });

    it("also flushes a newer edit made while waiting for an earlier save", async () => {
        const {onSubmit} = renderForm();
        const input = screen.getByRole("textbox");
        fireEvent.change(input, {target: {value: "first"}});
        fireEvent.click(screen.getByRole("button", {name: "submit"}));
        await waitFor(() => expect(saves).toHaveLength(1));
        fireEvent.change(input, {target: {value: "newer"}});
        await finishSave(0);
        await waitFor(() => expect(saves).toHaveLength(2));
        expect(submissions).toHaveLength(0);
        await finishSave(1);
        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
        expect(submissions).toEqual(["newer"]);
    });

    it("keeps the form open after a failed save and retries it on the next submit click", async () => {
        const {onSubmit} = renderForm();
        fireEvent.change(screen.getByRole("textbox"), {target: {value: "keep my draft"}});
        const button = screen.getByRole("button", {name: "submit"});
        fireEvent.click(button);
        await finishSave(0, false);
        await waitFor(() =>
            expect(console.error).toHaveBeenCalledWith(
                "Failed to save answers before submitting:",
                expect.any(Error),
            ),
        );
        expect(onSubmit).not.toHaveBeenCalled();
        expect(submissions).toHaveLength(0);
        expect(screen.getByRole("textbox")).toHaveValue("keep my draft");
        expect(window.alert).toHaveBeenCalledWith("instance.summary.save_error");
        expect(button).toBeEnabled();

        fireEvent.click(button);
        await waitFor(() => expect(saves).toHaveLength(2));
        expect(saves[1].value).toBe("keep my draft");
        await finishSave(1);
        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
        expect(submissions).toEqual(["keep my draft"]);
    });

    it("saves a newer edit instead of retrying an older failed value", async () => {
        const {onSubmit} = renderForm();
        const input = screen.getByRole("textbox");
        const button = screen.getByRole("button", {name: "submit"});
        fireEvent.change(input, {target: {value: "old failed draft"}});
        fireEvent.click(button);
        await finishSave(0, false);
        await waitFor(() =>
            expect(console.error).toHaveBeenCalledWith(
                "Failed to save answers before submitting:",
                expect.any(Error),
            ),
        );
        fireEvent.change(input, {target: {value: "new draft"}});
        fireEvent.click(button);
        await waitFor(() => expect(saves).toHaveLength(2));
        expect(saves[1].value).toBe("new draft");
        await finishSave(1);
        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
        expect(saves).toHaveLength(2);
        expect(submissions).toEqual(["new draft"]);
    });

    it("does not overlook a failed answer when a later queued answer succeeds", async () => {
        const {onSubmit} = renderForm(false);
        const first = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                instanceId,
                submissionId: "form",
                answer: {questionName: "Title", value: "title"},
            }),
        );
        const second = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                instanceId,
                submissionId: "form",
                answer: {questionName: "Subject", value: "subject"},
            }),
        );
        const button = screen.getByRole("button", {name: "submit"});
        fireEvent.click(button);
        await finishSave(0, false);
        await finishSave(1);
        await Promise.all([first, second]);
        await waitFor(() =>
            expect(console.error).toHaveBeenCalledWith(
                "Failed to save answers before submitting:",
                expect.any(Error),
            ),
        );
        expect(submissions).toHaveLength(0);
        expect(onSubmit).not.toHaveBeenCalled();
        fireEvent.click(button);
        await finishSave(2);
        expect(saves[2].value).toBe("title");
        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    });

    it("waits for a file upload before submitting", async () => {
        const {onSubmit} = renderForm(false);
        const upload = store.dispatch(
            answersApi.endpoints.saveFile.initiate({
                instanceId,
                submissionId: "form",
                questionName: "Document",
                file: new File(["draft"], "draft.txt", {type: "text/plain"}),
            }),
        );
        fireEvent.click(screen.getByRole("button", {name: "submit"}));
        await waitFor(() => expect(saves).toHaveLength(1));
        expect(submissions).toHaveLength(0);
        await finishSave(0);
        await upload;
        await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    });

    it("does not close the form when submission itself fails", async () => {
        submitError = true;
        const {onSubmit} = renderForm();
        fireEvent.click(screen.getByRole("button", {name: "submit"}));
        await waitFor(() =>
            expect(console.error).toHaveBeenCalledWith(
                "Failed to submit form:",
                expect.objectContaining({status: 503}),
            ),
        );
        expect(onSubmit).not.toHaveBeenCalled();
        expect(saves).toHaveLength(0);
        expect(window.alert).toHaveBeenCalledWith("instance.summary.submit_error");
    });

    it("alerts the question and localized message for API validation failures", async () => {
        validationError = true;
        const {onSubmit} = renderForm();
        fireEvent.click(screen.getByRole("button", {name: "submit"}));
        await waitFor(() =>
            expect(window.alert).toHaveBeenCalledExactlyOnceWith(
                "Not valid! Title: Required field",
            ),
        );
        expect(onSubmit).not.toHaveBeenCalled();
    });
});

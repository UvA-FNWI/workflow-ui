import {createElement} from "react";

import {Provider} from "react-redux";

import {configureStore, type Middleware} from "@reduxjs/toolkit";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {answersApi} from "./answersApi";
import {baseApi} from "./baseApi";
import {instancesApi} from "./instancesApi";
import {submissionsApi} from "./submissionsApi";
import type {WorkflowInstance} from "./types/instances";
import type {SaveAnswerResult} from "./types/returnTypes";
import type {Submission} from "./types/submissions";
import {FormPage} from "~/components/instance/FormPage.tsx";

const request = vi.hoisted(() => vi.fn());

vi.mock("./baseApi", async () => {
    const {createApi} = await import("@reduxjs/toolkit/query/react");
    return {
        baseApi: createApi({
            reducerPath: "api",
            baseQuery: request,
            tagTypes: [
                "Submission",
                "Instance",
                "Assessments",
                "InstanceActions",
                "Choices",
                "Screen",
            ],
            endpoints: () => ({}),
        }),
    };
});

afterEach(() => vi.clearAllMocks());

it.each([false, true])(
    "keeps the newest editable submission when older response finishes last=%s",
    async (olderLast) => {
        const store = configureStore({
            reducer: {[baseApi.reducerPath]: baseApi.reducer},
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(baseApi.middleware as Middleware),
        });
        const params = {instanceId: "instance", submissionId: "submission"};
        const submission = (value: string): Submission => ({
            id: params.submissionId,
            permissions: [],
            form: {name: "form", title: {en: "Form", nl: "Formulier"}, layout: "Normal", pages: []},
            answers: [{id: "answer", questionName: "Comments", value, isVisible: true, files: []}],
        });
        await store.dispatch(
            submissionsApi.util.upsertQueryData("getSubmission", params, submission("initial")),
        );

        const olderResponse = Promise.withResolvers<{data: SaveAnswerResult}>();
        const newerResponse = Promise.withResolvers<{data: SaveAnswerResult}>();
        request
            .mockReturnValueOnce(olderResponse.promise)
            .mockReturnValueOnce(newerResponse.promise);
        const older = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                ...params,
                answer: {questionName: "Comments", value: "older"},
            }),
        );
        const newer = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                ...params,
                answer: {questionName: "Comments", value: "newer"},
            }),
        );
        const finish = async (isOlder: boolean) => {
            const saved = submission(isOlder ? "older" : "newer");
            (isOlder ? olderResponse : newerResponse).resolve({
                data: {submission: saved, answers: saved.answers},
            });
            await (isOlder ? older : newer);
        };
        await finish(!olderLast);
        await finish(olderLast);

        expect(
            submissionsApi.endpoints.getSubmission.select(params)(store.getState()).data?.answers[0]
                .value,
        ).toBe("newer");
        store.dispatch(answersApi.util.resetApiState());
    },
);

it.each(["draft", "submitted", "clear", "dummy"] as const)(
    "refreshes step submissions through the API after %s",
    async (operation) => {
        const store = configureStore({
            reducer: {[baseApi.reducerPath]: baseApi.reducer},
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(baseApi.middleware as Middleware),
        });
        const params = {instanceId: "instance", submissionId: "submission"};
        let serverSubmission: Submission = {
            id: "submission",
            permissions: [],
            dateSubmitted: operation === "submitted" ? "2026-01-01T00:00:00Z" : undefined,
            form: {name: "form", title: {en: "Form", nl: ""}, layout: "Normal", pages: []},
            answers: [
                {
                    id: "answer",
                    questionName: "Comments",
                    value: "initial",
                    isVisible: true,
                    files: [],
                },
            ],
        };
        request.mockImplementation(async (input) => {
            if (typeof input === "string") {
                return {
                    data: {
                        id: "instance",
                        steps: [{id: "Step", submissions: [serverSubmission]}],
                    } as unknown as WorkflowInstance,
                };
            }
            serverSubmission = {
                ...serverSubmission,
                answers: [{...serverSubmission.answers[0], value: "updated"}],
            };
            return {
                data:
                    operation === "draft" || operation === "submitted"
                        ? {submission: serverSubmission, answers: serverSubmission.answers}
                        : serverSubmission,
            };
        });
        const instance = store.dispatch(
            instancesApi.endpoints.getInstance.initiate(params.instanceId),
        );
        await instance;
        if (operation === "clear")
            await store.dispatch(answersApi.endpoints.clearAnswers.initiate(params));
        else if (operation === "dummy")
            await store.dispatch(
                submissionsApi.endpoints.generateDummySubmissionData.initiate(params),
            );
        else
            await store.dispatch(
                answersApi.endpoints.saveAnswer.initiate({
                    ...params,
                    answer: {questionName: "Comments", value: "updated"},
                }),
            );

        await vi.waitFor(() =>
            expect(
                instancesApi.endpoints.getInstance.select(params.instanceId)(store.getState()).data
                    ?.steps[0].submissions[0].answers[0].value,
            ).toBe("updated"),
        );
        instance.unsubscribe();
        store.dispatch(baseApi.util.resetApiState());
    },
);

it.each([false, true])(
    "waits for draft saves before refreshing cards on close, including debounced input: %s",
    async (debounced) => {
        const store = configureStore({
            reducer: {[baseApi.reducerPath]: baseApi.reducer},
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(baseApi.middleware as Middleware),
        });
        const params = {instanceId: "instance", submissionId: "submission"};
        let serverSubmission: Submission = {
            id: "submission",
            permissions: [],
            answers: [
                {id: "answer", questionName: "Comments", value: "", isVisible: true, files: []},
            ],
            form: {
                name: "form",
                title: {en: "Form", nl: ""},
                layout: "Normal",
                pages: [
                    {
                        index: 0,
                        name: "Main",
                        title: {en: "Main", nl: ""},
                        layout: "Normal",
                        elements: [
                            {
                                kind: "Question",
                                question: {
                                    name: "Comments",
                                    type: "String",
                                    text: {en: "Comments", nl: ""},
                                    isRequired: false,
                                    isArray: false,
                                    percentage: null,
                                    hideInResults: false,
                                    allowsExternalUsers: false,
                                    choices: [],
                                },
                            },
                        ],
                        hasResults: false,
                        isActive: true,
                        isInCurrentForm: true,
                    },
                ],
            },
        };
        const pendingSave = Promise.withResolvers<void>();
        request.mockImplementation(async (input) => {
            if (typeof input !== "string") {
                await pendingSave.promise;
                serverSubmission = {
                    ...serverSubmission,
                    answers: [
                        {
                            id: "answer",
                            questionName: "Comments",
                            value: "saved",
                            isVisible: true,
                            files: [],
                        },
                    ],
                };
                return {data: {submission: serverSubmission, answers: serverSubmission.answers}};
            }
            return {data: {id: "instance", steps: [{id: "Step", submissions: [serverSubmission]}]}};
        });
        const instance = store.dispatch(
            instancesApi.endpoints.getInstance.initiate(params.instanceId),
        );
        await instance;
        await store.dispatch(
            submissionsApi.util.upsertQueryData("getSubmission", params, serverSubmission),
        );
        const form = render(
            createElement(Provider, {
                store,
                children: createElement(FormPage, {...params, onClose: () => {}}),
            }),
        );
        const save = debounced
            ? undefined
            : store.dispatch(
                  answersApi.endpoints.saveAnswer.initiate({
                      ...params,
                      answer: {questionName: "Comments", value: "saved"},
                  }),
              );
        if (debounced) fireEvent.change(screen.getByRole("textbox"), {target: {value: "saved"}});
        form.unmount();
        await act(async () => {
            pendingSave.resolve();
            await save;
        });

        await vi.waitFor(() =>
            expect(
                instancesApi.endpoints.getInstance.select(params.instanceId)(store.getState()).data
                    ?.steps[0].submissions[0].answers[0]?.value,
            ).toBe("saved"),
        );
        instance.unsubscribe();
        store.dispatch(baseApi.util.resetApiState());
    },
);

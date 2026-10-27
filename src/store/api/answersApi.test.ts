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
            answers: [
                {id: "answer", questionName: "Comments", value, isVisible: true, files: []},
                {
                    id: "secret",
                    questionName: "Secret",
                    value: "private",
                    isVisible: true,
                    files: [],
                },
            ],
        });
        const snapshot = (value: string) => {
            const saved = submission(value);
            return {
                id: params.instanceId,
                steps: [
                    {
                        id: "Step",
                        submissions: [
                            {
                                ...saved,
                                answers: [
                                    saved.answers[0],
                                    {...saved.answers[1], value: null, isVisible: false},
                                ],
                            },
                        ],
                    },
                ],
            } as unknown as WorkflowInstance;
        };
        await store.dispatch(
            submissionsApi.util.upsertQueryData("getSubmission", params, submission("initial")),
        );
        await store.dispatch(
            instancesApi.util.upsertQueryData(
                "getInstance",
                params.instanceId,
                snapshot("initial"),
            ),
        );

        const instance = store.dispatch(
            instancesApi.endpoints.getInstance.initiate(params.instanceId),
        );
        await instance;
        const olderResponse = Promise.withResolvers<{data: SaveAnswerResult}>();
        const newerResponse = Promise.withResolvers<{data: SaveAnswerResult}>();
        request
            .mockReturnValueOnce(olderResponse.promise)
            .mockReturnValueOnce(newerResponse.promise)
            .mockResolvedValue({data: snapshot("newer")});
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
                data: {
                    submission: saved,
                    answers: saved.answers,
                    updatedInstance: snapshot(isOlder ? "older" : "newer"),
                },
            });
            await (isOlder ? older : newer);
        };
        await finish(!olderLast);
        await finish(olderLast);

        expect(
            submissionsApi.endpoints.getSubmission.select(params)(store.getState()).data?.answers[0]
                .value,
        ).toBe("newer");
        const displayedSubmission = instancesApi.endpoints.getInstance.select(params.instanceId)(
            store.getState(),
        ).data?.steps[0].submissions[0];
        expect(displayedSubmission?.answers[1]).toMatchObject({isVisible: false, value: null});
        expect(
            submissionsApi.endpoints.getSubmission.select(params)(store.getState()).data
                ?.answers[1],
        ).toMatchObject({isVisible: true, value: "private"});
        await vi.waitFor(() =>
            expect(
                instancesApi.endpoints.getInstance.select(params.instanceId)(store.getState()).data
                    ?.steps[0].submissions[0].answers[0].value,
            ).toBe("newer"),
        );
        instance.unsubscribe();
        store.dispatch(answersApi.util.resetApiState());
    },
);

it.each(["draft", "submitted", "missing instance", "clear", "dummy"] as const)(
    "updates step submissions after %s, without refetching after answer saves",
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
                if (input.endsWith("/Properties"))
                    return {
                        data: {
                            properties: [],
                            values: {Comments: serverSubmission.answers[0].value},
                        },
                    };
                if (input.endsWith("/Roles"))
                    return {
                        data: [
                            {name: "Role", title: {en: serverSubmission.answers[0].value, nl: ""}},
                        ],
                    };
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
                    operation !== "clear" && operation !== "dummy"
                        ? {
                              submission: serverSubmission,
                              answers: serverSubmission.answers,
                              updatedInstance:
                                  operation === "missing instance"
                                      ? null
                                      : {
                                            id: params.instanceId,
                                            steps: [{id: "Step", submissions: [serverSubmission]}],
                                        },
                          }
                        : serverSubmission,
            };
        });
        const instance = store.dispatch(
            instancesApi.endpoints.getInstance.initiate(params.instanceId),
        );
        await instance;
        const properties = store.dispatch(
            instancesApi.endpoints.getInstanceProperties.initiate(params.instanceId),
        );
        const roles = store.dispatch(
            instancesApi.endpoints.getImpersonationRoles.initiate(params.instanceId),
        );
        await Promise.all([properties, roles]);
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
        await vi.waitFor(() => {
            expect(
                instancesApi.endpoints.getInstanceProperties.select(params.instanceId)(
                    store.getState(),
                ).data?.values.Comments,
            ).toBe("updated");
            expect(
                instancesApi.endpoints.getImpersonationRoles.select(params.instanceId)(
                    store.getState(),
                ).data?.[0].title.en,
            ).toBe("updated");
        });
        expect(
            request.mock.calls.filter(
                ([input]) => input === `/WorkflowInstances/${params.instanceId}`,
            ),
        ).toHaveLength(operation === "draft" || operation === "submitted" ? 1 : 2);
        properties.unsubscribe();
        roles.unsubscribe();
        instance.unsubscribe();
        store.dispatch(baseApi.util.resetApiState());
    },
);

it.each([false, true])(
    "reconciles overlapping saves after both finish, same form: %s",
    async (sameForm) => {
        const store = configureStore({
            reducer: {[baseApi.reducerPath]: baseApi.reducer},
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(baseApi.middleware as Middleware),
        });
        const submission = (id: string, value: string): Submission => ({
            id,
            permissions: [],
            form: {name: id, title: {en: id, nl: ""}, layout: "Normal", pages: []},
            answers: [{id, questionName: id, value, isVisible: true, files: []}],
        });
        const snapshot = (a: string, b: string) => {
            const first = submission("A", a);
            const second = submission("B", b);
            return {
                id: "instance",
                steps: [
                    {
                        id: "Step",
                        submissions: sameForm
                            ? [{...first, answers: [...first.answers, ...second.answers]}]
                            : [first, second],
                    },
                ],
            } as unknown as WorkflowInstance;
        };
        const aResponse = Promise.withResolvers<{data: SaveAnswerResult}>();
        const bResponse = Promise.withResolvers<{data: SaveAnswerResult}>();
        request
            .mockResolvedValueOnce({data: snapshot("a0", "b0")})
            .mockReturnValueOnce(aResponse.promise)
            .mockReturnValueOnce(bResponse.promise)
            .mockResolvedValueOnce({data: snapshot("a1", "b1")});
        const instance = store.dispatch(instancesApi.endpoints.getInstance.initiate("instance"));
        await instance;
        const a = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                instanceId: "instance",
                submissionId: "A",
                answer: {questionName: "A", value: "a1"},
            }),
        );
        const b = store.dispatch(
            answersApi.endpoints.saveAnswer.initiate({
                instanceId: "instance",
                submissionId: sameForm ? "A" : "B",
                answer: {questionName: "B", value: "b1"},
            }),
        );
        bResponse.resolve({
            data: {
                submission: snapshot("a0", "b1").steps[0].submissions[sameForm ? 0 : 1],
                answers: [],
                updatedInstance: snapshot("a0", "b1"),
            },
        });
        await b;
        aResponse.resolve({
            data: {
                submission: snapshot("a1", "b0").steps[0].submissions[0],
                answers: [],
                updatedInstance: snapshot("a1", "b0"),
            },
        });
        await a;
        await vi.waitFor(() =>
            expect(
                instancesApi.endpoints.getInstance
                    .select("instance")(store.getState())
                    .data?.steps[0].submissions.flatMap((s) =>
                        s.answers.map((answer) => answer.value),
                    ),
            ).toEqual(["a1", "b1"]),
        );
        expect(request.mock.calls.filter(([input]) => typeof input === "string")).toHaveLength(2);
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
                                    hideInResults: false,
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
                return {
                    data: {
                        submission: serverSubmission,
                        answers: serverSubmission.answers,
                        updatedInstance: {
                            id: "instance",
                            steps: [{id: "Step", submissions: [serverSubmission]}],
                        },
                    },
                };
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

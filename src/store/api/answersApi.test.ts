import {configureStore, type Middleware} from "@reduxjs/toolkit";
import {afterEach, expect, it, vi} from "vitest";

import {answersApi} from "./answersApi";
import {baseApi} from "./baseApi";
import {instancesApi} from "./instancesApi";
import {submissionsApi} from "./submissionsApi";
import type {WorkflowInstance} from "./types/instances";
import type {SaveAnswerResult} from "./types/returnTypes";
import type {Submission} from "./types/submissions";

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
    "keeps the newest save in both caches when older response finishes last=%s",
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
        await store.dispatch(
            instancesApi.util.upsertQueryData("getInstance", params.instanceId, {
                id: params.instanceId,
                submissions: [submission("initial")],
            } as WorkflowInstance),
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
        expect(
            instancesApi.endpoints.getInstance.select(params.instanceId)(store.getState()).data
                ?.submissions[0].answers[0].value,
        ).toBe("newer");
        store.dispatch(answersApi.util.resetApiState());
    },
);

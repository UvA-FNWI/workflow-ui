import {baseApi} from "./baseApi";
import type {SaveAnswerParams} from "./types/params";
import type {SaveAnswerResult} from "./types/returnTypes";

export const answersApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        saveAnswer: build.mutation<SaveAnswerResult, SaveAnswerParams>({
            query: (params) => ({
                url: `Answers/${params.instanceId}/${params.submissionId}/${params.answer.questionName}`,
                method: "post",
                body: params.answer,
            }),
        }),
    }),
});

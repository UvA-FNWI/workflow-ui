import {baseApi} from "./baseApi";
import type {SaveAnswerParams, SaveFileParams} from "./types/params";
import type {SaveAnswerResult} from "./types/returnTypes";
import {instancesApi} from "~/store/api/instancesApi.ts";
import {submissionsApi} from "~/store/api/submissionsApi.ts";

export const answersApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        saveAnswer: build.mutation<SaveAnswerResult, SaveAnswerParams>({
            query: (params) => ({
                url: `Answers/${params.instanceId}/${params.submissionId}/${params.answer.questionName}`,
                method: "post",
                body: params.answer,
            }),
            async onQueryStarted(params, {dispatch, queryFulfilled}) {
                const {data} = await queryFulfilled;
                dispatch(
                    submissionsApi.util.updateQueryData(
                        "getSubmission",
                        {instanceId: params.instanceId, submissionId: params.submissionId},
                        (current) => {
                            current.answers = current.answers.map((oldAnswer) => {
                                const newAnswer = data.answers.find(
                                    (answer) => answer.id === oldAnswer.id,
                                );
                                return newAnswer ?? oldAnswer;
                            });
                        },
                    ),
                );
                dispatch(
                    instancesApi.util.updateQueryData(
                        "getInstance",
                        params.instanceId,
                        (current) => {
                            const idx = current.submissions.findIndex(
                                (s) => s.id === params.submissionId,
                            );
                            if (idx !== -1) {
                                current.submissions[idx] = data.submission;
                            }
                        },
                    ),
                );
            },
            invalidatesTags: (_result, _error, params) => [
                {
                    type: "Assessments",
                    instanceId: params.instanceId,
                    submissionId: params.submissionId,
                },
            ],
        }),
        saveFile: build.mutation<{success: boolean}, SaveFileParams>({
            query: (params) => {
                const formData = new FormData();
                formData.append("file", params.file);
                return {
                    url: `Answers/${params.instanceId}/${params.submissionId}/${params.questionName}/artifacts`,
                    method: "post",
                    body: formData,
                };
            },
            invalidatesTags: (_result, _error, params) => [
                {
                    type: "Submission",
                    instanceId: params.instanceId,
                    submissionId: params.submissionId,
                },
            ],
        }),
    }),
});

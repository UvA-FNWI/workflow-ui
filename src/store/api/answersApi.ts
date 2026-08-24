import {baseApi} from "./baseApi";
import type {GetChoicesParams, SaveAnswerParams, SaveFileParams, SubmissionParams} from "./types/params";
import type {SaveAnswerResult} from "./types/returnTypes";
import type {Choice} from "./types/submissions";
import {instancesApi} from "~/store/api/instancesApi.ts";
import {submissionsApi} from "~/store/api/submissionsApi.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

export const answersApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getChoices: build.query<Choice[], GetChoicesParams>({
            query: (params) =>
                `Answers/${params.instanceId}/${params.submissionId}/${params.questionName}/Choices`,
            providesTags: (_result, _error, params) => [{type: "Choices", id: params.instanceId}],
        }),
        getCurrentChoices: build.query<Choice[], GetChoicesParams>({
            query: (params) =>
                `Answers/${params.instanceId}/${params.submissionId}/${params.questionName}/CurrentChoices`,
            providesTags: (_result, _error, params) => [{type: "Choices", id: params.instanceId}],
        }),
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
                        () => data.submission,
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
                {type: "InstanceActions", id: params.instanceId},
                {type: "Choices", id: params.instanceId},
            ],
        }),
        saveFile: build.mutation<{success: boolean}, SaveFileParams>({
            query: (params) => {
                const formData = new FormData();
                formData.append("file", params.file);
                return {
                    url: `Answers/${params.instanceId}/${params.submissionId}/${params.questionName}/Artifacts`,
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
                {type: "Instance", id: params.instanceId},
            ],
        }),
        clearAnswers: build.mutation<Submission, SubmissionParams>({
            query: ({instanceId, submissionId}) => ({
                url: `Answers/${instanceId}/${submissionId}`,
                method: "delete",
            }),
            async onQueryStarted(params, {dispatch, queryFulfilled}) {
                const {data} = await queryFulfilled;
                dispatch(submissionsApi.util.updateQueryData("getSubmission", params, () => data));
                dispatch(
                    instancesApi.util.updateQueryData(
                        "getInstance",
                        params.instanceId,
                        (current) => {
                            const index = current.submissions.findIndex(
                                (submission) => submission.id === params.submissionId,
                            );
                            if (index !== -1) current.submissions[index] = data;
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
                {type: "InstanceActions", id: params.instanceId},
            ],
        }),
    }),
});

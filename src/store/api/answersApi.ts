import {baseApi} from "./baseApi";
import type {
    GetChoicesParams,
    SaveAnswerParams,
    SaveFileParams,
    SubmissionParams,
} from "./types/params";
import type {SaveAnswerResult} from "./types/returnTypes";
import type {Choice} from "./types/submissions";
import {submissionsApi} from "~/store/api/submissionsApi.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

const latestSaveBySubmission = new Map<string, string>();

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
            async onQueryStarted(params, {dispatch, queryFulfilled, requestId}) {
                // Each response contains the whole submission, so track saves across all questions.
                const submissionKey = JSON.stringify([params.instanceId, params.submissionId]);
                latestSaveBySubmission.set(submissionKey, requestId);

                const result = await queryFulfilled.catch(() => undefined);
                // An older response must not roll back a newer submission snapshot.
                if (latestSaveBySubmission.get(submissionKey) !== requestId) return;
                latestSaveBySubmission.delete(submissionKey);
                if (!result) return;

                const {data} = result;
                dispatch(
                    submissionsApi.util.updateQueryData(
                        "getSubmission",
                        {instanceId: params.instanceId, submissionId: params.submissionId},
                        () => data.submission,
                    ),
                );
            },
            invalidatesTags: (_result, _error, params) => [
                {
                    type: "Assessments",
                    instanceId: params.instanceId,
                    submissionId: params.submissionId,
                },
                {type: "Instance", id: params.instanceId},
                {type: "Choices", id: params.instanceId},
                "Screen",
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
                "Screen",
            ],
        }),
        deleteFile: build.mutation<
            {success: boolean},
            {instanceId: string; submissionId: string; questionName: string; artifactId: string}
        >({
            query: ({instanceId, submissionId, questionName, artifactId}) => ({
                url: `Answers/${instanceId}/${submissionId}/${questionName}/Artifacts/${artifactId}`,
                method: "delete",
            }),
            invalidatesTags: (_result, _error, params) => [
                {
                    type: "Submission",
                    instanceId: params.instanceId,
                    submissionId: params.submissionId,
                },
                {type: "Instance", id: params.instanceId},
                "Screen",
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
            },
            invalidatesTags: (_result, _error, params) => [
                {
                    type: "Assessments",
                    instanceId: params.instanceId,
                    submissionId: params.submissionId,
                },
                {type: "Instance", id: params.instanceId},
                "Screen",
            ],
        }),
    }),
});

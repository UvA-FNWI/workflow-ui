import {applyEffectResult} from "../effectsSlice";
import {baseApi} from "./baseApi";
import type {Submission} from "./types/submissions";
import {instancesApi} from "~/store/api/instancesApi.ts";
import type {SubmitSubmissionResult} from "~/store/api/types/returnTypes.ts";

type SubmissionParams = {instanceId: string; submissionId: string};

export const submissionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubmission: builder.query<Submission, SubmissionParams>({
            query: ({instanceId, submissionId}) => `/Submissions/${instanceId}/${submissionId}`,
            providesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Submission", instanceId, submissionId},
            ],
        }),
        submitSubmission: builder.mutation<SubmitSubmissionResult, SubmissionParams>({
            query: (params) => ({
                url: `Submissions/${params.instanceId}/${params.submissionId}`,
                method: "post",
            }),
            invalidatesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Assessments", instanceId},
                {type: "Assessments", instanceId, submissionId},
            ],
            async onQueryStarted(params, {dispatch, queryFulfilled}) {
                const {data} = await queryFulfilled;
                dispatch(
                    instancesApi.util.updateQueryData(
                        "getInstance",
                        params.instanceId,
                        () => data.updatedInstance,
                    ),
                );
                dispatch(
                    submissionsApi.util.updateQueryData(
                        "getSubmission",
                        {instanceId: params.instanceId, submissionId: params.submissionId},
                        () => data.submission,
                    ),
                );

                if (data.effectResult) {
                    dispatch(applyEffectResult(data.effectResult));
                }
            },
        }),
        getFakeSubmissionData: builder.mutation<Submission, SubmissionParams>({
            query: ({instanceId, submissionId}) => ({
                url: `/Submissions/${instanceId}/${submissionId}/fake`,
                method: "post",
            }),
            invalidatesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Assessments", instanceId, submissionId},
            ],
            async onQueryStarted(params, {dispatch, queryFulfilled}) {
                const {data} = await queryFulfilled;
                dispatch(
                    submissionsApi.util.updateQueryData(
                        "getSubmission",
                        {instanceId: params.instanceId, submissionId: params.submissionId},
                        () => data,
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
                                current.submissions[idx] = data;
                            }
                        },
                    ),
                );
            },
        }),
    }),
});

export const {endpoints: submissionsEndpoints} = submissionsApi;

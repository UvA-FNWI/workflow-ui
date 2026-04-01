import {baseApi} from "./baseApi";
import type {Submission} from "./types/submissions";
import {instancesApi} from "~/store/api/instancesApi.ts";
import type {SubmitSubmissionResult} from "~/store/api/types/returnTypes.ts";

type SubmissionParams = {instanceId: string; submissionId: string};
type MultipleSubmissionsParams = {instanceId: string; submissionIds: string[]};

export const submissionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubmission: builder.query<Submission, SubmissionParams>({
            query: ({instanceId, submissionId}) => `/Submissions/${instanceId}/${submissionId}`,
            providesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Submission", instanceId, submissionId},
            ],
        }),
        getMultipleSubmissions: builder.query<Submission[], MultipleSubmissionsParams>({
            query: ({instanceId, submissionIds}) => {
                const params = new URLSearchParams();
                submissionIds.forEach((id) => params.append("submissionIds", id));
                return `/Submissions/${instanceId}?${params.toString()}`;
            },
            providesTags: (_result, _error, {instanceId, submissionIds}) =>
                submissionIds.map((submissionId) => ({
                    type: "Submission",
                    instanceId,
                    submissionId,
                })),
        }),
        submitSubmission: builder.mutation<SubmitSubmissionResult, SubmissionParams>({
            query: (params) => ({
                url: `Submissions/${params.instanceId}/${params.submissionId}`,
                method: "post",
            }),
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
            },
        }),
    }),
});

export const {endpoints: submissionsEndpoints} = submissionsApi;

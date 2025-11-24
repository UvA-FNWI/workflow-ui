import {baseApi} from "./baseApi";
import type {Submission} from "./types/submissions";

export const submissionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubmission: builder.query<Submission, {instanceId: string; submissionId: string}>({
            query: ({instanceId, submissionId}) => `/Submissions/${instanceId}/${submissionId}`,
            providesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Submission", instanceId, submissionId},
            ],
        }),
    }),
});

export const {endpoints: submissionsEndpoints} = submissionsApi;

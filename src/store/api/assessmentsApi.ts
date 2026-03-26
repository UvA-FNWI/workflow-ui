import {baseApi} from "~/store/api/baseApi.ts";
import type {AssessmentPage, Assessments} from "~/store/api/types/assessments.ts";

type AssessmentsParams = {instanceId: string; submissionId: string};

export const assessmentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getResults: builder.query<Assessments, AssessmentsParams>({
            query: ({instanceId, submissionId}) =>
                `/Assessments/${instanceId}/${submissionId}/Results`,
            providesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Assessments", instanceId, submissionId},
            ],
        }),
        getResultsPage: builder.query<AssessmentPage, AssessmentsParams & {pageName: string}>({
            query: ({instanceId, submissionId, pageName}) =>
                `/Assessments/${instanceId}/${submissionId}/Results/${pageName}`,
            providesTags: (_result, _error, {instanceId, submissionId, pageName}) => [
                {type: "Assessments", instanceId, submissionId, pageName},
            ],
        }),
    }),
});

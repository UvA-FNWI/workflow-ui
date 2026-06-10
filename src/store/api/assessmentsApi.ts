import {baseApi} from "~/store/api/baseApi.ts";
import type {Assessment, SourceResult} from "~/store/api/types/assessments.ts";

type AssessmentsParams = {instanceId: string; submissionId: string};

export const assessmentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAssessmentResults: builder.query<
            Assessment,
            {instanceId: string; submissionId?: string}
        >({
            query: ({instanceId, submissionId}) =>
                submissionId
                    ? `/Assessments/${instanceId}/${submissionId}`
                    : `/Assessments/${instanceId}`,
            providesTags: (_result, _error, {instanceId, submissionId}) => [
                {type: "Assessments", instanceId, submissionId},
            ],
        }),
        getPageResults: builder.query<SourceResult, AssessmentsParams & {pageName: string}>({
            query: ({instanceId, submissionId, pageName}) =>
                `/Assessments/${instanceId}/${submissionId}/${pageName}`,
            providesTags: (_result, _error, {instanceId, submissionId, pageName}) => [
                {type: "Assessments", instanceId, submissionId, pageName},
            ],
        }),
    }),
});

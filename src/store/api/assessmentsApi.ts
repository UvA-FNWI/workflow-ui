import {baseApi} from "~/store/api/baseApi.ts";
import type {Assessments} from "~/store/api/types/assessments.ts";

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
    }),
});

import {baseApi} from "./baseApi";
import type {Job, JobParams} from "./types/jobs";

export const jobsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getJobs: builder.query<Job[], string>({
            query: (instanceId: string) => `/Jobs/${instanceId}`,
            providesTags: (_result, _error, instanceId) => [{type: "Instance", id: instanceId}],
        }),
        getJob: builder.query<Job, JobParams>({
            query: ({instanceId, jobId}) => `/Jobs/${instanceId}/${jobId}`,
            providesTags: (_result, _error, {instanceId}) => [{type: "Instance", id: instanceId}],
        }),
        runJob: builder.mutation<Job, JobParams>({
            query: ({instanceId, jobId}) => ({
                url: `/Jobs/${instanceId}/${jobId}/Run`,
                method: "POST",
            }),
            invalidatesTags: ["Screen"],
        }),
    }),
});

export const {endpoints: jobsEndpoints} = jobsApi;

import {baseApi} from "./baseApi";
import type {Job, JobParams} from "./types/jobs";

export const jobsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getJobs: builder.query<Job[], string>({
            query: (instanceId: string) => `/Jobs/${instanceId}`,
        }),
        getJob: builder.query<Job, JobParams>({
            query: ({instanceId, jobId}) => `/Jobs/${instanceId}/${jobId}`,
        }),
        runJob: builder.mutation<Job, JobParams>({
            query: ({instanceId, jobId}) => ({
                url: `/Jobs/${instanceId}/${jobId}/run`,
                method: "POST",
            }),
        }),
    }),
});

export const {endpoints: jobsEndpoints} = jobsApi;

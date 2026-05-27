import {baseApi} from "./baseApi";
import type {Job} from "./types/jobs";

export const jobsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getJobs: builder.query<Job[], string>({
            query: (instanceId: string) => ({
                url: "/Jobs",
                params: {instanceId},
            }),
        }),
    }),
});

export const {endpoints: jobsEndpoints} = jobsApi;

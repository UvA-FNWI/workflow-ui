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
            async onQueryStarted({instanceId, jobId}, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(
                        jobsApi.util.updateQueryData("getJob", {instanceId, jobId}, () => data),
                    );
                    dispatch(
                        jobsApi.util.updateQueryData("getJobs", instanceId, (draft) => {
                            const index = draft.findIndex((job) => job.id === data.id);
                            if (index !== -1) {
                                draft[index] = data;
                            }
                        }),
                    );
                } catch {
                    return;
                }
            },
        }),
    }),
});

export const {endpoints: jobsEndpoints} = jobsApi;

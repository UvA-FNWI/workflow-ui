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
        getJob: builder.query<Job, string>({
            query: (id: string) => `/Jobs/${id}`,
        }),
        runJob: builder.mutation<Job, {jobId: string; instanceId: string}>({
            query: ({jobId}) => ({
                url: `/Jobs/${jobId}/run`,
                method: "POST",
            }),
            async onQueryStarted({jobId, instanceId}, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(jobsApi.util.updateQueryData("getJob", jobId, () => data));
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

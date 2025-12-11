import {baseApi} from "./baseApi";
import type {WorkflowInstance} from "./types/instances";

export const instancesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInstance: builder.query<WorkflowInstance, string>({
            query: (id: string) => `/WorkflowInstances/${id}`,
            providesTags: (_result, _error, id: string) => [{type: "Instance", id}],
        }),
        getInstances: builder.query<WorkflowInstance[], string>({
            query: (workflowDefinition: string) =>
                `/WorkflowInstances/instances/${workflowDefinition}`,
            providesTags: ["Instance"],
        }),
    }),
});

export const {endpoints: instancesEndpoints} = instancesApi;

import {baseApi} from "./baseApi";
import type {WorkflowDefinition} from "./types/workflowDefinitions";

export const workflowDefinitionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWorkflowDefinitions: builder.query<WorkflowDefinition[], {includeAll?: boolean} | void>({
            query: (arg) => ({
                url: "/WorkflowDefinitions",
                params: arg && arg.includeAll ? {includeAll: true} : undefined,
            }),
            providesTags: ["Workflow"],
        }),
    }),
});

export const {useGetWorkflowDefinitionsQuery} = workflowDefinitionsApi;

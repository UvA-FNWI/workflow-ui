import {baseApi} from "./baseApi";
import type {WorkflowDefinition} from "./types/definitions";

export const definitionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWorkflowDefinitions: builder.query<WorkflowDefinition[], void>({
            query: () => "/WorkflowDefinitions",
            providesTags: ["Workflow"],
        }),
    }),
});

export const {endpoints: definitionsEndpoints} = definitionsApi;

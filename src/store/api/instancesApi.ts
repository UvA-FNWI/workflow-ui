import type {LocalString} from "hooks/useTranslate";

import {baseApi} from "./baseApi";

export type WorkflowInstance = {
    id: string;
    title: string | null;
    steps: WorkflowStep[];
};

export type WorkflowStep = {
    id: string;
    title: LocalString;
    event: string;
    dateCompleted: string | null;
    children: WorkflowStep[] | null;
};

export const instancesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInstance: builder.query<WorkflowInstance, string>({
            query: (id: string) => `/WorkflowInstances/${id}`,
            providesTags: (_result, _error, id: string) => [{type: "Instance", id}],
        }),
        getInstances: builder.query<WorkflowInstance[], string>({
            query: (entityType: string) => `/WorkflowInstances/instances/${entityType}`,
            providesTags: ["Instance"],
        }),
    }),
});

export const {endpoints: instancesEndpoints} = instancesApi;

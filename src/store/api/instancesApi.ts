import {baseApi} from "./baseApi";

export type WorkflowInstance = {
    id: string;
    title: string | null;
    steps: WorkflowStep[];
};

export type WorkflowStep = {
    id: string;
    title: BilingualString;
    event: string;
    dateCompleted: string | null;
    children: WorkflowStep[] | null;
};
export type BilingualString = {
    en: string;
    nl: string;
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

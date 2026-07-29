import {setRoleImpersonation} from "../authSlice";
import {baseApi} from "./baseApi";
import type {
    InstanceSummary,
    RecalculateCurrentStepsResult,
    RoleImpersonationResult,
    WorkflowInstance,
} from "./types/instances";
import type {ImpersonationRole} from "./types/submissions";

export const instancesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInstance: builder.query<WorkflowInstance, string>({
            query: (id: string) => `/WorkflowInstances/${id}`,
            providesTags: (_result, _error, id: string) => [{type: "Instance", id}],
        }),
        getInstances: builder.query<InstanceSummary[], string>({
            query: (workflowDefinition: string) => ({
                url: `/WorkflowInstances/instances/${workflowDefinition}`,
                params: {includeTitle: true},
            }),
            providesTags: ["Instance"],
        }),
        createInstance: builder.mutation<WorkflowInstance, {workflowDefinition: string}>({
            query: (body) => ({
                url: "/WorkflowInstances",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Instance"],
        }),
        recalculateCurrentSteps: builder.mutation<RecalculateCurrentStepsResult, string>({
            query: (workflowDefinition) => ({
                url: `/WorkflowInstances/instances/${workflowDefinition}/recalculate-current-step`,
                method: "POST",
            }),
            invalidatesTags: ["Instance"],
        }),
        getImpersonationRoles: builder.query<ImpersonationRole[], string>({
            query: (instanceId: string) => `/WorkflowInstances/${instanceId}/impersonation/roles`,
        }),
        impersonateRole: builder.mutation<
            RoleImpersonationResult,
            {instanceId: string; roleName: string}
        >({
            query: ({instanceId, roleName}) => ({
                url: `/WorkflowInstances/${instanceId}/impersonation`,
                method: "POST",
                body: {role: roleName},
            }),
            async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled;
                    dispatch(setRoleImpersonation(data));
                    window.location.reload();
                } catch {
                    return;
                }
            },
        }),
    }),
});

export const {endpoints: instancesEndpoints} = instancesApi;

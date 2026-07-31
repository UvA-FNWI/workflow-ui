import {setRoleImpersonation} from "../authSlice";
import {baseApi} from "./baseApi";
import type {
    InstanceProperties,
    InstanceSummary,
    RecalculateCurrentStepsResult,
    Role,
    RoleImpersonationResult,
    WorkflowInstance,
} from "./types/instances";
import type {AssignRelatedUserParams, RemoveRelatedUserParams} from "~/store/api/types/params.ts";

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
        getInstanceProperties: builder.query<InstanceProperties, string>({
            query: (id: string) => `/WorkflowInstances/${id}/properties`,
            providesTags: (_result, _error, id: string) => [{type: "Instance", id}],
        }),
        saveInstanceProperty: builder.mutation<
            void,
            {instanceId: string; path: string; value: unknown}
        >({
            query: ({instanceId, path, value}) => ({
                url: `/WorkflowInstances/${instanceId}/properties/${path}`,
                method: "POST",
                body: {value},
            }),
            // Property changes can affect steps and the title.
            invalidatesTags: (_result, _error, {instanceId}) => [
                {type: "Instance", id: instanceId},
            ],
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
        getImpersonationRoles: builder.query<Role[], string>({
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
        assignRelatedUser: builder.mutation<void, AssignRelatedUserParams>({
            query: ({instanceId, property, user, externalUser}: AssignRelatedUserParams) => ({
                url: `/WorkflowInstances/${instanceId}/related-users/${property}`,
                method: "POST",
                body: {user, externalUser},
            }),
            invalidatesTags: (_result, _error, {instanceId}) => [
                {type: "Instance", id: instanceId},
            ],
        }),
        removeRelatedUser: builder.mutation<void, RemoveRelatedUserParams>({
            query: ({instanceId, property, userId}: RemoveRelatedUserParams) => ({
                url: `/WorkflowInstances/${instanceId}/related-users/${property}/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, {instanceId}) => [
                {type: "Instance", id: instanceId},
            ],
        }),
    }),
});

export const {endpoints: instancesEndpoints} = instancesApi;

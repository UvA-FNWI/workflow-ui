import {baseApi} from "./baseApi";
import type {BulkActionParams, BulkActionResult, ScreenData} from "./types/screens";

function bulkActionRequest({
    workflowDefinition,
    screenName,
    actionName,
    instanceIds,
}: BulkActionParams) {
    return {
        url: `/Screens/${encodeURIComponent(workflowDefinition)}/${encodeURIComponent(screenName)}/BulkActions/${encodeURIComponent(actionName)}`,
        method: "POST",
        body: {instanceIds},
    };
}

export const screensApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getScreen: builder.query<ScreenData, {workflowDefinition: string; screenName: string}>({
            query: ({workflowDefinition, screenName}) =>
                `/Screens/${workflowDefinition}/${screenName}`,
            keepUnusedDataFor: 0, // // This is necessary to prevent stale data in the screens
            providesTags: (_result, _error, {workflowDefinition, screenName}) => [
                {type: "Screen", id: `${workflowDefinition}-${screenName}`},
            ],
        }),
        previewBulkAction: builder.query<BulkActionResult, BulkActionParams>({
            query: (params) => {
                const request = bulkActionRequest(params);
                return {...request, url: `${request.url}/Preview`};
            },
            keepUnusedDataFor: 0,
        }),
        executeBulkAction: builder.mutation<BulkActionResult, BulkActionParams>({
            query: bulkActionRequest,
            // Refresh once per batch, including uncertain outcomes. Never dispatch per-instance UI effects.
            invalidatesTags: (_result, _error, {workflowDefinition, screenName, instanceIds}) => [
                {type: "Screen", id: `${workflowDefinition}-${screenName}`},
                "Instance",
                ...instanceIds.map((id) => ({type: "InstanceActions" as const, id})),
                "Submission",
                "Assessments",
            ],
        }),
    }),
});

export const {useGetScreenQuery, usePreviewBulkActionQuery, useExecuteBulkActionMutation} =
    screensApi;

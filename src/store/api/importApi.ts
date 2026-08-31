import {baseApi} from "~/store/api/baseApi.ts";
import type {
    ImportColumnNamesResponse,
    ImportConfirmRequest,
    ImportFileRequest,
    ImportPreview,
} from "~/store/api/types/import.ts";

const buildFormData = ({file, columnMapping}: ImportFileRequest): FormData => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("columnMapping", JSON.stringify(columnMapping));
    return formData;
};
export const importApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getColumnNames: builder.query<
            ImportColumnNamesResponse,
            {workflowDefinition: string; screenName: string}
        >({
            query: ({workflowDefinition, screenName}) => ({
                url: `/Import/${workflowDefinition}/${screenName}/Columns`,
            }),
        }),
        preview: builder.mutation<ImportPreview, ImportFileRequest>({
            query: (importFileRequest) => ({
                url: `/Import/${importFileRequest.workflowDefinition}/${importFileRequest.screenName}/Preview`,
                method: "POST",
                body: buildFormData(importFileRequest),
            }),
        }),
        confirm: builder.mutation<void, ImportConfirmRequest>({
            query: ({rows, workflowDefinition, screenName}) => ({
                url: `/Import/${workflowDefinition}/${screenName}/Confirm`,
                method: "POST",
                body: {rows},
            }),
            invalidatesTags: ["Screen", "Instance"],
        }),
    }),
});

export const {usePreviewMutation, useConfirmMutation, useGetColumnNamesQuery} = importApi;

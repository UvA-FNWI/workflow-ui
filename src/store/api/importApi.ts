import {baseApi} from "~/store/api/baseApi.ts";
import type {
    ImportableProperty,
    ImportConfirmRequest,
    ImportFileRequest,
    ImportPreview,
} from "~/store/api/types/import.ts";

const buildFormData = ({file, workflowDefinition, columnMapping}: ImportFileRequest): FormData => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workflowDefinition", workflowDefinition);
    formData.append("columnMapping", JSON.stringify(columnMapping));
    return formData;
};
export const importApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getColumnNames: builder.query<ImportableProperty[], string>({
            query: (workflowDefinition) => ({
                url: `/Import/Columns/${workflowDefinition}`,
            }),
        }),
        preview: builder.mutation<ImportPreview, ImportFileRequest>({
            query: (args) => ({
                url: `/Import/Preview`,
                method: "POST",
                body: buildFormData(args),
            }),
        }),
        confirm: builder.mutation<void, ImportConfirmRequest>({
            query: ({workflowDefinition, rows}) => ({
                url: `/Import/Confirm`,
                method: "POST",
                body: {workflowDefinition, rows},
            }),
        }),
    }),
});

export const {usePreviewMutation, useConfirmMutation, useGetColumnNamesQuery} = importApi;

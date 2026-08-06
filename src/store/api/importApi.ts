import {baseApi} from "~/store/api/baseApi.ts";
import type {ImportFileRequest, ImportPreview} from "~/store/api/types/import.ts";

const buildFormData = ({file, workflowDefinition, columnMapping}: ImportFileRequest): FormData => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workflowDefinition", workflowDefinition);
    formData.append("columnMapping", JSON.stringify(columnMapping));
    return formData;
};
export const importApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        preview: builder.mutation<ImportPreview, ImportFileRequest>({
            query: (args) => ({
                url: `/Import/Preview`,
                method: "POST",
                body: buildFormData(args),
            }),
        }),
        confirm: builder.mutation<void, ImportFileRequest>({
            query: (args) => ({
                url: `/Import/Confirm`,
                method: "POST",
                body: buildFormData(args),
            }),
        }),
    }),
});

export const {usePreviewMutation, useConfirmMutation} = importApi;

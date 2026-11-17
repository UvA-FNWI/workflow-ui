import {baseApi} from "./baseApi";
import type {FormPreview} from "./types/formPreviews";

export const formPreviewsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        evaluateFormPreview: builder.mutation<
            FormPreview,
            {instanceId: string; formName: string; answers: Record<string, unknown>}
        >({
            query: ({instanceId, formName, answers}) => ({
                url: `/FormPreviews/${encodeURIComponent(instanceId)}/${encodeURIComponent(formName)}`,
                method: "POST",
                body: {answers},
            }),
        }),
    }),
});

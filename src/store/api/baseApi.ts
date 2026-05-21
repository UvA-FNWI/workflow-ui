import type {
    BaseQueryFn,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
    QueryReturnValue,
} from "@reduxjs/toolkit/query";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {VITE_WEBAPI_URL} from "../../helpers/Environment";
import {selectAccessToken, selectImpersonationToken} from "../authSlice";
import type {RootState} from "../store";
import {type ApiErrorState, triggerApiError} from "~/store/errorSlice.ts";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: VITE_WEBAPI_URL,
    prepareHeaders: (headers, {getState}) => {
        const state = getState() as RootState;
        const accessToken = selectAccessToken(state);
        if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

        const impersonationToken = selectImpersonationToken(state);
        if (impersonationToken) headers.set("X-Workflow-Impersonation", impersonationToken);

        return headers;
    },
});

export const baseQueryWithErrorHandling: BaseQueryFn = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
        api.dispatch(triggerApiError(getErrorData(result)));
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ["Workflow", "Instance", "Submission", "Assessments"],
    endpoints: () => ({}),
});

function getErrorData(
    result: QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>,
): ApiErrorState {
    const url = result.meta?.request?.url ?? "";

    const instanceId = (() => {
        try {
            return new URL(url).pathname.split("/").filter(Boolean).at(1);
        } catch {
            return undefined;
        }
    })();

    const errorCode = typeof result.error?.status === "number" ? result.error.status : -1;
    const data = result.error?.data;
    const errorMessage: string =
        typeof data === "object" && data !== null && "error" in data
            ? (data.error as string)
            : "Unknown error";

    return {
        code: errorCode,
        message: errorMessage,
        instanceId,
    };
}

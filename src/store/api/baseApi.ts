import type {BaseQueryFn} from "@reduxjs/toolkit/query";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {VITE_WEBAPI_URL} from "../../helpers/Environment";
import {selectAccessToken, selectImpersonationToken} from "../authSlice";
import type {RootState} from "../store";
import {triggerApiError} from "~/store/errorSlice.ts";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: VITE_WEBAPI_URL || "",
    prepareHeaders: (headers, {getState}) => {
        const state = getState() as RootState;
        const accessToken = selectAccessToken(state);
        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }
        const impersonationToken = selectImpersonationToken(state);
        if (impersonationToken) {
            headers.set("X-Workflow-Impersonation", impersonationToken);
        }
        // The workflow version lives in the URL (?version=) so each tab is independent and
        // it survives the page reloads triggered by impersonation and the auth redirect.
        const version = new URLSearchParams(window.location.search).get("version");
        if (version !== null) {
            headers.set("Workflow-Version", version);
        }
        return headers;
    },
});

export const baseQueryWithErrorHandling: BaseQueryFn = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (
        result.error &&
        typeof result.error.status == "number" &&
        result.error.status > 500 &&
        result.error.status < 600
    ) {
        api.dispatch(
            triggerApiError({
                type: "error",
                code: result.error.status,
                ...(result.error.data as object),
            }),
        );
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ["Workflow", "Instance", "Submission", "Assessments", "User", "Organization"],
    endpoints: () => ({}),
});

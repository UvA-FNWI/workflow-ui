import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {VITE_WEBAPI_URL} from "../../helpers/Environment";
import {selectAccessToken, selectImpersonationToken} from "../authSlice";
import type {RootState} from "../store";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
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
    }),
    tagTypes: ["Workflow", "Instance", "Submission", "Assessments", "User", "Organization"],
    endpoints: () => ({}),
});

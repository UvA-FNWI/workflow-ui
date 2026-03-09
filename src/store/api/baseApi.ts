import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {VITE_WEBAPI_URL} from "../../helpers/Environment";
import {selectImpersonationToken} from "../authSlice";
import type {RootState} from "../store";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: VITE_WEBAPI_URL || "",
        prepareHeaders: (headers, {getState}) => {
            const token = selectImpersonationToken(getState() as RootState);
            if (token) {
                headers.set("X-Workflow-Impersonation", token);
            }
            return headers;
        },
    }),
    tagTypes: ["Workflow", "Instance", "Submission", "Calculations"],
    endpoints: () => ({}),
});

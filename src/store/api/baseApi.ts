import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {VITE_WEBAPI_URL} from "../../helpers/Environment";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: VITE_WEBAPI_URL || "",
        prepareHeaders: (headers: Headers) => {
            // TODO add access token here
            return headers;
        },
    }),
    tagTypes: ["Workflow", "Instance"],
    endpoints: () => ({}),
});

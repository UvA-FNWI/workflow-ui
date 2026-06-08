import {baseApi} from "./baseApi";

export const versionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVersions: builder.query<string[], void>({
            query: () => "/Versions",
        }),
    }),
});

export const {useGetVersionsQuery} = versionsApi;

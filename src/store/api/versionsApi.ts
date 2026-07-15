import {baseApi} from "./baseApi";
import type {VersionInfo} from "./types/versions";

export const versionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVersionDetails: builder.query<VersionInfo[], void>({
            query: () => "/Versions/details",
        }),
        getBranches: builder.query<string[], void>({
            query: () => "/Versions/branches",
        }),
        // Loads a branch (or tag/SHA) as a named preview version.
        loadBranch: builder.mutation<string, string>({
            query: (ref) => ({
                url: `/Versions/branch?ref=${encodeURIComponent(ref)}`,
                method: "POST",
                responseHandler: "text",
            }),
        }),
        // Re-pull the default version.
        reloadBaseline: builder.mutation<void, void>({
            query: () => ({
                url: "/Versions/reload",
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetVersionDetailsQuery,
    useGetBranchesQuery,
    useLoadBranchMutation,
    useReloadBaselineMutation,
} = versionsApi;

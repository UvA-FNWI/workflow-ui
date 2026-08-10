import {baseApi} from "./baseApi";
import type {VersionInfo} from "./types/versions";

export const versionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVersionDetails: builder.query<VersionInfo[], void>({
            query: () => "/Versions/Details",
        }),
        // Loads a branch (or tag/SHA) as a named preview version.
        loadBranch: builder.mutation<string, string>({
            query: (ref) => ({
                url: `/Versions/Branch?ref=${encodeURIComponent(ref)}`,
                method: "POST",
                responseHandler: "text",
            }),
        }),
        // Re-pull the default version.
        reloadBaseline: builder.mutation<void, void>({
            query: () => ({
                url: "/Versions/Reload",
                method: "POST",
            }),
        }),
    }),
});

export const {useGetVersionDetailsQuery, useLoadBranchMutation, useReloadBaselineMutation} =
    versionsApi;

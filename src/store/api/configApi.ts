import {baseApi} from "./baseApi";

export const configApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Every config file for the version in the Workflow-Version header, keyed by repo-relative path.
        getConfigFiles: builder.query<Record<string, string>, void>({
            query: () => "/Versions/files",
        }),
        // POST /Versions/{version} rebuilds the whole model from what it is given, so this always sends
        // the complete file set, not just the edited files.
        uploadConfigVersion: builder.mutation<
            void,
            {version: string; files: Record<string, string>}
        >({
            query: ({version, files}) => ({
                url: `/Versions/${encodeURIComponent(version)}`,
                method: "POST",
                body: files,
            }),
        }),
    }),
});

export const {useGetConfigFilesQuery, useUploadConfigVersionMutation} = configApi;

import {baseApi} from "./baseApi";
import type {CreatePropertyRename, Migration} from "./types/migrations";

export const migrationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMigrations: builder.query<Migration[], void>({
            query: () => "/Migrations",
        }),
        createPropertyRename: builder.mutation<Migration, CreatePropertyRename>({
            query: (body) => ({
                url: "/Migrations/property-renames",
                method: "POST",
                body,
            }),
        }),
        finishMigration: builder.mutation<Migration, string>({
            query: (id) => ({
                url: `/Migrations/${encodeURIComponent(id)}/finish`,
                method: "POST",
            }),
        }),
        revertMigration: builder.mutation<Migration, string>({
            query: (id) => ({
                url: `/Migrations/${encodeURIComponent(id)}/revert`,
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetMigrationsQuery,
    useCreatePropertyRenameMutation,
    useFinishMigrationMutation,
    useRevertMigrationMutation,
} = migrationsApi;

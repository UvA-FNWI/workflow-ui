import {baseApi} from "./baseApi";
import type {CreatePropertyRename, Migration} from "./types/migrations";

export const migrationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMigrations: builder.query<Migration[], void>({
            query: () => "/Migrations",
        }),
        createPropertyRename: builder.mutation<Migration, CreatePropertyRename>({
            query: (body) => ({
                url: "/Migrations/PropertyRename",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {useGetMigrationsQuery, useCreatePropertyRenameMutation} = migrationsApi;

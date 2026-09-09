import {baseApi} from "./baseApi";
import type {Migration} from "./types/migrations";

export const migrationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMigrations: builder.query<Migration[], void>({
            query: () => "/Migrations",
        }),
    }),
});

export const {useGetMigrationsQuery} = migrationsApi;

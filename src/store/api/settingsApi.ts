import {baseApi} from "./baseApi";
import type {Settings} from "./types/settings";

export const settingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSettings: builder.query<Settings, void>({
            query: () => "/Settings",
            providesTags: ["Settings"],
        }),
    }),
});

export const {useGetSettingsQuery} = settingsApi;

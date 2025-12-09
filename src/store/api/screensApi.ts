import {baseApi} from "./baseApi";
import type {Screen} from "./types/screens";

export type OverviewScreenKeys = "assign-subject" | "thesis-in-progress" | "completed";
export const screensApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProjectsOverviewScreens: builder.query<Record<OverviewScreenKeys, Screen>, void>({
            query: () => `/Screens/Projects/Overview`,
        }),
    }),
});

export const {endpoints: screensEndpoints} = screensApi;

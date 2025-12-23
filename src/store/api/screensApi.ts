import {baseApi} from "./baseApi";
import type {GroupedScreen} from "./types/screens";

export type OverviewScreenKeys = "assign-subject" | "thesis-in-progress" | "completed";
export const screensApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProjectsOverviewScreens: builder.query<GroupedScreen, void>({
            query: () => `/Screens/Grouped/Project/Projects`,
        }),
    }),
});

export const {endpoints: screensEndpoints} = screensApi;

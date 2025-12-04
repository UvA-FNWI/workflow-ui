import {baseApi} from "./baseApi";
import type {Screen} from "./types/screens";

export const screensApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProjectsOverviewScreens: builder.query<Record<string, Screen>, void>({
            query: () => `/Screens/ProjectsOverview`,
        }),
    }),
});

export const {endpoints: screensEndpoints} = screensApi;

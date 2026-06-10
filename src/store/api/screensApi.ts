import {baseApi} from "./baseApi";
import type {GroupedScreen, ScreenData} from "./types/screens";

export type OverviewScreenKeys = "assign-subject" | "thesis-in-progress" | "completed";
export const screensApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProjectsOverviewScreens: builder.query<GroupedScreen, void>({
            query: () => `/Screens/Grouped/Project/Projects`,
        }),
        getScreen: builder.query<ScreenData, {workflowDefinition: string; screenName: string}>({
            query: ({workflowDefinition, screenName}) =>
                `/Screens/${workflowDefinition}/${screenName}`,
        }),
    }),
});

export const {endpoints: screensEndpoints, useGetScreenQuery} = screensApi;

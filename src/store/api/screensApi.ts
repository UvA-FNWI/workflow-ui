import {baseApi} from "./baseApi";
import type {ScreenData} from "./types/screens";

export const screensApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getScreen: builder.query<ScreenData, {workflowDefinition: string; screenName: string}>({
            query: ({workflowDefinition, screenName}) =>
                `/Screens/${workflowDefinition}/${screenName}`,
        }),
    }),
});

export const {useGetScreenQuery} = screensApi;

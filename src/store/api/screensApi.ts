import {baseApi} from "./baseApi";
import type {ScreenData} from "./types/screens";

export const screensApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getScreen: builder.query<ScreenData, {workflowDefinition: string; screenName: string}>({
            query: ({workflowDefinition, screenName}) =>
                `/Screens/${workflowDefinition}/${screenName}`,
            providesTags: (_result, _error, {workflowDefinition, screenName}) => [
                {type: "Screen", id: `${workflowDefinition}-${screenName}`},
            ],
        }),
    }),
});

export const {useGetScreenQuery} = screensApi;

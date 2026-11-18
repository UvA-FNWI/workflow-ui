import {baseApi} from "./baseApi";
import type {PersonalInstances} from "./types/personal";

export const personalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPersonalInstances: builder.query<PersonalInstances, void>({
            query: () => "/Personal/Instances",
            keepUnusedDataFor: 0,
            providesTags: ["Instance"],
        }),
    }),
});

export const {useGetPersonalInstancesQuery} = personalApi;

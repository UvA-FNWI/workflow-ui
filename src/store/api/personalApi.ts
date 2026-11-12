import {baseApi} from "./baseApi";
import type {PersonalInstances, PersonInstances} from "./types/personal";

export const personalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPersonalInstances: builder.query<PersonalInstances, void>({
            query: () => "/Personal/Instances",
            providesTags: ["Instance"],
        }),
        getPersonInstances: builder.query<PersonInstances, string>({
            query: (personId) => `/Personal/People/${encodeURIComponent(personId)}`,
            providesTags: ["Instance", "User"],
        }),
    }),
});

export const {useGetPersonalInstancesQuery, useGetPersonInstancesQuery} = personalApi;

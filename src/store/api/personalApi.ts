import {baseApi} from "./baseApi";
import type {PersonalInstance} from "./types/personal";

export const personalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPersonalInstances: builder.query<PersonalInstance[], void>({
            query: () => "/Personal/instances",
            providesTags: ["Instance"],
        }),
    }),
});

export const {useGetPersonalInstancesQuery} = personalApi;

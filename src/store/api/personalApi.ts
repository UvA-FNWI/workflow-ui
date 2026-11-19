import {baseApi} from "./baseApi";
import type {PersonalPage, UserSearchResults} from "./types/personal";

export const personalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPersonalInstances: builder.query<PersonalPage, void>({
            query: () => "/Personal/Me",
            keepUnusedDataFor: 0,
            providesTags: ["Instance"],
        }),
        getPersonInstances: builder.query<PersonalPage, string>({
            query: (personId) => `/Personal/${encodeURIComponent(personId)}`,
            providesTags: ["Instance", "User"],
        }),
        searchUsers: builder.query<UserSearchResults, string>({
            query: (query) => ({url: "/Personal/Search", params: {query}}),
            providesTags: ["User", "Instance"],
        }),
    }),
});

export const {useGetPersonalInstancesQuery, useGetPersonInstancesQuery, useSearchUsersQuery} =
    personalApi;

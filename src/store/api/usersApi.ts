import {baseApi} from "./baseApi";
import type {UserSearchResult} from "./types/users";

export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentUser: builder.query<UserSearchResult, void>({
            query: () => "/Users/Me",
        }),
        findUsers: builder.query<UserSearchResult[], string>({
            query: (searchQuery: string) => ({
                url: "/Users/Find",
                params: {query: searchQuery},
            }),
        }),
    }),
});

export const {useGetCurrentUserQuery, useFindUsersQuery, useLazyFindUsersQuery} = usersApi;

import {baseApi} from "./baseApi";
import type {UserSearchResult, VerifyEmailRequest, VerifyEmailResponse} from "./types/users";

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
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
            query: (body) => ({
                url: "/Users/verify-email",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useGetCurrentUserQuery,
    useFindUsersQuery,
    useLazyFindUsersQuery,
    useVerifyEmailMutation,
} = usersApi;

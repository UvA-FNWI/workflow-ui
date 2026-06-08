import {baseApi} from "./baseApi";
import type {
    CurrentUserResponse,
    UserSearchResult,
    VerifyEmailRequest,
    VerifyEmailResponse,
} from "./types/users";

export type FindUsersParams = {
    query: string;
    includeExternalUsers: boolean;
};

export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentUser: builder.query<CurrentUserResponse, void>({
            query: () => "/Users/Me",
        }),
        findUsers: builder.query<UserSearchResult[], FindUsersParams>({
            query: ({query, includeExternalUsers}) => ({
                url: "/Users/Find",
                params: {query, includeExternalUsers},
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

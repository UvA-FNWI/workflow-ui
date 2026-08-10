import {baseApi} from "./baseApi";
import type {
    CurrentUserResponse,
    UpdateUserEmailRequest,
    UserImpersonationStarted,
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
                url: "/Users/VerifyEmail",
                method: "POST",
                body,
            }),
        }),
        startImpersonation: builder.mutation<UserImpersonationStarted, {userName: string}>({
            query: (body) => ({
                url: "/Users/Impersonate",
                method: "POST",
                body,
            }),
        }),
        updateUserEmail: builder.mutation<UserSearchResult, UpdateUserEmailRequest>({
            query: ({externalUser, instanceId}) => ({
                url: `/Users/${externalUser.userId}`,
                method: "PUT",
                body: {externalUser, instanceId},
            }),
            invalidatesTags: (_result, _error, {externalUser}) => [
                {type: "User", id: externalUser?.userId},
            ],
        }),
    }),
});

export const {
    useGetCurrentUserQuery,
    useFindUsersQuery,
    useLazyFindUsersQuery,
    useVerifyEmailMutation,
    useStartImpersonationMutation,
    useUpdateUserEmailMutation,
} = usersApi;

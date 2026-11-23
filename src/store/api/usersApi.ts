import {baseApi} from "./baseApi";
import type {
    CurrentUserResponse,
    UpdateUserEmailRequest,
    UserImpersonationStarted,
    UserSearchField,
    UserSearchGroup,
    UserSearchResult,
    VerifyEmailRequest,
    VerifyEmailResponse,
} from "./types/users";

export type FindUsersParams = {
    query: string;
    includeExternalUsers: boolean;
    includeEmployees?: boolean;
    includeStudents?: boolean;
};

type SearchFieldUsersParams = UserSearchField & {
    query: string;
};

export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentUser: builder.query<CurrentUserResponse, void>({
            query: () => "/Users/Me",
        }),
        findUsers: builder.query<UserSearchResult[], FindUsersParams>({
            query: (params) => ({
                url: "/Users/Find",
                params,
            }),
        }),
        searchFieldUsers: builder.query<UserSearchGroup[], SearchFieldUsersParams>({
            query: ({instanceId, submissionId, property, query}) => {
                const field = encodeURIComponent(property);
                const fieldPath = submissionId
                    ? `/Answers/${instanceId}/${submissionId}/${field}`
                    : `/WorkflowInstances/${instanceId}/Properties/${field}`;
                return {
                    url: `${fieldPath}/UserSearch`,
                    params: {query},
                };
            },
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
            invalidatesTags: ["Screen"],
        }),
        updateUserEmail: builder.mutation<UserSearchResult, UpdateUserEmailRequest>({
            query: ({externalUser, instanceId}) => ({
                url: `/Users/${externalUser.userId}`,
                method: "PUT",
                body: {externalUser, instanceId},
            }),
            invalidatesTags: (_result, _error, {externalUser}) => [
                {type: "User", id: externalUser?.userId},
                "Screen",
            ],
        }),
    }),
});

export const {
    useGetCurrentUserQuery,
    useFindUsersQuery,
    useLazyFindUsersQuery,
    useLazySearchFieldUsersQuery,
    useVerifyEmailMutation,
    useStartImpersonationMutation,
    useUpdateUserEmailMutation,
} = usersApi;

import {baseApi} from "./baseApi";
import type {Organization} from "./types/organizations";

type CreateOrganizationParams = {name: string};

export const organizationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        findOrganizations: builder.query<Organization[], string>({
            query: (searchQuery: string) => ({
                url: "/Organizations/Find",
                params: {query: searchQuery},
            }),
        }),
        createOrganization: builder.mutation<Organization, CreateOrganizationParams>({
            query: ({name}) => ({
                url: `/Organizations`,
                method: "POST",
                body: {name: name},
            }),
        }),
    }),
});

export const {
    useFindOrganizationsQuery,
    useCreateOrganizationMutation,
    useLazyFindOrganizationsQuery,
} = organizationsApi;

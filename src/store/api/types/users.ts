export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization;
    isExternal: boolean;
    isPending: boolean;
}

export interface Organization {
    id: string;
    name: string;
}

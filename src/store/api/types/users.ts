export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization;
    isExternal: boolean;
}

export interface Organization {
    id: string;
    name: string;
}

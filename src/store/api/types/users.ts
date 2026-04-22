export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization;
}

export interface Organization {
    id: string;
    name: string;
}

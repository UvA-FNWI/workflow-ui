export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    searchSource?: "DataNose" | "EduId";
    organization?: Organization;
}

export interface Organization {
    id: string;
    name: string;
}

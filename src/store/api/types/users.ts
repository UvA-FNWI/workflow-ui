export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization;
    isExternal: boolean;
}

/** The /Users/Me response. isAdmin is true for users with global admin rights (e.g. SystemAdmin). */
export interface CurrentUserResponse extends UserSearchResult {
    isAdmin: boolean;
}

export interface Organization {
    id: string;
    name: string;
}

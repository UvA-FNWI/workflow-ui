export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization | null;
    isExternal: boolean;
    sourceKey?: string | null;
    providerKey?: string | null;
}

export interface Organization {
    id: string;
    name: string;
}

export interface VerifyEmailRequest {
    email: string;
}

export interface VerifyEmailResponse {
    email: string;
    status: string;
}

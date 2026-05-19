import type {Organization} from "./organizations";

export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization | null;
    isExternal: boolean;
    sourceKey?: string | null;
}

export interface VerifyEmailRequest {
    email: string;
}

export interface VerifyEmailResponse {
    email: string;
    status: string;
}

export interface CreateExternalUserInput {
    displayName: string;
    email: string;
    organization?: Organization | null;
}

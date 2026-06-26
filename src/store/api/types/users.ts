import type {Organization} from "./organizations";

export interface UserSearchResult {
    id?: string;
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization | null;
    isExternal: boolean;
    isPending: boolean;
    requiresInvitation?: boolean;
    sourceKey?: string | null;
}

export interface CurrentUserResponse extends UserSearchResult {
    isSuperAdmin: boolean;
}

export interface VerifyEmailRequest {
    email: string;
}

export interface VerifyEmailResponse {
    email: string;
    status: string;
}

export interface UpdateUserEmailRequest {
    userId: string;
    email: string;
}

export interface CreateExternalUserInput {
    displayName: string;
    email: string;
    organization?: Organization | null;
}

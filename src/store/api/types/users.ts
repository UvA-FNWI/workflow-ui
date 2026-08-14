import type {Organization} from "./organizations";

export interface UserSearchResult {
    id?: string;
    userName: string;
    displayName: string;
    email: string;
    picture?: string;
    organization?: Organization | null;
    isExternal: boolean;
    isPending: boolean;
    requiresInvitation?: boolean;
    sourceKey?: string | null;
}

export interface CurrentUserResponse extends UserSearchResult {
    isSuperAdmin: boolean;
}

/** Signed token and expiry returned when starting impersonation. */
export interface UserImpersonationStarted {
    token: string;
    expiresAtUtc: string;
}

/** Active global user impersonation. Names are kept so the banner and logout label survive the reload. */
export interface UserImpersonation {
    token: string;
    expiresAtUtc: string;
    targetUserName: string;
    targetDisplayName: string;
    adminDisplayName: string;
}

export interface VerifyEmailRequest {
    email: string;
}

export interface VerifyEmailResponse {
    email: string;
    status: string;
}

export interface UpdateUserEmailRequest {
    externalUser: CreateExternalUserInput;
    instanceId: string;
}

export interface CreateExternalUserInput {
    userId?: string;
    displayName: string;
    email: string;
    organization?: Organization | null;
}

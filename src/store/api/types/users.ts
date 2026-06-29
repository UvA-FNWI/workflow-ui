import type {Organization} from "./organizations";

export interface UserSearchResult {
    userName: string;
    displayName: string;
    email: string;
    organization?: Organization | null;
    isExternal: boolean;
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

/** Active global user impersonation. Target name is kept so the banner survives the reload. */
export interface UserImpersonation {
    token: string;
    expiresAtUtc: string;
    targetUserName: string;
    targetDisplayName: string;
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

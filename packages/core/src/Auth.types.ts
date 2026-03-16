// External
import type {User} from "oidc-client-ts";

// Lib
import type {AuthAction} from "./Auth.reducer";

export type AuthConfig = {
    authority: string;
    clientId: string;
    redirectUri: string;
    logoutUri?: string;
};

export type ProviderType = "surf" | "canvas";
export type CustomUserState = {redirectUrl: string} | undefined;

type JwtReservedClaims = {
    exp: number;
    iat: number;
    iss: string;
    nbf: number;
};

export type CanvasToken = JwtReservedClaims & {
    familyname: string;
    givenname: string;
    iss: "lti";
    name: string;
    personid: number;
    role: string;
    target: string;
    uvanetid: string;
    locale: string;
};

export type DataNoseToken = JwtReservedClaims & {
    clientid: string;
    courseid: string;
    familyname: string;
    givenname: string;
    impersonatedid: string;
    iss: "dn";
    name: string;
    personid: string;
    role: string;
    sourcedid: string;
    studentid: string;
    uvanetid: string;
};

export type CanvasUserAndMetadata = {
    user: User;
    target: string;
    locale: string;
};

export type AuthEventCallbacks = {
    onAccessTokenExpired?: () => void;
    onAccessTokenExpiring?: () => void;
    onSilentRenewError?: (error: Error) => void;
    onUserLoaded?: (user: User) => void;
    onUserSessionChanged?: () => void;
    onUserSignedIn?: () => void;
    onUserSignedOut?: () => void;
    onUserUnloaded?: () => void;
};

export type AuthStateChangeCallback = (action: AuthAction) => void;

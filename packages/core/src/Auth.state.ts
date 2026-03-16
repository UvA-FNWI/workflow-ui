// External
import {User} from "oidc-client-ts";

// Lib
import type {ProviderType} from "./Auth.types";

export type AuthState = {
    user: User | null;
    providerType: ProviderType | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isLoggingOut: boolean;
};

export const DefaultAuthState: AuthState = {
    user: null,
    providerType: null,
    isAuthenticated: false,
    isLoading: true,
    isLoggingOut: false,
};

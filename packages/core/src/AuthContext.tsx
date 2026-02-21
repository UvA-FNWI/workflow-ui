// React
import {createContext} from "react";

// External
import type {User} from "oidc-client-ts";

// Lib
import type {AuthState} from "./Auth.state";
import type {CanvasUserAndMetadata, CustomUserState} from "./Auth.types.tsx";

export interface AuthContextProps extends AuthState {
    surfStartLogin(state: CustomUserState): Promise<void>;

    surfCompleteLogin(): Promise<User>;

    canvasCompleteLogin(token: string): CanvasUserAndMetadata;

    surfRenewLogin(state: CustomUserState): Promise<void>;

    surfLogout(): Promise<void>;

    impersonateSurfUser(accessToken: string): Promise<void>;
}

/**
 * Context state to store auth data and expose auth functionality.
 */
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
AuthContext.displayName = "AuthContext";

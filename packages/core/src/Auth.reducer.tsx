// External
import type {User} from "oidc-client-ts";

// Lib
import {type AuthState, DefaultAuthState} from "./Auth.state";
import type {ProviderType} from "./Auth.types";

type UnknownAction = {type: string};
const authActionTypes = [
    "auth/INITIALIZED",
    "auth/USER_LOADED",
    "auth/LOGOUT",
    "auth/USER_UNLOADED",
];
export type AuthAction =
    | {
          type: "auth/INITIALIZED" | "auth/USER_LOADED";
          user: User | null;
          providerType: ProviderType | null;
      }
    | {type: "auth/LOGOUT" | "auth/USER_UNLOADED"};

function isAuthAction(action: UnknownAction): action is AuthAction {
    return authActionTypes.includes(action.type);
}

export function authReducer(state: AuthState = DefaultAuthState, action: UnknownAction): AuthState {
    if (!isAuthAction(action)) {
        return state;
    }

    switch (action.type) {
        case "auth/INITIALIZED":
        case "auth/USER_LOADED":
            return {
                ...state,
                user: action.user,
                providerType: action.providerType,
                isAuthenticated: action.user
                    ? !!action.user.access_token && !action.user.expired
                    : false,
                isLoading: false,
            };
        case "auth/LOGOUT":
        case "auth/USER_UNLOADED":
            return {
                ...state,
                user: null,
                isAuthenticated: false,
            };

        default:
            return state;
    }
}

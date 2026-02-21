// React
import React, {useEffect, useMemo, useReducer, useRef, useState} from "react";

import {authReducer} from "./Auth.reducer.tsx";
import {DefaultAuthState} from "./Auth.state.tsx";
// Lib
import type {AuthConfig, AuthEventCallbacks} from "./Auth.types.tsx";
import {AuthContext} from "./AuthContext.tsx";
import AuthService from "./AuthService.tsx";

type AuthProviderProps = {
    children?: React.ReactNode;
    config: AuthConfig;
    events: AuthEventCallbacks;
};

/**
 * Wrapper component that initializes the authentication flow and creates an auth context that can be accessed through useAuth().
 */
export const AuthProvider = (props: AuthProviderProps): React.JSX.Element => {
    // State
    const [authClient] = useState(() => new AuthService(props.config));

    // Reducers
    const [state, dispatch] = useReducer(authReducer, DefaultAuthState);

    // Refs
    const didInitialize = useRef(false);

    // Effects
    useEffect(() => {
        if (!authClient || didInitialize.current) {
            return;
        }
        didInitialize.current = true;

        void (async (): Promise<void> => {
            await authClient.initialize((action) => dispatch(action), props.events);
        })();
    }, [authClient, props.events]);

    // Memoized variables
    const contextValue = useMemo(() => {
        return {
            ...state,
            surfStartLogin: authClient.surfStartLogin,
            surfCompleteLogin: authClient.surfCompleteLogin,
            canvasCompleteLogin: authClient.canvasCompleteLogin,
            surfRenewLogin: authClient.surfRenewLogin,
            surfLogout: authClient.surfLogout,
            impersonateSurfUser: authClient.impersonateSurfUser,
        };
    }, [state, authClient]);

    // Render
    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};

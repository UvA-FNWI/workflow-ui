// React
import {useContext} from "react";

// Lib
import {AuthContext, type AuthContextProps} from "./AuthContext";

/**
 * Hook to access the auth context. Can only be used within components wrapped by AuthProvider.
 */
export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);

    if (!context) {
        console.warn(
            "Error: AuthContext is undefined; useAuth can only be used in children of <AuthProvider>.",
        );
    }

    return context as AuthContextProps;
};

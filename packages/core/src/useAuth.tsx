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
        throw new Error("useAuth must be used within an <AuthProvider>.");
    }

    return context;
};

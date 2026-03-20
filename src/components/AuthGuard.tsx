import {useEffect} from "react";

import {Outlet} from "react-router";

import {useAuth} from "@uva-fnwi/datanose-core";

import {useAuthenticatedUser} from "../hooks/useAuthenticatedUser";

export default function AuthGuard() {
    const {isAuthenticated, isLoading} = useAuthenticatedUser();
    const {surfStartLogin, isLoggingOut, isLoading: isAuthInitializing} = useAuth();

    useEffect(() => {
        if (!isAuthInitializing && !isLoading && !isAuthenticated && !isLoggingOut) {
            void surfStartLogin({redirectUrl: window.location.pathname});
        }
    }, [isAuthenticated, isAuthInitializing, isLoading, isLoggingOut, surfStartLogin]);

    if (!isAuthenticated) {
        return null;
    }

    return <Outlet />;
}

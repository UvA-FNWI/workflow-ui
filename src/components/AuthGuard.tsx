import {useEffect} from "react";

import {Outlet} from "react-router";

import {getCanvasTokenFromLocalStorage, isEmbeddedInCanvas, useAuth} from "@datanose/core";

import {useAuthenticatedUser} from "../hooks/useAuthenticatedUser";

export default function AuthGuard() {
    const {isAuthenticated, isLoading} = useAuthenticatedUser();
    const {providerType, surfStartLogin, isLoggingOut, isLoading: isAuthInitializing} = useAuth();
    const isCanvasContext =
        providerType === "canvas" || !!getCanvasTokenFromLocalStorage() || isEmbeddedInCanvas();

    useEffect(() => {
        if (isCanvasContext) {
            return;
        }

        if (!isAuthInitializing && !isLoading && !isAuthenticated && !isLoggingOut) {
            void surfStartLogin({
                redirectUrl: `${window.location.pathname}${window.location.search}`,
            });
        }
    }, [
        isAuthenticated,
        isAuthInitializing,
        isCanvasContext,
        isLoading,
        isLoggingOut,
        surfStartLogin,
    ]);

    if (!isAuthenticated) {
        return null;
    }

    return <Outlet />;
}

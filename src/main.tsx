import {StrictMode} from "react";

import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";
import {RouterProvider} from "react-router";

import {ThemeProvider, ToastProvider} from "@datanose/ui";
import {AuthProvider} from "@uva-fnwi/datanose-core";
import type {AuthEventCallbacks} from "@uva-fnwi/datanose-core";

import {
    VITE_AUTH_AUTHORITY,
    VITE_AUTH_CLIENT_ID,
    VITE_AUTH_LOGOUT_URL,
} from "./helpers/Environment";
import "./i18n";
import "./index.css";
import router from "./router/routes.tsx";
import {clearCurrentUser, setAccessToken} from "./store/authSlice";
import {store} from "./store/store";

const authConfig = {
    authority: VITE_AUTH_AUTHORITY ?? "",
    clientId: VITE_AUTH_CLIENT_ID ?? "",
    redirectUri: `${window.location.origin}/callback`,
    logoutUri: VITE_AUTH_LOGOUT_URL ?? "",
};

const authEvents: AuthEventCallbacks = {
    onUserLoaded: (user) => store.dispatch(setAccessToken(user.access_token)),
    onUserUnloaded: () => {
        store.dispatch(setAccessToken(null));
        store.dispatch(clearCurrentUser());
    },
};

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <AuthProvider config={authConfig} events={authEvents}>
                <ThemeProvider>
                    <ToastProvider>
                        <RouterProvider router={router} />
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </Provider>
    </StrictMode>,
);

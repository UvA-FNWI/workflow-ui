import {StrictMode} from "react";

import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";
import {RouterProvider} from "react-router";

import {type AuthEventCallbacks, AuthProvider} from "@uva-fnwi/datanose-core";
import {ToastProvider} from "@uva-fnwi/datanose-ui";
import "@uva-fnwi/datanose-ui/styles";

import SessionExpiredModal from "./components/SessionExpiredModal";
import {
    VITE_AUTH_AUTHORITY,
    VITE_AUTH_CLIENT_ID,
    VITE_AUTH_LOGOUT_URL,
} from "./helpers/Environment";
import "./i18n";
import "./index.css";
import router from "./router/routes.tsx";
import {clearCurrentUser, openSessionExpiredModal, setAccessToken} from "./store/authSlice";
import {store} from "./store/store";

const authConfig = {
    authority: VITE_AUTH_AUTHORITY ?? "",
    clientId: VITE_AUTH_CLIENT_ID ?? "",
    redirectUri: `${window.location.origin}/callback`,
    logoutUri: VITE_AUTH_LOGOUT_URL ?? "",
};

const authEvents: AuthEventCallbacks = {
    onAccessTokenExpired: () => store.dispatch(openSessionExpiredModal()),
    onAccessTokenExpiring: () => store.dispatch(openSessionExpiredModal()),
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
                <ToastProvider>
                    <SessionExpiredModal />
                    <RouterProvider router={router} />
                </ToastProvider>
            </AuthProvider>
        </Provider>
    </StrictMode>,
);

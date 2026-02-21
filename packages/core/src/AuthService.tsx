// External
import {User, UserManager, WebStorageStateStore} from "oidc-client-ts";

// Lib
import * as authHelpers from "./Auth.helpers";
import type {AuthConfig} from "./Auth.types";
import type {AuthEventCallbacks, AuthStateChangeCallback, CustomUserState} from "./Auth.types";

// A wrapper class for the OIDC client. Offers authentication functionality through publicly exposed functions.
//
// Initialize like this inside your app (then import it elsewhere or pass it in context):
// export const authClient = new AuthService({
//     authority: import.meta.env.VITE_AUTH_AUTHORITY,
//     clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
//     redirectUri: window.location.origin,
//     logoutUri: import.meta.env.VITE_AUTH_LOGOUT_URL,
// });
class AuthService {
    private initialized = false;
    private logoutUri?: string;
    private updateState?: AuthStateChangeCallback;
    private userManager: UserManager;

    public constructor(config: AuthConfig) {
        this.logoutUri = config.logoutUri;
        this.userManager = new UserManager({
            authority: config.authority,
            // With silent renew enabled it would redirect to the callback URL on token-expiry, which we don't support right now.
            automaticSilentRenew: false,
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: "code",
            scope: "openid profile",
            // Use `localStorage` for storage instead of the default `sessionStorage`. `sessionStorage` is unique between tabs
            // which means that the user needs to log in for every open tab.
            userStore: new WebStorageStateStore({store: localStorage}),
        });
    }

    public async initialize(updateState: AuthStateChangeCallback, events: AuthEventCallbacks) {
        if (this.initialized) return;

        this.updateState = updateState;

        this.initEvents(events);

        this.initialized = true;

        if (authHelpers.isEmbeddedInCanvas()) {
            this.updateState({
                type: "auth/INITIALIZED",
                user: this.initCanvasUser(),
                providerType: "canvas",
            });
        } else {
            this.updateState({
                type: "auth/INITIALIZED",
                user: await this.initSurfUser(),
                providerType: "surf",
            });
        }
    }

    public async surfStartLogin(state: CustomUserState) {
        await this.userManager.signinRedirect({state});
    }

    public surfCompleteLogin() {
        return this.userManager.signinRedirectCallback();
    }

    public canvasCompleteLogin(token: string) {
        const canvasData = authHelpers.getUserAndMetadataForCanvasToken(token);
        this.updateState?.({
            type: "auth/USER_LOADED",
            user: authHelpers.convertUserToObject(canvasData.user),
            providerType: "canvas",
        });
        return canvasData;
    }

    public async surfRenewLogin(state: CustomUserState) {
        // Remove current user from storage before renewed login to prevent triggering event 'AccessTokenExpiring' after login
        await this.userManager.removeUser();
        await this.surfStartLogin(state);
    }

    public async surfLogout() {
        this.updateState?.({type: "auth/LOGOUT"});
        await this.userManager.removeUser();
        await this.userManager.signoutRedirectCallback();
        if (this.logoutUri) {
            window.location.href = this.logoutUri;
        }
    }

    public async impersonateSurfUser(accessToken: string) {
        const user = await this.userManager.getUser();
        if (!user) return;

        const newUser = new User({...user, access_token: accessToken});
        await this.userManager.storeUser(newUser);
        this.updateState?.({
            type: "auth/USER_LOADED",
            user: authHelpers.convertUserToObject(newUser),
            // As the OIDC client is only used for SURF, any USER_LOADED event must be for SURF
            providerType: "surf",
        });
    }

    private async initSurfUser() {
        const [user] = await Promise.all([
            this.userManager.getUser(),
            this.userManager.clearStaleState(),
        ]);
        const expired: boolean = user ? !!user.expired : false;
        return expired ? null : authHelpers.convertUserToObject(user);
    }

    private initCanvasUser = () => {
        const canvasToken = authHelpers.getCanvasTokenFromLocalStorage();
        if (!canvasToken) return null;

        const {user} = authHelpers.getUserAndMetadataForCanvasToken(canvasToken);
        return user.expired ? null : authHelpers.convertUserToObject(user);
    };

    private initEvents(events: AuthEventCallbacks) {
        if (events.onAccessTokenExpired)
            this.userManager.events.addAccessTokenExpired(events.onAccessTokenExpired);
        if (events.onAccessTokenExpiring)
            this.userManager.events.addAccessTokenExpiring(events.onAccessTokenExpiring);
        if (events.onSilentRenewError)
            this.userManager.events.addSilentRenewError(events.onSilentRenewError);
        this.userManager.events.addUserLoaded((newUser) => {
            if (authHelpers.isUserAuthenticated(newUser)) {
                this.updateState?.({
                    type: "auth/USER_LOADED",
                    user: authHelpers.convertUserToObject(newUser),
                    // As the OIDC client is only used for SURF, any USER_LOADED event must be for SURF
                    providerType: "surf",
                });
            }
            events?.onUserLoaded?.(newUser);
        });
        if (events.onUserSessionChanged)
            this.userManager.events.addUserSessionChanged(events.onUserSessionChanged);
        if (events.onUserSignedIn) this.userManager.events.addUserSignedIn(events.onUserSignedIn);
        if (events.onUserSignedOut)
            this.userManager.events.addUserSignedOut(events.onUserSignedOut);
        this.userManager.events.addUserUnloaded(() => {
            this.updateState?.({type: "auth/USER_UNLOADED"});
            events?.onUserUnloaded?.();
        });
    }
}

export default AuthService;

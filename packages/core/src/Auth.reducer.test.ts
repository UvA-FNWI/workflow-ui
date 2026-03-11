import {User} from "oidc-client-ts";
import {describe, expect, it} from "vitest";

import {type AuthAction, authReducer} from "./Auth.reducer";
import {DefaultAuthState} from "./Auth.state";

function makeUser(): User {
    return new User({
        access_token: "token",
        token_type: "Bearer",
        profile: {iss: "test", sub: "sub", aud: "aud", exp: 9999999999, iat: 0},
    });
}

describe("authReducer", () => {
    it("returns default state for unknown actions", () => {
        const state = authReducer(undefined, {type: "unknown/ACTION"});
        expect(state).toEqual(DefaultAuthState);
    });

    it("does not mutate state for non-auth actions", () => {
        const existing = {...DefaultAuthState, isAuthenticated: true};
        const state = authReducer(existing, {type: "other/ACTION"});
        expect(state).toBe(existing);
    });

    it("handles auth/INITIALIZED with a valid user", () => {
        const user = makeUser();
        const state = authReducer(undefined, {
            type: "auth/INITIALIZED",
            user,
            providerType: "surf",
        } as AuthAction);
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.providerType).toBe("surf");
        expect(state.user).toBe(user);
    });

    it("handles auth/INITIALIZED with null user", () => {
        const state = authReducer(undefined, {
            type: "auth/INITIALIZED",
            user: null,
            providerType: null,
        } as AuthAction);
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
    });

    it("handles auth/USER_LOADED", () => {
        const user = makeUser();
        const state = authReducer(undefined, {
            type: "auth/USER_LOADED",
            user,
            providerType: "canvas",
        } as AuthAction);
        expect(state.isAuthenticated).toBe(true);
        expect(state.providerType).toBe("canvas");
        expect(state.isLoggingOut).toBe(false);
    });

    it("handles auth/LOGGING_OUT", () => {
        const state = authReducer(undefined, {type: "auth/LOGGING_OUT"});
        expect(state.isLoggingOut).toBe(true);
    });

    it("handles auth/LOGOUT", () => {
        const initial = {...DefaultAuthState, isAuthenticated: true, user: makeUser()};
        const state = authReducer(initial, {type: "auth/LOGOUT"});
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    it("handles auth/USER_UNLOADED", () => {
        const initial = {...DefaultAuthState, isAuthenticated: true, user: makeUser()};
        const state = authReducer(initial, {type: "auth/USER_UNLOADED"});
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });
});

import {User} from "oidc-client-ts";
import {describe, expect, it} from "vitest";

import {
    selectAuthProviderType,
    selectAuthStatus,
    selectAuthUser,
    selectIsAuthenticated,
} from "./Auth.selectors";
import {DefaultAuthState} from "./Auth.state";
import type {AuthState} from "./Auth.state";

function makeUser(): User {
    return new User({
        access_token: "token",
        token_type: "Bearer",
        profile: {iss: "test", sub: "sub", aud: "aud", exp: 9999999999, iat: 0},
    });
}

describe("selectAuthUser", () => {
    it("returns null from default state", () => {
        expect(selectAuthUser(DefaultAuthState)).toBeNull();
    });

    it("returns the user when set", () => {
        const user = makeUser();
        const state: AuthState = {...DefaultAuthState, user};
        expect(selectAuthUser(state)).toBe(user);
    });
});

describe("selectAuthStatus", () => {
    it("returns 'pending' when isLoading is true", () => {
        expect(selectAuthStatus(DefaultAuthState)).toBe("pending");
    });

    it("returns 'fulfilled' when isLoading is false", () => {
        const state: AuthState = {...DefaultAuthState, isLoading: false};
        expect(selectAuthStatus(state)).toBe("fulfilled");
    });
});

describe("selectAuthProviderType", () => {
    it("returns null from default state", () => {
        expect(selectAuthProviderType(DefaultAuthState)).toBeNull();
    });

    it("returns 'surf' when set", () => {
        const state: AuthState = {...DefaultAuthState, providerType: "surf"};
        expect(selectAuthProviderType(state)).toBe("surf");
    });

    it("returns 'canvas' when set", () => {
        const state: AuthState = {...DefaultAuthState, providerType: "canvas"};
        expect(selectAuthProviderType(state)).toBe("canvas");
    });
});

describe("selectIsAuthenticated", () => {
    it("returns false from default state", () => {
        expect(selectIsAuthenticated(DefaultAuthState)).toBe(false);
    });

    it("returns true when authenticated", () => {
        const state: AuthState = {...DefaultAuthState, isAuthenticated: true};
        expect(selectIsAuthenticated(state)).toBe(true);
    });
});

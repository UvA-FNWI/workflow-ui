import {User} from "oidc-client-ts";
import {describe, expect, it} from "vitest";

import {
    convertUserToObject,
    getDataFromToken,
    isEmbedded,
    isEmbeddedInCanvas,
    isImpersonating,
    isUserAuthenticated,
} from "./Auth.helpers";

// Helper to build a minimal base64url-encoded JWT
function makeJwt(payload: object): string {
    const encoded = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    return `header.${encoded}.signature`;
}

// Helper to build a minimal User object
function makeUser(overrides: Partial<ConstructorParameters<typeof User>[0]> = {}): User {
    return new User({
        access_token: "token",
        token_type: "Bearer",
        profile: {iss: "test", sub: "sub", aud: "aud", exp: 9999999999, iat: 0},
        ...overrides,
    });
}

describe("getDataFromToken", () => {
    it("decodes payload from a valid JWT", () => {
        const payload = {sub: "123", name: "Alice"};
        const result = getDataFromToken<typeof payload>(makeJwt(payload));
        expect(result).toMatchObject(payload);
    });

    it("returns null for an empty string", () => {
        expect(getDataFromToken("")).toBeNull();
    });

    it("returns null for a string with no dot-separated parts", () => {
        expect(getDataFromToken("notajwt")).toBeNull();
    });
});

describe("isUserAuthenticated", () => {
    it("returns false for null", () => {
        expect(isUserAuthenticated(null)).toBe(false);
    });

    it("returns true for a non-expired user with an access token", () => {
        const user = makeUser({expires_at: 9999999999});
        expect(isUserAuthenticated(user)).toBe(true);
    });

    it("returns false for an expired user", () => {
        const user = makeUser({expires_at: 1});
        expect(isUserAuthenticated(user)).toBe(false);
    });
});

describe("isEmbedded", () => {
    it("returns false when location equals parent location", () => {
        // In jsdom both are the same object
        expect(isEmbedded()).toBe(false);
    });

    it("returns true when accessing parent throws (cross-origin)", () => {
        const original = Object.getOwnPropertyDescriptor(window, "parent");
        Object.defineProperty(window, "parent", {
            get() {
                throw new Error("cross-origin");
            },
            configurable: true,
        });
        expect(isEmbedded()).toBe(true);
        if (original) Object.defineProperty(window, "parent", original);
    });
});

describe("isEmbeddedInCanvas", () => {
    it("returns false when not embedded", () => {
        expect(isEmbeddedInCanvas()).toBe(false);
    });
});

describe("convertUserToObject", () => {
    it("returns null for null input", () => {
        expect(convertUserToObject(null)).toBeNull();
    });

    it("returns a plain object for a User", () => {
        const user = makeUser();
        const result = convertUserToObject(user);
        expect(result).not.toBeNull();
        expect(result).toMatchObject({access_token: "token"});
    });
});

describe("isImpersonating", () => {
    it("returns false for null user", () => {
        expect(isImpersonating(null)).toBe(false);
    });

    it("returns false when impersonatedid is empty", () => {
        const token = makeJwt({impersonatedid: "", iss: "dn"});
        const user = makeUser({access_token: token});
        expect(isImpersonating(user)).toBe(false);
    });

    it("returns true when impersonatedid is set", () => {
        const token = makeJwt({impersonatedid: "456", iss: "dn"});
        const user = makeUser({access_token: token});
        expect(isImpersonating(user)).toBe(true);
    });

    it("is synchronous (not a Promise)", () => {
        const result = isImpersonating(null);
        expect(result).not.toBeInstanceOf(Promise);
    });
});

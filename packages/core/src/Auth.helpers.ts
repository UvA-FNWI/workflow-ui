// External
import {User} from "oidc-client-ts";

// Lib
import type {CanvasToken, CanvasUserAndMetadata, DataNoseToken} from "./Auth.types";

/**
 * Fetch the data part contained within a JWT.
 */
export const getDataFromToken = <T>(token: string): T | null => {
    const dataPart = token?.split(".")[1];
    if (!dataPart) return null;
    const base64String = dataPart.replace(/-/g, "+").replace(/_/g, "/");
    const jsonString = decodeURIComponent(
        window
            .atob(base64String)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
    );
    return JSON.parse(jsonString);
};

/**
 * Check if a user is authenticated.
 */
export const isUserAuthenticated = (user: User | null) => {
    if (user === null) return false;

    return !!user.access_token && !user.expired;
};

/**
 * Checks if the application is embedded.
 */
export const isEmbedded = (): boolean => {
    try {
        return window.location !== window.parent.location;
    } catch {
        return true;
    }
};

/**
 * Checks if the application is embedded in Canvas.
 */
export const isEmbeddedInCanvas = () => {
    if (!isEmbedded() || !document.referrer) return false;

    try {
        const {host} = new URL(document.referrer);

        return [
            /^uvadlo-.*\.instructure\.com$/,
            /^uvadlo-.*\.test\.instructure\.com$/,
            /^canvas\.instructure\.com$/,
        ].some((r) => r.test(host));
    } catch {
        return false;
    }
};

/**
 * Takes a Canvas token and uses it to build a new User object and return additional metadata.
 */
export const getUserAndMetadataForCanvasToken = (token: string): CanvasUserAndMetadata => {
    const tokenData = getDataFromToken<CanvasToken>(token);
    if (!tokenData) throw new Error("Error while logging in");

    const newUser: User = new User({
        access_token: token,
        token_type: "Bearer",
        profile: {
            iss: tokenData.iss ?? "",
            sub: "",
            aud: "",
            exp: tokenData.exp ?? 0,
            iat: tokenData.iat ?? 0,
        },
    });

    newUser.expires_at = tokenData.exp;

    return {user: newUser, target: tokenData.target, locale: tokenData.locale};
};

/**
 * Get the Canvas token from a separate section of the local storage (non-OIDC).
 */
export const getCanvasTokenFromLocalStorage = () => {
    return localStorage.getItem("canvas-token");
};

/**
 * Set the Canvas token in a separate section of the local storage (non-OIDC).
 */
export const setCanvasTokenInLocalStorage = (token: string) => {
    localStorage.setItem("canvas-token", token);
};

/**
 * Convert the User object to a regular object so it can be stored.
 */
export const convertUserToObject = (user: User | null) => {
    return user ? Object.assign({}, user) : null;
};

/**
 * Checks if the current user is actually someone impersonating another user.
 */
export const isImpersonating = (user: User | null) => {
    const token = getDataFromToken<DataNoseToken>(user?.access_token ?? "");
    return (token?.impersonatedid ?? "") !== "";
};

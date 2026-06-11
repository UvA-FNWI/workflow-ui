import {useCallback, useMemo} from "react";

import {type NavigateOptions, type To, useNavigate, useSearchParams} from "react-router";

/**
 * Returns the query-string suffix (e.g. "?version=foo") that must be carried across navigation so
 * the selected workflow version is not lost. Empty string when no version is set.
 */
export const useVersionSuffix = () => {
    const [params] = useSearchParams();
    const version = params.get("version");
    return useMemo(() => {
        if (version === null) {
            return "";
        }
        const next = new URLSearchParams();
        next.set("version", version);
        return `?${next.toString()}`;
    }, [version]);
};

/**
 * Appends the current version to a string path so it can be passed to <Link> or used directly.
 */
export const useVersionedPath = () => {
    const suffix = useVersionSuffix();
    return useCallback((path: string) => `${path}${suffix}`, [suffix]);
};

/**
 * Drop-in replacement for react-router's useNavigate that preserves the ?version= param when given
 * a string path.
 */
export const useVersionedNavigate = () => {
    const navigate = useNavigate();
    const suffix = useVersionSuffix();
    return useCallback(
        (to: To, options?: NavigateOptions) =>
            navigate(typeof to === "string" ? `${to}${suffix}` : to, options),
        [navigate, suffix],
    );
};

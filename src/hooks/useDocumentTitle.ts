import {useEffect} from "react";

import {useAppName} from "~/hooks/useAppName";

/**
 * Sets the browser tab title to "<appName> | <title>".
 * Falls back to just the app name when title is empty/undefined (e.g. while loading).
 */
export function useDocumentTitle(title?: string | null) {
    const appName = useAppName();

    useEffect(() => {
        document.title = title ? `${appName} | ${title}` : appName;
    }, [appName, title]);
}

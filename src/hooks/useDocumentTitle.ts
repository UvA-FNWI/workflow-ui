import {useEffect} from "react";

const APP_NAME = "Milestones";

/**
 * Sets the browser tab title to "Milestones | <title>".
 * Falls back to just "Milestones" when title is empty/undefined (e.g. while loading).
 *
 * @param title - The page-specific part of the title.
 *
 * @example
 * useDocumentTitle("Develop"); // -> "Milestones | Develop"
 */
export function useDocumentTitle(title?: string | null) {
    useEffect(() => {
        document.title = title ? `${APP_NAME} | ${title}` : APP_NAME;
    }, [title]);
}

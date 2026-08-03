import {useState} from "react";

import {useTranslate} from "~/hooks/useTranslate";
import {setWorkflowVersion} from "~/hooks/useVersionedNavigate";
import {useLoadBranchMutation} from "~/store/api/versionsApi";

// A failed load/reload returns its message as the (text) response body.
export function versionErrorText(error: unknown, fallback: string): string {
    const data = (error as {data?: unknown}).data;
    return typeof data === "string" && data ? data : fallback;
}

/** Load a ref as a preview version, then switch the app to it (full reload). */
export function useLoadVersion() {
    const {t} = useTranslate("common");
    const [loadBranch, {isLoading, originalArgs: pendingRef}] = useLoadBranchMutation();
    const [error, setError] = useState<string | null>(null);

    const load = async (ref: string) => {
        setError(null);
        try {
            await loadBranch(ref).unwrap();
            setWorkflowVersion(ref);
        } catch (e) {
            setError(versionErrorText(e, t("version_load_error")));
        }
    };

    return {load, isLoading, pendingRef, error};
}

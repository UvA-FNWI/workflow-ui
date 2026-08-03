import {Button} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {setWorkflowVersion} from "~/hooks/useVersionedNavigate";

/**
 * App-wide banner shown while viewing a non-default config version (a branch or upload preview).
 * The active version lives in the URL (?version=), the same source as the Workflow-Version header.
 */
export function PreviewBanner() {
    const {t} = useTranslate("common");
    const version = new URLSearchParams(window.location.search).get("version") ?? "";
    if (!version) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
            <span>
                {t("version_previewing")} <strong>{version}</strong>
            </span>
            <Button intent="secondary" onClick={() => setWorkflowVersion(null)} type="button">
                {t("version_exit_preview")}
            </Button>
        </div>
    );
}

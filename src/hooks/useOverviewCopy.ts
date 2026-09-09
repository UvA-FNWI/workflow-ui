import type {LocalString} from "~/hooks/useTranslate";
import {useTranslate} from "~/hooks/useTranslate";
import type {OverviewUiSettings} from "~/store/api/types/settings";

/**
 * Overview page copy.
 *
 * Deployment-specific strings come from workflow-config `Settings.yaml` → `ui.overview`
 * via GET /Settings. workflow-ui provides generic fallbacks when settings are absent.
 */
export function useOverviewCopy(overview?: OverviewUiSettings | null) {
    const {t, l} = useTranslate("workflow");

    const resolve = (configured: LocalString | null | undefined, fallbackKey: string) =>
        (configured && l(configured)) || t(fallbackKey);

    return {
        pageTitle: resolve(overview?.pageTitle, "overview.page_title"),
        title: resolve(overview?.title, "overview.default_title"),
        subtitle: resolve(overview?.subtitle, "overview.default_subtitle"),
        noAccess: resolve(overview?.noAccess, "overview.default_no_access"),
    };
}

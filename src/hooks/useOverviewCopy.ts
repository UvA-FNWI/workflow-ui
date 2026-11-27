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

    const configuredSubtitle = overview?.subtitle ? l(overview.subtitle) : undefined;

    return {
        pageTitle:
            (overview?.pageTitle && l(overview.pageTitle)) || t("overview.page_title"),
        title: (overview?.title && l(overview.title)) || t("overview.hub_title"),
        /** Shown under the page title when set in Settings.yaml; omit the key to hide. */
        subtitle: configuredSubtitle,
        noAccess: (overview?.noAccess && l(overview.noAccess)) || t("overview.no_access"),
    };
}

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

    const configuredSubtitle = overview?.subtitle ? l(overview.subtitle) : undefined;

    return {
        pageTitle: resolve(overview?.pageTitle, "overview.page_title"),
        // Coordinator home H1: legacy Milestones used choose_course_title only (no second heading).
        title: resolve(overview?.title, "overview.choose_course_title"),
        /** Shown under the page title when set in Settings.yaml; omit the key to hide. */
        subtitle: configuredSubtitle,
        noAccess: resolve(overview?.noAccess, "overview.default_no_access"),
    };
}

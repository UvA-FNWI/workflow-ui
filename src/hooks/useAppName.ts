import {VITE_APP_NAME} from "~/helpers/Environment";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetSettingsQuery} from "~/store/api/settingsApi";

/**
 * Deployment app name from workflow-config `Settings.yaml` → `ui.appName` via GET /Settings,
 * with `VITE_APP_NAME` and a generic locale fallback when settings are absent.
 */
export function useAppName(): string {
    const {t, l} = useTranslate("workflow");
    const {data: settings} = useGetSettingsQuery();
    const configured = settings?.ui?.appName;

    return (configured && l(configured)) || VITE_APP_NAME || t("app_name");
}

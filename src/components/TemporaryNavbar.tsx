import {type ChangeEvent, useCallback, useEffect, useState} from "react";

import {isEmbeddedInCanvas} from "@uva-fnwi/datanose-core";
import {useAuth} from "@uva-fnwi/datanose-core";
import {Button, Icon, useTheme, useToast} from "@uva-fnwi/datanose-ui";

import {VITE_ENV, VITE_WEBAPI_URL} from "../helpers/Environment";
import {CreateWorkflowInstanceModal} from "./instance/CreateWorkflowInstanceModal";
import {useTranslate} from "~/hooks/useTranslate";
import {selectAccessToken, selectCurrentUser} from "~/store/authSlice";
import {useAppSelector} from "~/store/store";

type Language = "en" | "nl";

// Temporary navbar for quick theme & language switching during development.
function TemporaryNavbar() {
    const [isCreateInstanceOpen, setIsCreateInstanceOpen] = useState(false);
    const {resolvedTheme, setTheme} = useTheme();
    const {i18n, t} = useTranslate("common");
    const {isAuthenticated, surfLogout} = useAuth();
    const toast = useToast();
    const user = useAppSelector(selectCurrentUser);
    const accessToken = useAppSelector(selectAccessToken);

    const handleCopyBearerToken = useCallback(async () => {
        if (!accessToken) {
            toast.error(t("copy_token_unavailable"));
            return;
        }

        try {
            await navigator.clipboard.writeText(accessToken);
            toast.success(t("copy_token_success"));
        } catch {
            toast.error(t("copy_token_failed"));
        }
    }, [accessToken, t, toast]);
    useEffect(() => {
        document.documentElement.setAttribute("lang", i18n.language);
    }, [i18n.language]);

    const handleThemeToggle = () => {
        const nextTheme = resolvedTheme === "light" ? "dark" : "light";
        setTheme(nextTheme);
    };

    const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = event.target.value as Language;
        i18n.changeLanguage(newLanguage);
    };
    if (isEmbeddedInCanvas()) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-6 border-b border-grey-300 bg-white/90 px-6 py-4 text-grey-900 shadow-sm backdrop-blur dark:border-grey-800 dark:bg-grey-900/90 dark:text-grey-100">
            <div>
                <p className="text-base font-semibold">Workflow UI</p>
                <p className="text-xs text-grey-700 dark:text-grey-300">
                    {VITE_ENV} | {VITE_WEBAPI_URL}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                {isAuthenticated && (
                    <>
                        <Button
                            intent="secondary"
                            onClick={() => setIsCreateInstanceOpen(true)}
                            type="button"
                        >
                            {t("create_instance")}
                        </Button>
                        <Button
                            intent="secondary"
                            onClick={() => handleCopyBearerToken()}
                            type="button"
                            aria-label={t("copy_token")}
                            title={t("copy_token")}
                        >
                            <Icon name="copy-line" color="current" />
                        </Button>
                    </>
                )}
                <Button intent="secondary" onClick={handleThemeToggle} type="button">
                    {/* Switch to {resolvedTheme === "light" ? "Dark" : "Light"} Mode */}
                    {resolvedTheme === "light" ? (
                        <Icon name="moon-line" color="current" />
                    ) : (
                        <Icon name="sun-line" color="current" />
                    )}
                </Button>
                <label
                    className="flex items-center gap-2 text-sm font-medium text-grey-700 dark:text-grey-200"
                    htmlFor="temporary-language-select"
                >
                    {t("language")}
                    <select
                        id="temporary-language-select"
                        aria-label="Select language"
                        className="rounded border border-grey-300 bg-white px-2 py-1 text-sm text-grey-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-grey-700 dark:bg-grey-800 dark:text-grey-100"
                        value={i18n.language}
                        onChange={handleLanguageChange}
                    >
                        <option value="en">{t("language_en")}</option>
                        <option value="nl">{t("language_nl")}</option>
                    </select>
                </label>
                {isAuthenticated && (
                    <Button
                        intent="primary"
                        variant="destructive"
                        onClick={() => void surfLogout()}
                        type="button"
                    >
                        {t("logout")} ({user?.displayName})
                    </Button>
                )}
            </div>
            <CreateWorkflowInstanceModal
                isOpen={isCreateInstanceOpen}
                onOpenChange={setIsCreateInstanceOpen}
            />
        </nav>
    );
}

export default TemporaryNavbar;

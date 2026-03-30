import {type ChangeEvent, useEffect} from "react";

import {Button, useTheme} from "@datanose/ui";
import {isEmbeddedInCanvas} from "@uva-fnwi/datanose-core";
import {useAuth} from "@uva-fnwi/datanose-core";

import {VITE_ENV, VITE_WEBAPI_URL} from "../helpers/Environment";
import {useTranslate} from "~/hooks/useTranslate";
import {selectCurrentUser} from "~/store/authSlice";
import {useAppSelector} from "~/store/store";

type Language = "en" | "nl";

// Temporary navbar for quick theme & language switching during development.
function TemporaryNavbar() {
    const {resolvedTheme, setTheme} = useTheme();
    const {i18n, t} = useTranslate("common");
    const {isAuthenticated, surfLogout} = useAuth();
    const user = useAppSelector(selectCurrentUser);
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
                <Button intent="secondary" onClick={handleThemeToggle} type="button">
                    Switch to {resolvedTheme === "light" ? "Dark" : "Light"} Mode
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
        </nav>
    );
}

export default TemporaryNavbar;

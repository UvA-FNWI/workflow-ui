import {type ChangeEvent, useEffect} from "react";

import {Button, useTheme} from "@datanose/ui";

import {VITE_ENV, VITE_WEBAPI_URL} from "../helpers/Environment";
import {useTranslate} from "~/hooks/useTranslate";

type Language = "en" | "nl";

// Temporary navbar for quick theme & language switching during development.
function TemporaryNavbar() {
    const {resolvedTheme, setTheme} = useTheme();
    const {i18n, t} = useTranslate("common");

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

    return (
        <nav className="border-grey-300 text-grey-900 dark:border-grey-800 dark:bg-grey-900/90 dark:text-grey-100 sticky top-0 z-10 flex flex-wrap items-center justify-between gap-6 border-b bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
            <div>
                <p className="text-base font-semibold">Workflow UI</p>
                <p className="text-grey-700 dark:text-grey-300 text-xs">
                    {VITE_ENV} | {VITE_WEBAPI_URL}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Button intent="secondary" onClick={handleThemeToggle} type="button">
                    Switch to {resolvedTheme === "light" ? "Dark" : "Light"} Mode
                </Button>
                <label
                    className="text-grey-700 dark:text-grey-200 flex items-center gap-2 text-sm font-medium"
                    htmlFor="temporary-language-select"
                >
                    {t("language")}
                    <select
                        id="temporary-language-select"
                        aria-label="Select language"
                        className="border-grey-300 text-grey-900 dark:border-grey-700 dark:bg-grey-800 dark:text-grey-100 rounded border bg-white px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={i18n.language}
                        onChange={handleLanguageChange}
                    >
                        <option value="en">{t("language_en")}</option>
                        <option value="nl">{t("language_nl")}</option>
                    </select>
                </label>
            </div>
        </nav>
    );
}

export default TemporaryNavbar;

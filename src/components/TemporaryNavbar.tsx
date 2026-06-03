import {useEffect} from "react";

import {isEmbeddedInCanvas} from "@uva-fnwi/datanose-core";
import {useAuth} from "@uva-fnwi/datanose-core";
import {Button, Select, SelectItem, useTheme} from "@uva-fnwi/datanose-ui";

import {VITE_ENV, VITE_WEBAPI_URL} from "../helpers/Environment";
import {VersionedLink} from "~/components/VersionedLink";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetVersionsQuery} from "~/store/api/versionsApi";
import {selectCurrentUser} from "~/store/authSlice";
import {useAppSelector} from "~/store/store";

type Language = "en" | "nl";

// Sentinel key for the default (empty) workflow version, since react-aria treats "" as no selection.
const DEFAULT_VERSION_KEY = "__default__";

// Temporary navbar for quick theme & language switching during development.
function TemporaryNavbar() {
    const {resolvedTheme, setTheme} = useTheme();
    const {i18n, t} = useTranslate("common");
    const {isAuthenticated, surfLogout} = useAuth();
    const user = useAppSelector(selectCurrentUser);
    // The Develop page and version switching are developer/admin functionality, locked behind
    // super-admin rights (see /Users/Me isSuperAdmin).
    const isSuperAdmin = user?.isSuperAdmin ?? false;
    const {data: versions} = useGetVersionsQuery(undefined, {skip: !isSuperAdmin});
    const currentVersion = new URLSearchParams(window.location.search).get("version") ?? "";
    useEffect(() => {
        document.documentElement.setAttribute("lang", i18n.language);
    }, [i18n.language]);

    const handleThemeToggle = () => {
        const nextTheme = resolvedTheme === "light" ? "dark" : "light";
        setTheme(nextTheme);
    };

    // The backend may already list the default ("") version; dedupe and surface it as "default".
    const namedVersions = (versions ?? []).filter((v) => v !== "");
    const versionOptions = [
        {key: DEFAULT_VERSION_KEY, label: t("version_default")},
        ...namedVersions.map((version) => ({key: version, label: version})),
    ];
    // Keep an unknown version from the URL selectable so it stays visible.
    if (currentVersion !== "" && !namedVersions.includes(currentVersion)) {
        versionOptions.push({key: currentVersion, label: currentVersion});
    }
    const selectedVersionKey = currentVersion === "" ? DEFAULT_VERSION_KEY : currentVersion;

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
                {isSuperAdmin && (
                    <div className="flex items-center gap-4">
                        <VersionedLink to="/develop" className="text-sm font-medium underline">
                            {t("develop")}
                        </VersionedLink>
                        <label className="flex items-center gap-2 text-sm font-medium text-grey-700 dark:text-grey-200">
                            {t("version")}
                            <div className="w-36">
                                <Select
                                    aria-label={t("version")}
                                    selectedKey={selectedVersionKey}
                                    onChange={(key) => {
                                        const version =
                                            key === DEFAULT_VERSION_KEY ? "" : String(key);
                                        const params = new URLSearchParams(window.location.search);
                                        if (version) {
                                            params.set("version", version);
                                        } else {
                                            params.delete("version");
                                        }
                                        // Full reload so every cached query refetches under the new version.
                                        window.location.search = params.toString();
                                    }}
                                >
                                    {versionOptions.map((option) => (
                                        <SelectItem key={option.key}>{option.label}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </label>
                    </div>
                )}
                <Button intent="secondary" onClick={handleThemeToggle} type="button">
                    Switch to {resolvedTheme === "light" ? "Dark" : "Light"} Mode
                </Button>
                <label className="flex items-center gap-2 text-sm font-medium text-grey-700 dark:text-grey-200">
                    {t("language")}
                    <div className="w-32">
                        <Select
                            aria-label={t("language")}
                            selectedKey={i18n.language}
                            onChange={(key) => i18n.changeLanguage(String(key) as Language)}
                        >
                            <SelectItem key="en">{t("language_en")}</SelectItem>
                            <SelectItem key="nl">{t("language_nl")}</SelectItem>
                        </Select>
                    </div>
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

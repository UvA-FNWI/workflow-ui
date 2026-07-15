import {Select, SelectItem} from "@uva-fnwi/datanose-ui";

import {useLoadVersion} from "~/hooks/useLoadVersion";
import {useTranslate} from "~/hooks/useTranslate";
import {setWorkflowVersion} from "~/hooks/useVersionedNavigate";
import {useGetBranchesQuery, useGetVersionDetailsQuery} from "~/store/api/versionsApi";
import {formatRelativeTime} from "~/utils/formatDate";

// Sentinel key for the default (empty) workflow version, since react-aria treats "" as no selection.
const DEFAULT_VERSION_KEY = "__default__";

const shortSha = (sha: string) => sha.slice(0, 7);

/**
 * Navbar version switcher: pick the baseline, an already-loaded version, or an available repo
 * branch (which is loaded on the fly, then previewed).
 */
export function VersionPicker() {
    const {i18n, t} = useTranslate("common");
    const {data: details = []} = useGetVersionDetailsQuery();
    const {data: branches = []} = useGetBranchesQuery();
    const {load, isLoading, pendingRef, error} = useLoadVersion();

    const currentVersion = new URLSearchParams(window.location.search).get("version") ?? "";

    // Merge loaded versions (baseline + branch previews + uploads) with available repo branches.
    const loadedByName = new Map(details.map((d) => [d.name, d]));
    const baseline = loadedByName.get("");
    const versionOptions = [
        {
            key: DEFAULT_VERSION_KEY,
            label: baseline?.commit
                ? `${t("version_default")} · ${shortSha(baseline.commit)}`
                : t("version_default"),
        },
        ...details
            .filter((d) => d.name !== "")
            .map((d) => ({
                key: d.name,
                label: `${d.name} · ${d.commit ? shortSha(d.commit) : t(d.kind === "Branch" ? "version_branch" : "version_upload")} · ${formatRelativeTime(d.loadedAt, i18n.language)}`,
            })),
        ...branches
            .filter((b) => !loadedByName.has(b))
            .map((b) => ({key: b, label: `${b} · ${t("version_available")}`})),
    ];
    // Keep an unknown version from the URL selectable so it stays visible.
    if (currentVersion !== "" && !versionOptions.some((o) => o.key === currentVersion)) {
        versionOptions.push({key: currentVersion, label: currentVersion});
    }
    const selectedVersionKey = currentVersion === "" ? DEFAULT_VERSION_KEY : currentVersion;

    const handleSelect = (key: string) => {
        if (key === DEFAULT_VERSION_KEY) return setWorkflowVersion(null);
        if (loadedByName.has(key)) return setWorkflowVersion(key);
        void load(key); // an available (un-loaded) branch
    };

    return (
        <label className="flex items-center gap-2 text-sm font-medium text-grey-700 dark:text-grey-200">
            {t("version")}
            <div className="w-72">
                <Select
                    aria-label={t("version")}
                    selectedKey={selectedVersionKey}
                    isDisabled={isLoading}
                    onChange={(key) => handleSelect(String(key))}
                >
                    {versionOptions.map((option) => (
                        <SelectItem key={option.key} textValue={option.key}>
                            {option.label}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            {isLoading && (
                <span className="text-xs text-grey-600 dark:text-grey-300">
                    {t("version_loading_ref", {ref: pendingRef})}
                </span>
            )}
            {error && <span className="text-xs text-red-700 dark:text-red-300">{error}</span>}
        </label>
    );
}

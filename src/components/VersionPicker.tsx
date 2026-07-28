import {Select, SelectItem} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {setWorkflowVersion} from "~/hooks/useVersionedNavigate";
import {useGetVersionDetailsQuery} from "~/store/api/versionsApi";
import {formatRelativeTime} from "~/utils/formatDate";

// Sentinel key for the default (empty) workflow version, since react-aria treats "" as no selection.
const DEFAULT_VERSION_KEY = "__default__";

const shortSha = (sha: string) => sha.slice(0, 7);

/**
 * Navbar version switcher for versions already loaded into this pod.
 */
export function VersionPicker() {
    const {i18n, t} = useTranslate("common");
    const {data: details = []} = useGetVersionDetailsQuery();

    const currentVersion = new URLSearchParams(window.location.search).get("version") ?? "";

    const baseline = details.find((d) => d.name === "");
    const selectableVersions = details.filter((d) => d.name !== "");

    if (selectableVersions.length === 0) {
        return null;
    }

    const versionOptions = [
        {
            key: DEFAULT_VERSION_KEY,
            label: baseline?.commit
                ? `${t("version_default")} · ${shortSha(baseline.commit)}`
                : t("version_default"),
        },
        ...selectableVersions.map((d) => ({
            key: d.name,
            label: `${d.name} · ${d.commit ? shortSha(d.commit) : t(d.kind === "Branch" ? "version_branch" : "version_upload")} · ${formatRelativeTime(d.loadedAt, i18n.language)}`,
        })),
    ];
    const selectedVersionKey = currentVersion === "" ? DEFAULT_VERSION_KEY : currentVersion;

    const handleSelect = (key: string) => {
        if (key === DEFAULT_VERSION_KEY) return setWorkflowVersion(null);
        setWorkflowVersion(key);
    };

    return (
        <label className="flex items-center gap-2 text-sm font-medium text-grey-700 dark:text-grey-200">
            {t("version")}
            <div className="w-fit">
                <Select
                    aria-label={t("version")}
                    className="h-8! min-h-8! w-auto! py-1! text-sm!"
                    selectedKey={selectedVersionKey}
                    onChange={(key) => handleSelect(String(key))}
                >
                    {versionOptions.map((option) => (
                        <SelectItem key={option.key} textValue={option.key}>
                            {option.label}
                        </SelectItem>
                    ))}
                </Select>
            </div>
        </label>
    );
}

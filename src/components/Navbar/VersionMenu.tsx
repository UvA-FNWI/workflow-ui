import {useSearchParams} from "react-router";

import {MenuItem} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {setWorkflowVersion} from "~/hooks/useVersionedNavigate";
import {useGetVersionDetailsQuery} from "~/store/api/versionsApi";
import {formatRelativeTime} from "~/utils/formatDate";

// Sentinel key for the default (empty) workflow version, since react-aria treats "" as no selection.
const DEFAULT_VERSION_KEY = "__default__";

const shortSha = (sha: string) => sha.slice(0, 7);

export function useVersionMenuItem(showVersionPicker: boolean) {
    const {i18n, t} = useTranslate("common");
    const [searchParams] = useSearchParams();
    const {data: details = []} = useGetVersionDetailsQuery(undefined, {
        skip: !showVersionPicker,
    });
    const currentVersion = searchParams.get("version") ?? "";
    const baseline = details.find((detail) => detail.name === "");
    const selectableVersions = details.filter((detail) => detail.name !== "");
    const versionOptions = [
        {
            key: DEFAULT_VERSION_KEY,
            label: baseline?.commit
                ? `${t("version_default")} · ${shortSha(baseline.commit)}`
                : t("version_default"),
        },
        ...selectableVersions.map((detail) => ({
            key: detail.name,
            label: `${detail.name} · ${detail.commit ? shortSha(detail.commit) : t(detail.kind === "Branch" ? "version_branch" : "version_upload")} · ${formatRelativeTime(detail.loadedAt, i18n.language)}`,
        })),
    ];
    const selectedVersionKey = currentVersion === "" ? DEFAULT_VERSION_KEY : currentVersion;
    const selectedVersion = versionOptions.find((option) => option.key === selectedVersionKey);

    if (!showVersionPicker || selectableVersions.length === 0 || !selectedVersion) {
        return null;
    }

    const handleSelect = (key: string) =>
        setWorkflowVersion(key === DEFAULT_VERSION_KEY ? null : key);

    return (
        <MenuItem
            key="version"
            id="version"
            textValue={t("version")}
            icon="text-sparkle-line"
            label={`${t("version")}: ${selectedVersion.label}`}
            selectionMode="single"
            selectedKeys={[selectedVersionKey]}
        >
            {versionOptions.map((option) => (
                <MenuItem
                    key={option.key}
                    id={option.key}
                    textValue={option.label}
                    onAction={() => handleSelect(option.key)}
                    label={option.label}
                />
            ))}
        </MenuItem>
    );
}

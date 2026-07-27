import {useState} from "react";

import {Button, Card, Heading, Input, useToast} from "@uva-fnwi/datanose-ui";

import {useLoadVersion, versionErrorText} from "~/hooks/useLoadVersion";
import {useTranslate} from "~/hooks/useTranslate";
import {useReloadBaselineMutation} from "~/store/api/versionsApi";

/**
 * Version management: load an arbitrary ref (branch / tag / SHA) as a preview
 * version, and reload the baseline from the configured source.
 */
export function ConfigVersionCard() {
    const {t} = useTranslate("common");
    const toast = useToast();
    const {load, isLoading, error} = useLoadVersion();
    const [reloadBaseline, {isLoading: isReloading}] = useReloadBaselineMutation();
    const [ref, setRef] = useState("");
    const [reloadError, setReloadError] = useState<string | null>(null);

    const currentVersion = new URLSearchParams(window.location.search).get("version") ?? "";

    const handleReload = async () => {
        setReloadError(null);
        try {
            await reloadBaseline().unwrap();
            toast.success(t("version_baseline_reloaded"));
            // Refresh the current view only if we're on the (now-updated) baseline.
            if (!currentVersion) window.location.reload();
        } catch (e) {
            setReloadError(versionErrorText(e, t("version_reload_error")));
        }
    };

    return (
        <Card className="mb-4">
            <Heading as="h2" size="md" className="mb-4">
                {t("config_version")}
            </Heading>
            <p className="mb-4 text-sm text-grey-700 dark:text-grey-300">
                {t("version_currently_viewing")}{" "}
                <span className="font-semibold">
                    {currentVersion || t("version_baseline_default")}
                </span>
            </p>
            <div className="flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-grey-700 dark:text-grey-200">
                    {t("version_load_ref")}
                    <div className="w-64">
                        <Input
                            type="text"
                            placeholder={t("version_ref_placeholder")}
                            value={ref}
                            onChange={(value: string) => setRef(value)}
                        />
                    </div>
                </label>
                <Button
                    intent="secondary"
                    type="button"
                    disabled={ref.trim() === ""}
                    isLoading={isLoading}
                    onClick={() => void load(ref.trim())}
                >
                    {t("version_load")}
                </Button>
                <Button
                    intent="secondary"
                    type="button"
                    isLoading={isReloading}
                    onClick={() => void handleReload()}
                >
                    {t("version_reload_baseline")}
                </Button>
            </div>
            {(error || reloadError) && (
                <p className="mt-3 text-sm text-red-700 dark:text-red-300">
                    {error ?? reloadError}
                </p>
            )}
        </Card>
    );
}

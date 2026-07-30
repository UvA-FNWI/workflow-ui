import {Button, Heading, Skeleton} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {VersionedLink} from "~/components/VersionedLink.tsx";
import {useJobTranslations} from "~/hooks/useJobTranslations";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";

interface InstanceHeaderProps {
    courseName?: LocalString | string | null;
    instanceId?: string;
    canUseAdminTools?: boolean;
    isLoading: boolean;
}

export function InstanceHeader({
    courseName,
    instanceId,
    canUseAdminTools = false,
    isLoading,
}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");
    const {page} = useJobTranslations();

    if (isLoading) {
        return (
            <div className="mb-8 flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-8 w-48" />
                    {canUseAdminTools && <Skeleton className="h-10 w-28" />}
                </div>
            </div>
        );
    }

    const displayTitle =
        (typeof courseName === "string" ? courseName : l(courseName)) ||
        t("instance.workflowInstance");

    return (
        <div className="mb-8 flex flex-col gap-2">
            <BackLink>{t("home")}</BackLink>
            <div className="flex items-center justify-between gap-4">
                <Heading as="h1" size="lg">
                    {displayTitle}
                </Heading>
                {canUseAdminTools && instanceId && (
                    <div className="flex gap-2">
                        <VersionedLink to={`/instance/${instanceId}/admin`}>
                            <Button intent="secondary" type="button">
                                {t("admin_data.edit_data")}
                            </Button>
                        </VersionedLink>
                        <VersionedLink to={`/instance/${instanceId}/jobs`}>
                            <Button intent="secondary" type="button">
                                {page.viewJobs}
                            </Button>
                        </VersionedLink>
                    </div>
                )}
            </div>
        </div>
    );
}

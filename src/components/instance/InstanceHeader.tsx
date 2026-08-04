import {Button} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
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

    const displayTitle =
        (typeof courseName === "string" ? courseName : l(courseName)) ||
        t("instance.workflowInstance");

    return (
        <PageHeader
            title={displayTitle}
            backLabel={t("home")}
            isLoading={isLoading}
            actions={
                canUseAdminTools &&
                instanceId && (
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
                )
            }
        />
    );
}

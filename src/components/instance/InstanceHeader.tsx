import {Button} from "@uva-fnwi/datanose-ui";

import {HighlightedFields} from "~/components/instance/HighlightedFields.tsx";
import {PostponeDeadlinesControl} from "~/components/instance/PostponeDeadlinesControl";
import {PageHeader} from "~/components/PageHeader";
import {VersionedLink} from "~/components/VersionedLink.tsx";
import {useJobTranslations} from "~/hooks/useJobTranslations";
import {useTranslate} from "~/hooks/useTranslate";
import type {WorkflowInstance} from "~/store/api/types/instances";
import {getLocalStringField, getStringField} from "~/utils/fieldUtils";

interface InstanceHeaderProps {
    instance?: WorkflowInstance;
    isLoading: boolean;
}

export function InstanceHeader({instance, isLoading}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");
    const {page} = useJobTranslations();

    const courseName = getLocalStringField(instance?.fields, "Course.Name");
    const studentName = getStringField(instance?.fields, "Student.DisplayName");
    const localizedCourseName = typeof courseName === "string" ? courseName : l(courseName);
    const displayTitle = localizedCourseName || t("instance.workflowInstance");

    return (
        <PageHeader
            title={displayTitle}
            backLabel={t("home")}
            isLoading={isLoading}
            actions={
                instance && (
                    <div className="flex flex-wrap gap-2">
                        <PostponeDeadlinesControl
                            instanceId={instance.id}
                            deadlines={instance.postponableDeadlines ?? []}
                            studentName={studentName || t("postpone.student")}
                            courseName={localizedCourseName || t("postpone.thesis")}
                        />
                        {instance.canUseAdminTools && (
                            <>
                                <VersionedLink to={`/instance/${instance.id}/admin`}>
                                    <Button intent="secondary" type="button">
                                        {t("admin_data.edit_data")}
                                    </Button>
                                </VersionedLink>
                                <VersionedLink to={`/instance/${instance.id}/jobs`}>
                                    <Button intent="secondary" type="button">
                                        {page.viewJobs}
                                    </Button>
                                </VersionedLink>
                            </>
                        )}
                    </div>
                )
            }
            description={<HighlightedFields instanceId={instance?.id} />}
        />
    );
}

import {useLocation} from "react-router";

import {Button} from "@uva-fnwi/datanose-ui";

import type {BreadcrumbItem} from "~/components/Breadcrumbs";
import {HighlightedFields} from "~/components/instance/HighlightedFields.tsx";
import {PageHeader} from "~/components/PageHeader";
import {VersionedLink} from "~/components/VersionedLink.tsx";
import {useJobTranslations} from "~/hooks/useJobTranslations";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";
import {overviewScreenUrl, primaryRegisterScreen, readFromScreen} from "~/utils/overviewEntries";

interface InstanceHeaderProps {
    title?: string | null;
    instanceId?: string;
    parentId?: string | null;
    workflowDefinition?: WorkflowDefinition;
    canUseAdminTools?: boolean;
    isLoading: boolean;
}

export function InstanceHeader({
    title,
    instanceId,
    parentId,
    workflowDefinition,
    canUseAdminTools = false,
    isLoading,
}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");
    const {page} = useJobTranslations();
    const location = useLocation();
    const {data: parent} = instancesEndpoints.getInstance.useQuery(parentId ?? "", {
        skip: !parentId,
    });

    const displayTitle = title || t("instance.workflowInstance");
    const fromScreen = parentId ? undefined : readFromScreen(location.state);
    const registerDefinition = parentId ? parent?.workflowDefinition : workflowDefinition;
    const fallbackScreen = registerDefinition
        ? primaryRegisterScreen(registerDefinition)
        : undefined;
    const registerScreen = fromScreen
        ? {
              name: fromScreen.screenName,
              title: fromScreen.title ?? null,
              definitionName: fromScreen.workflowDefinition,
          }
        : registerDefinition && fallbackScreen
          ? {
                name: fallbackScreen.name,
                title: fallbackScreen.title,
                definitionName: registerDefinition.name,
            }
          : null;

    const crumbs: BreadcrumbItem[] = [{to: "/", label: t("home")}];
    if (registerScreen) {
        crumbs.push({
            to: overviewScreenUrl(registerScreen.definitionName, registerScreen.name),
            label:
                l(registerScreen.title) ||
                (registerDefinition ? l(registerDefinition.titlePlural) : undefined) ||
                registerScreen.name,
        });
    }
    if (parentId) {
        crumbs.push({
            to: `/instance/${parentId}`,
            label: parent?.title || t("instance.parent"),
        });
    }

    return (
        <PageHeader
            title={displayTitle}
            crumbs={crumbs}
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
            description={<HighlightedFields instanceId={instanceId} />}
        />
    );
}

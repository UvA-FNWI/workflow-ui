import {Navigate, useParams} from "react-router";

import {Container, Grid, GridItem} from "@uva-fnwi/datanose-ui";

import {AdminCard} from "~/components/instance/AdminCard";
import {ContentCard} from "~/components/instance/ContentCard";
import {CorrespondenceCard} from "~/components/instance/CorrespondenceCard.tsx";
import {HistoryCard} from "~/components/instance/HistoryCard.tsx";
import {InfoCards} from "~/components/instance/InfoCard.tsx";
import {InstanceHeader} from "~/components/instance/InstanceHeader";
import {ProgressCard} from "~/components/instance/ProgressCard";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {useAppSelector} from "~/store/store";
import {getLocalStringField, getStringField} from "~/utils/fieldUtils";

function Instance() {
    const {id} = useParams<{id: string}>();
    const viewer = useAppSelector((state) =>
        [
            state.auth.currentUser?.userName,
            state.auth.userImpersonation?.targetUserName,
            state.auth.roleImpersonation?.instanceId,
            state.auth.roleImpersonation?.role.name,
        ].join("/"),
    );

    const isRoleImpersonating = useAppSelector(
        (state) => state.auth.roleImpersonation?.instanceId === id && id != null,
    );
    const {data: instance, isLoading} = instancesEndpoints.getInstance.useQuery(id ?? "", {
        skip: !id,
    });

    const studentName = getStringField(instance?.fields, "Student.DisplayName");
    useDocumentTitle(studentName);

    // Error state: early return when not loading and no instance
    if (!isLoading && !instance) {
        return <div>Error loading instance</div>;
    }

    const isPropertyOnly = instance && instance.workflowDefinition.isPropertyOnly;
    if (isPropertyOnly && instance.canUseAdminTools) {
        return <Navigate to={`/instance/${id}/admin`} replace />;
    }
    const unplacedPreviews = instance?.previewableForms?.filter((form) => !form.step) ?? [];
    const unplacedPreviewsInAdminCard = instance?.canUseAdminTools && !isRoleImpersonating;
    const previewViewer = `${id}/${viewer}/${instance?.viewerRoles.join(",")}`;
    const courseName = getLocalStringField(instance?.fields, "Course.Name");
    const progressCard = instance?.infoCards?.find((card) => card.type === "Progress");
    const infoCards = instance?.infoCards?.filter((card) => card.type !== "Progress") ?? [];

    return (
        <Container maxWidth={1280}>
            <InstanceHeader
                key={previewViewer}
                courseName={courseName}
                instanceId={id}
                pinnedActions={instance?.pinnedActions ?? []}
                previewableForms={unplacedPreviewsInAdminCard ? [] : unplacedPreviews}
                isLoading={isLoading}
            />
            <Grid>
                <GridItem span={{base: 12, md: 9}} className="flex flex-col gap-8">
                    <ProgressCard
                        isLoading={isLoading}
                        card={progressCard}
                        steps={instance?.steps ?? []}
                        currentStep={instance?.currentStep ?? ""}
                    />
                    <ContentCard key={previewViewer} instance={instance} isLoading={isLoading} />
                    {instance?.permissions.includes("ViewCorrespondence") && id && (
                        <CorrespondenceCard instanceId={id} />
                    )}
                    {instance?.permissions.includes("ViewHistory") && id && (
                        <HistoryCard instanceId={id} />
                    )}
                </GridItem>
                <GridItem span={{base: 12, md: 3}} className="flex flex-col gap-6">
                    <InfoCards cards={infoCards} instanceId={id ?? ""} isLoading={isLoading} />
                    {(instance?.canUseAdminTools || instance?.canImpersonate) && (
                        <AdminCard
                            key={previewViewer}
                            previewableForms={unplacedPreviewsInAdminCard ? unplacedPreviews : []}
                            canUseAdminTools={instance.canUseAdminTools}
                            canImpersonate={instance.canImpersonate}
                        />
                    )}
                </GridItem>
            </Grid>
        </Container>
    );
}

export default Instance;

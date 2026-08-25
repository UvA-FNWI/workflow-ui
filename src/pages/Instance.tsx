import {Navigate, useParams} from "react-router";

import {Container, Grid, GridItem} from "@uva-fnwi/datanose-ui";

import {AdminCard} from "~/components/instance/AdminCard";
import {ContentCard} from "~/components/instance/ContentCard";
import {InfoCards} from "~/components/instance/InfoCard.tsx";
import {InstanceHeader} from "~/components/instance/InstanceHeader";
import {ProgressCard} from "~/components/instance/ProgressCard";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {getLocalStringField, getStringField} from "~/utils/fieldUtils";

function Instance() {
    const {id} = useParams<{id: string}>();

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
    const courseName = getLocalStringField(instance?.fields, "Course.Name");

    return (
        <Container maxWidth={1280}>
            <InstanceHeader
                courseName={courseName}
                instanceId={id}
                canUseAdminTools={instance?.canUseAdminTools ?? false}
                isLoading={isLoading}
            />
            <Grid>
                <GridItem span={{base: 12, sm: 9}} className="flex flex-col gap-8">
                    <ProgressCard
                        isLoading={isLoading}
                        isStudent={instance?.viewerRoles?.includes("Student") ?? false}
                        steps={instance?.steps ?? []}
                        currentStep={instance?.currentStep ?? ""}
                    />
                    <ContentCard instance={instance} isLoading={isLoading} />
                </GridItem>
                <GridItem span={{base: 12, sm: 3}} className="flex flex-col gap-6">
                    <InfoCards
                        cards={instance?.infoCards ?? []}
                        instanceId={id ?? ""}
                        isLoading={isLoading}
                    />
                    {instance?.canImpersonate && <AdminCard />}
                    {/* TODO: When we have more admin functionality, we can differentiate more between impersonate and canUseAdminTools*/}
                </GridItem>
            </Grid>
        </Container>
    );
}

export default Instance;

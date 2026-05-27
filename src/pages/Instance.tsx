import {useParams} from "react-router";

import {Container, Grid, GridItem} from "@uva-fnwi/datanose-ui";

import {AdminCard} from "~/components/instance/AdminCard";
import {ContentCard} from "~/components/instance/ContentCard";
import {InfoCards} from "~/components/instance/InfoCards";
import {InstanceHeader} from "~/components/instance/InstanceHeader";
import {ProgressCard} from "~/components/instance/ProgressCard";
import {StudentCard} from "~/components/instance/StudentCard";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {getLocalStringField, getStringField} from "~/utils/fieldUtils";

function Instance() {
    const {id} = useParams<{id: string}>();

    const {data: instance, isLoading} = instancesEndpoints.getInstance.useQuery(id ?? "", {
        skip: !id,
    });

    // Error state: early return when not loading and no instance
    if (!isLoading && !instance) {
        return <div>Error loading instance</div>;
    }

    const studentEmail = getStringField(instance?.fields, "Student.Email");
    const studentName = getStringField(instance?.fields, "Student.DisplayName");
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
                    <StudentCard
                        studentEmail={studentEmail}
                        studentName={studentName}
                        isLoading={isLoading}
                    />
                    <InfoCards isLoading={isLoading} />
                    {instance?.canUseAdminTools && <AdminCard />}
                </GridItem>
            </Grid>
        </Container>
    );
}

export default Instance;

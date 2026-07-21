import {useParams} from "react-router";

import {Container, Grid, GridItem} from "@uva-fnwi/datanose-ui";

import {AdminCard} from "~/components/instance/AdminCard";
import {ContentCard} from "~/components/instance/ContentCard";
import {InfoCards} from "~/components/instance/InfoCards";
import {InstanceHeader} from "~/components/instance/InstanceHeader";
import {ProgressCard} from "~/components/instance/ProgressCard";
import {StudentCard} from "~/components/instance/StudentCard";
import {StaffCard} from "~/components/StaffCard/StaffCard.tsx";
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
    const canEdit = instance?.permissions.some((permission) =>
        ["Edit", "ViewAdminTools"].includes(permission),
    );
    const studentEmail = getStringField(instance?.fields, "Student.Email");
    const courseName = getLocalStringField(instance?.fields, "Course.Name");

    const currentStepActions = instance
        ? instance.actions.filter((a) => a.steps.includes(instance.currentStep ?? ""))
        : null;
    const openFormAction = currentStepActions?.find((a) => a.type === "SubmitForm");

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
                    <StaffCard
                        instanceId={id ?? ""}
                        relatedUserGroups={instance?.relatedUserGroups?.groups ?? []}
                        canEdit={canEdit}
                    />
                    <InfoCards isLoading={isLoading} fields={instance?.fields} />
                    {instance?.canImpersonate && (
                        <AdminCard
                            instanceId={instance.id}
                            canUseAdminTools={instance.canUseAdminTools}
                            submissionId={openFormAction?.form}
                        />
                    )}
                    {/* TODO: When we have more admin functionality, we can differentiate more between impersonate and canUseAdminTools*/}
                </GridItem>
            </Grid>
        </Container>
    );
}

export default Instance;

import {Navigate, useParams} from "react-router";

import {Card, Container, Heading, Skeleton, Text} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {InstancePropertyRow} from "~/components/instance/InstancePropertyRow";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi";

/** Admin view for reading and editing instance properties. */
function InstanceAdmin() {
    const {id = ""} = useParams<{id: string}>();
    const {t} = useTranslate("workflow", {keyPrefix: "admin_data"});

    const {data, isLoading, error} = instancesEndpoints.getInstanceProperties.useQuery(id);
    const {data: instance, isLoading: isLoadingInstance} =
        instancesEndpoints.getInstance.useQuery(id);
    const [saveProperty] = instancesEndpoints.saveInstanceProperty.useMutation();

    const displayTitle = instance?.title || t("title");
    useDocumentTitle(`${displayTitle} | ${t("title")}`);

    if (instance && !instance.canUseAdminTools) {
        return <Navigate to={`/instance/${id}`} replace />;
    }

    let content;
    // Wait for permissions before showing an API error.
    if (isLoading || isLoadingInstance) {
        content = <Skeleton className="h-64 w-full" />;
    } else if (error) {
        content = <Text intent="error">{t("load_error")}</Text>;
    } else if (!data?.properties.length) {
        content = <Text intent="secondary">{t("no_properties")}</Text>;
    } else {
        content = (
            <div className="flex flex-col gap-4">
                {data.properties.map((question) => (
                    <InstancePropertyRow
                        key={question.name}
                        question={question}
                        path={question.name}
                        values={data.values}
                        onSave={(path, value) => saveProperty({instanceId: id, path, value})}
                    />
                ))}
            </div>
        );
    }

    return (
        <Container maxWidth={1280}>
            <div className="mb-8 flex flex-col gap-2">
                {instance?.workflowDefinition.hasSteps && (
                    <BackLink to={`/instance/${id}`}>{t("back_to_instance")}</BackLink>
                )}
                <Heading as="h1" size="lg">
                    {displayTitle} | {t("title")}
                </Heading>
                <Text size="sm" intent="secondary">
                    {t("description")}
                </Text>
            </div>
            <Card>{content}</Card>
        </Container>
    );
}

export default InstanceAdmin;

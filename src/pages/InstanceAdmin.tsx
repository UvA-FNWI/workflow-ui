import {Navigate, useParams} from "react-router";

import {Card, Container, Heading, Skeleton, Text} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {InstancePropertyRow} from "~/components/instance/InstancePropertyRow";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi";
import type {WorkflowInstance} from "~/store/api/types/instances";

function formNameForChoices(instance: WorkflowInstance | undefined, questionName: string) {
    const submitted = instance?.submissions.find((s) =>
        s.form.pages.some((p) => p.questions.some((q) => q.name === questionName)),
    )?.id;
    if (submitted) return submitted;
    return instance?.actions.find((action) => action.form)?.form ?? instance?.submissions[0]?.id;
}

/** Admin view for reading and editing instance properties. */
function InstanceAdmin() {
    const {id = ""} = useParams<{id: string}>();
    const {t} = useTranslate("workflow", {keyPrefix: "admin_data"});

    const {data, isLoading, error} = instancesEndpoints.getInstanceProperties.useQuery(id);
    const {data: instance, isLoading: isLoadingInstance} =
        instancesEndpoints.getInstance.useQuery(id);
    const [saveProperty] = instancesEndpoints.saveInstanceProperty.useMutation();

    const isPropertyOnly = instance && instance.workflowDefinition.isPropertyOnly;
    const displayTitle = instance?.title ? `${instance.title} | ${t("title")}` : t("title");

    useDocumentTitle(displayTitle);

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
                {data.properties.map((question) => {
                    const submissionId = formNameForChoices(instance, question.name);
                    return (
                        <InstancePropertyRow
                            instanceId={id}
                            submissionId={submissionId}
                            key={question.name}
                            question={question}
                            path={question.name}
                            values={data.values}
                            onSave={(path, value) => saveProperty({instanceId: id, path, value})}
                        />
                    );
                })}
            </div>
        );
    }

    return (
        <Container maxWidth={1280}>
            <div className="mb-8 flex flex-col gap-2">
                {instance && (
                    <BackLink to={isPropertyOnly ? "/" : `/instance/${id}`}>
                        {t(isPropertyOnly ? "back_to_overview" : "back_to_instance")}
                    </BackLink>
                )}
                <Heading as="h1" size="lg">
                    {displayTitle}
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

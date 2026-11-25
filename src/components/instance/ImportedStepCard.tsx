import {Card, Heading, Text} from "@uva-fnwi/datanose-ui";

import {StepCard} from "~/components/instance/StepCard";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesApi} from "~/store/api/instancesApi";
import type {WorkflowStep} from "~/store/api/types/instances";

export function ImportedStepCard({step}: {step: WorkflowStep}) {
    const {t, l} = useTranslate("workflow");
    const source = step.importedFrom;
    const {data, isLoading, isFetching, isError} = instancesApi.endpoints.getInstance.useQuery(
        source?.instanceId ?? "",
        {skip: !source || step.importStatus !== "Available"},
    );
    const sourceStep = data?.steps.find((candidate) => candidate.id === source?.stepId);

    if (
        step.importStatus === "Available" &&
        source &&
        data?.id === source.instanceId &&
        sourceStep &&
        !isError
    ) {
        return (
            <StepCard
                key={source.instanceId}
                step={sourceStep}
                instance={data}
                sharedParticipants={source.participants}
            />
        );
    }

    return (
        <Card>
            <Heading as="h2" size="md" className="font-semibold">
                {l(step.title)}
            </Heading>
            <Text className="mt-2">
                {t(
                    isLoading || isFetching
                        ? "instance.shared_loading"
                        : step.importStatus === "Restricted"
                          ? "instance.shared_restricted"
                          : "instance.shared_unavailable",
                )}
            </Text>
        </Card>
    );
}

import {Card, Skeleton} from "@datanose/ui";

import {StepCard} from "~/components/instance/StepCard";
import type {WorkflowInstance} from "~/store/api/types/instances";

interface ContentCardProps {
    isLoading: boolean;
    instance?: WorkflowInstance;
}

export function ContentCard({instance, isLoading}: ContentCardProps) {
    if (isLoading)
        return (
            <Card>
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </Card>
        );

    return (
        <>
            {instance?.steps
                .slice()
                .reverse()
                .map((step) => (
                    <StepCard step={step} instance={instance} key={step.id} />
                ))}
        </>
    );
}

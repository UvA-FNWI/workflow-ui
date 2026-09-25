import {Card, Heading, Separator, Skeleton} from "@uva-fnwi/datanose-ui";

import {WorkflowProgressBar} from "~/components/WorkflowProgressBar";
import {useTranslate} from "~/hooks/useTranslate";
import type {InfoCard, WorkflowStep} from "~/store/api/types/instances";

interface ProgressCardProps {
    card: InfoCard | undefined;
    isLoading: boolean;
    steps: WorkflowStep[];
    currentStep: string;
}

export function ProgressCard({card, isLoading, steps, currentStep}: ProgressCardProps) {
    const {l} = useTranslate("workflow");

    if (isLoading) {
        return (
            <Card>
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-6 w-32" />
                    <Separator />
                    <Skeleton className="my-4 h-4" />
                </div>
            </Card>
        );
    }

    if (card === undefined || card.type !== "Progress") return null;

    return (
        <Card>
            <div className="flex flex-col gap-4">
                <Heading as="h2" className="font-semibold">
                    {l(card.title)}
                </Heading>
                <Separator className="mt-2" />
                <WorkflowProgressBar steps={steps} currentStep={currentStep} />
            </div>
        </Card>
    );
}

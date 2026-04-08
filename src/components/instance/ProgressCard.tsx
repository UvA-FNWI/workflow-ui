import {Card, Heading, Separator, Skeleton} from "@datanose/ui";

import {WorkflowProgressBar} from "~/components/WorkflowProgressBar";
import {useTranslate} from "~/hooks/useTranslate";
import type {WorkflowStep} from "~/store/api/types/instances";

interface ProgressCardProps {
    isLoading: boolean;
    isStudent: boolean;
    steps: WorkflowStep[];
    currentStep: string;
}

export function ProgressCard({isLoading, isStudent, steps, currentStep}: ProgressCardProps) {
    const {t} = useTranslate("workflow");

    return (
        <Card>
            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-6 w-32" />
                        <Separator />
                        <div className="flex items-center gap-8">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-4">
                            <Heading as="h2">
                                {t(
                                    isStudent
                                        ? "progress.titleStudent"
                                        : "progress.titleSupervisor",
                                )}
                            </Heading>
                            <Separator className="mt-2" />
                        </div>
                        <WorkflowProgressBar steps={steps} currentStep={currentStep} />
                    </>
                )}
            </div>
        </Card>
    );
}

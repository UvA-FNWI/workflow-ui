import {Card, Heading, Separator, Skeleton, Text} from "@datanose/ui";

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
                        <Heading as="h2">{t("progress.title")}</Heading>
                        <Separator />
                        <div className="flex items-center gap-8">
                            <Text className="whitespace-nowrap">
                                {t(
                                    isStudent
                                        ? "progress.labelStudent"
                                        : "progress.labelSupervisor",
                                )}
                                :
                            </Text>
                            <WorkflowProgressBar steps={steps} currentStep={currentStep} />
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}

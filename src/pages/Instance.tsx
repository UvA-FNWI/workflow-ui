import {Link, useParams} from "react-router";

import {Card, Heading, Separator, Skeleton, Text} from "@datanose/ui";

import {WorkflowProgressBar} from "~/components/WorkflowProgressBar";
import {useTranslate} from "~/hooks/useTranslate";
import {StepCard} from "~/pages/StepCard.tsx";
import {instancesEndpoints} from "~/store/api/instancesApi";

function Instance() {
    const {id} = useParams<{id: string}>();
    const {t} = useTranslate("workflow");

    const {data: instance, isLoading} = instancesEndpoints.getInstance.useQuery(id ?? "", {
        skip: !id,
    });

    // Error state: early return when not loading and no instance
    if (!isLoading && !instance) {
        return <div>Error loading instance</div>;
    }

    return (
        <div className="">
            {/* Title */}
            {isLoading ? (
                <Skeleton className="mb-8 h-8 w-48" />
            ) : (
                <>
                    <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                        Go back
                    </Link>
                    <Text size="2xl" className="mb-8">
                        Instance {id}
                    </Text>
                </>
            )}
            {/* Progress */}
            <div className="flex flex-col gap-6 sm:grid sm:grid-cols-6">
                <div className="col-span-4 flex flex-col gap-8">
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
                                    <Heading>{t("progress.title")}</Heading>
                                    <Separator />
                                    <div className="flex items-center gap-8">
                                        <Text className="whitespace-nowrap">
                                            {t("progress.label")}
                                        </Text>
                                        <WorkflowProgressBar />
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                    {/* Content */}
                    {isLoading && (
                        <Card>
                            <div className="flex flex-col gap-4">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </Card>
                    )}
                    {instance?.steps.map((step) => (
                        <StepCard step={step} instance={instance} key={step.id} />
                    ))}
                </div>
                <div className="col-span-2 flex flex-col gap-6">
                    {/* Student info */}
                    <Card className="flex flex-col items-center">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <Skeleton className="mt-4 h-5 w-32" />
                            </>
                        ) : (
                            <>
                                <div className="inline-block h-16 w-16 rounded-full bg-gray-200 align-middle" />
                                <Heading size="sm">Naam student</Heading>
                            </>
                        )}
                    </Card>
                    {/* Info cards */}
                    <Card>
                        {isLoading ? (
                            <Skeleton className="h-5 w-28" />
                        ) : (
                            <Heading size="sm">{t("good_to_know.title")}</Heading>
                        )}
                    </Card>
                    <Card>
                        {isLoading ? (
                            <Skeleton className="h-5 w-24" />
                        ) : (
                            <Heading size="sm">{t("first_help.title")}</Heading>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Instance;
